'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, MapPin, Loader2, Crosshair } from 'lucide-react';

interface MapPinPickerProps {
  latitude: number;
  longitude: number;
  onChangeLocation: (lat: number, lng: number, address?: string, city?: string, country?: string) => void;
}

export function MapPinPicker({
  latitude,
  longitude,
  onChangeLocation,
}: MapPinPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialLat = latitude || -1.9536; // Kigali
    const initialLng = longitude || 30.0924; // Kigali

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY;
    const tileUrl = cartoKey
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoKey}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background: #0284c7;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
          cursor: grab;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 15px;
            font-weight: bold;
          ">⚡</div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });

    const marker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      handleUpdateLocation(pos.lat, pos.lng);
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      handleUpdateLocation(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker position if coordinates change externally
  useEffect(() => {
    if (markerRef.current && mapRef.current && latitude && longitude) {
      const current = markerRef.current.getLatLng();
      if (Math.abs(current.lat - latitude) > 0.0001 || Math.abs(current.lng - longitude) > 0.0001) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapRef.current.panTo([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  // Reverse geocodes coordinates to auto-fill address
  const handleUpdateLocation = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      const json = await res.json();
      if (json.success && json.data) {
        onChangeLocation(lat, lng, json.data.address, json.data.city, json.data.country);
      } else {
        onChangeLocation(lat, lng);
      }
    } catch (e) {
      onChangeLocation(lat, lng);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Search Address inside Picker
  const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSearchResults(json.data);
        setShowDropdown(true);
      }
    } catch (e) {
      console.warn('Picker search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: any) => {
    const lat = item.latitude;
    const lng = item.longitude;

    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.flyTo([lat, lng], 15);
    }

    onChangeLocation(lat, lng, item.display_name, item.city, item.country);
    setShowDropdown(false);
    setSearchQuery(item.display_name.split(',')[0]);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Top Address Search inside Picker (div container to prevent nested form) */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              placeholder="Search Kigali address or landmark to drop pin..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Find'}
          </button>
        </div>

        {/* Dropdown search results */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-xs">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-slate-50 transition-colors"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand-600" />
                <span className="truncate text-slate-700">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Pin Box */}
      <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Help Overlay Badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur-sm border border-slate-200/80">
          <Crosshair className="h-3 w-3 text-brand-600" />
          <span>Click map or drag pin to position</span>
          {isReverseGeocoding && <Loader2 className="h-3 w-3 animate-spin text-brand-600 ml-1" />}
        </div>
      </div>

      {/* Coordinate Displays */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
            Latitude
          </span>
          <span className="font-semibold text-slate-800">{latitude?.toFixed(6) || '-1.953600'}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
            Longitude
          </span>
          <span className="font-semibold text-slate-800">{longitude?.toFixed(6) || '30.092400'}</span>
        </div>
      </div>
    </div>
  );
}
