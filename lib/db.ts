import { INITIAL_STATIONS } from './mockData';
import { isCoordinateInBounds } from './spatial';
import { isSupabaseConfigured, supabase } from './supabase';
import { BoundingBox, Connector, Station, StationFilter } from './types';

// Global singleton in-memory data store for persistent local development across API routes
const globalForEV = globalThis as unknown as {
  __evchargers_stations?: Station[];
};

if (!globalForEV.__evchargers_stations) {
  globalForEV.__evchargers_stations = [...INITIAL_STATIONS];
}

function getLocalStore(): Station[] {
  if (!globalForEV.__evchargers_stations) {
    globalForEV.__evchargers_stations = [...INITIAL_STATIONS];
  }
  return globalForEV.__evchargers_stations;
}

function setLocalStore(stations: Station[]) {
  globalForEV.__evchargers_stations = stations;
}

export async function getStations(params?: {
  bounds?: BoundingBox;
  filters?: StationFilter;
}): Promise<Station[]> {
  const { bounds, filters } = params || {};

  // If Supabase is connected, query Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      if (bounds) {
        const { data, error } = await supabase.rpc('get_stations_in_bounds', {
          min_lng: bounds.minLng,
          min_lat: bounds.minLat,
          max_lng: bounds.maxLng,
          max_lat: bounds.maxLat,
        });

        if (!error && data) {
          return applyFilters(data as Station[], filters);
        }
      }

      // Fallback to table query with connectors join
      const { data, error } = await supabase
        .from('stations')
        .select('*, connectors(*)');

      if (!error && data) {
        let stations = data as Station[];
        if (bounds) {
          stations = stations.filter((s) =>
            isCoordinateInBounds(s.latitude, s.longitude, bounds)
          );
        }
        return applyFilters(stations, filters);
      }
    } catch (e) {
      console.warn('Supabase query failed, falling back to local store:', e);
    }
  }

  // Local In-Memory Data Store
  let results = [...getLocalStore()];

  if (bounds) {
    results = results.filter((s) =>
      isCoordinateInBounds(s.latitude, s.longitude, bounds)
    );
  }

  return applyFilters(results, filters);
}

function applyFilters(stations: Station[], filters?: StationFilter): Station[] {
  if (!filters) return stations;

  return stations.filter((station) => {
    // Filter by user ownership (for non-admin hosts)
    if (filters.userEmail) {
      const qEmail = filters.userEmail.toLowerCase().trim();
      const stationEmail = (station.user_email || '').toLowerCase().trim();
      if (stationEmail !== qEmail) {
        return false;
      }
    }
    if (filters.userId) {
      if (!station.user_id || station.user_id !== filters.userId) {
        return false;
      }
    }

    // Filter by search text
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matchName = station.name.toLowerCase().includes(q);
      const matchAddress = station.address.toLowerCase().includes(q);
      const matchOperator = station.operator_name.toLowerCase().includes(q);
      const matchCity = station.city?.toLowerCase().includes(q);
      if (!matchName && !matchAddress && !matchOperator && !matchCity) {
        return false;
      }
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(station.status)) {
        return false;
      }
    }

    // Filter by free pricing
    if (filters.isFree !== undefined && filters.isFree) {
      if (!station.is_free) {
        return false;
      }
    }

    // Filter by connector types
    if (filters.connectorTypes && filters.connectorTypes.length > 0) {
      const hasMatchingConnector = station.connectors?.some((c) =>
        filters.connectorTypes!.includes(c.connector_type)
      );
      if (!hasMatchingConnector) {
        return false;
      }
    }

    // Filter by minimum power (kW)
    if (filters.minPowerKw && filters.minPowerKw > 0) {
      const hasMatchingPower = station.connectors?.some(
        (c) => c.power_kw >= filters.minPowerKw!
      );
      if (!hasMatchingPower) {
        return false;
      }
    }

    return true;
  });
}

export async function getStationById(id: string): Promise<Station | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*, connectors(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        return data as Station;
      }
    } catch (e) {
      console.warn('Supabase getStationById error:', e);
    }
  }

  return getLocalStore().find((s) => s.id === id) || null;
}

export async function createStation(
  stationData: Omit<Station, 'id' | 'created_at' | 'updated_at'> & {
    connectors?: Omit<Connector, 'id' | 'station_id'>[];
  }
): Promise<Station> {
  const newId = `st-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date().toISOString();

  const formattedConnectors: Connector[] = (stationData.connectors || []).map(
    (c, idx) => ({
      id: `c-${newId}-${idx + 1}`,
      station_id: newId,
      connector_type: c.connector_type,
      power_kw: Number(c.power_kw) || 22,
      quantity: Number(c.quantity) || 1,
      status: c.status || 'AVAILABLE',
      current_type: c.current_type || (Number(c.power_kw) > 22 ? 'DC' : 'AC'),
    })
  );

  const newStation: Station = {
    ...stationData,
    id: newId,
    latitude: Number(stationData.latitude),
    longitude: Number(stationData.longitude),
    user_id: stationData.user_id || 'usr-admin-01',
    user_email: stationData.user_email || 'admin@evchargers.rw',
    connectors: formattedConnectors,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { connectors, ...stationFields } = newStation;
      const { data: insertedStation, error: sErr } = await supabase
        .from('stations')
        .insert({
          name: stationFields.name,
          address: stationFields.address,
          city: stationFields.city,
          country: stationFields.country,
          latitude: stationFields.latitude,
          longitude: stationFields.longitude,
          operator_name: stationFields.operator_name,
          status: stationFields.status,
          pricing_info: stationFields.pricing_info,
          is_free: stationFields.is_free,
          access_type: stationFields.access_type,
          amenities: stationFields.amenities,
          notes: stationFields.notes,
          user_id: stationFields.user_id,
          user_email: stationFields.user_email,
        })
        .select()
        .single();

      if (!sErr && insertedStation) {
        if (connectors && connectors.length > 0) {
          const connectorsToInsert = connectors.map((c) => ({
            station_id: insertedStation.id,
            connector_type: c.connector_type,
            power_kw: c.power_kw,
            quantity: c.quantity,
            status: c.status,
            current_type: c.current_type,
          }));
          await supabase.from('connectors').insert(connectorsToInsert);
        }
        return getStationById(insertedStation.id) as Promise<Station>;
      }
    } catch (e) {
      console.warn('Supabase createStation failed, saving locally:', e);
    }
  }

  // Update global store
  const store = getLocalStore();
  const updatedStore = [newStation, ...store];
  setLocalStore(updatedStore);

  return newStation;
}

export async function updateStation(
  id: string,
  updates: Partial<Station>
): Promise<Station | null> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { connectors, ...stationFields } = updates;
      const { error } = await supabase
        .from('stations')
        .update({
          ...stationFields,
          updated_at: now,
        })
        .eq('id', id);

      if (!error) {
        if (connectors) {
          await supabase.from('connectors').delete().eq('station_id', id);
          if (connectors.length > 0) {
            await supabase.from('connectors').insert(
              connectors.map((c) => ({
                station_id: id,
                connector_type: c.connector_type,
                power_kw: c.power_kw,
                quantity: c.quantity,
                status: c.status,
                current_type: c.current_type,
              }))
            );
          }
        }
        return getStationById(id);
      }
    } catch (e) {
      console.warn('Supabase updateStation failed, updating locally:', e);
    }
  }

  const store = getLocalStore();
  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  store[idx] = {
    ...store[idx],
    ...updates,
    updated_at: now,
  };
  setLocalStore([...store]);

  return store[idx];
}

export async function deleteStation(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('stations').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase deleteStation failed:', e);
    }
  }

  const store = getLocalStore();
  const initialLen = store.length;
  const filtered = store.filter((s) => s.id !== id);
  setLocalStore(filtered);
  return filtered.length < initialLen;
}

export function resetToSeedData(): Station[] {
  setLocalStore([...INITIAL_STATIONS]);
  return getLocalStore();
}
