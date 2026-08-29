'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { BoundingBox, Station } from '@/lib/types';
import { createStationIcon } from './StationMarker';
import { Navigation, Plus, Minus, Loader2 } from 'lucide-react';

interface EVMapProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station | null) => void;
  onBoundsChange?: (bounds: BoundingBox) => void;
  flyToLocation?: { lat: number; lng: number } | null;
  initialCenter?: [number, number]; // [lng, lat]
  initialZoom?: number;
}

export function EVMap({
  stations,
  selectedStation,
  onSelectStation,
  onBoundsChange,
  flyToLocation,
  initialCenter = [30.0880, -1.9536], // Default to Kigali, Rwanda [lng, lat]
  initialZoom = 13,
}: EVMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Leaflet takes [latitude, longitude]
    const map = L.map(mapContainerRef.current, {
      center: [initialCenter[1], initialCenter[0]],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
    });

    // High-resolution crisp CARTO Voyager tiles
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    mapRef.current = map;
    setMapLoaded(true);

    const emitBounds = () => {
      if (!onBoundsChange) return;
      const b = map.getBounds();
      onBoundsChange({
        minLng: b.getWest(),
        minLat: b.getSouth(),
        maxLng: b.getEast(),
        maxLat: b.getNorth(),
      });
    };

    map.on('moveend', emitBounds);
    emitBounds();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers when stations or selection change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const currentStationIds = new Set(stations.map((s) => s.id));

    // Remove old markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentStationIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    stations.forEach((station) => {
      const isSelected = selectedStation?.id === station.id;
      const icon = createStationIcon(station, isSelected);
      const existingMarker = markersRef.current[station.id];

      if (existingMarker) {
        existingMarker.setIcon(icon);
        existingMarker.setLatLng([station.latitude, station.longitude]);
      } else {
        const marker = L.marker([station.latitude, station.longitude], { icon })
          .addTo(map)
          .on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onSelectStation(station);
            map.flyTo([station.latitude, station.longitude], Math.max(map.getZoom(), 14), {
              duration: 0.8,
            });
          });

        markersRef.current[station.id] = marker;
      }
    });
  }, [stations, selectedStation, mapLoaded, onSelectStation]);

  // Center map on selected station when chosen from list or search
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStation) return;

    map.flyTo([selectedStation.latitude, selectedStation.longitude], Math.max(map.getZoom(), 15), {
      duration: 0.8,
    });
  }, [selectedStation]);

  // Fly to location if search result picked
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToLocation) return;

    map.flyTo([flyToLocation.lat, flyToLocation.lng], Math.max(map.getZoom(), 15), {
      duration: 0.8,
    });
  }, [flyToLocation]);

  // User Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const map = mapRef.current;
        if (!map) return;

        const userDotIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div class="user-location-dot"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userDotIcon }).addTo(
            map
          );
        }

        map.flyTo([latitude, longitude], 14, { duration: 1.0 });
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        alert('Could not access your location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Floating Map Controls (Stacked cleanly above the bottom-right AI Chatbot) */}
      <div className="absolute right-4 sm:right-6 bottom-24 sm:bottom-24 z-20 flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Locate my position"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md transition-all hover:bg-slate-50 hover:text-brand-600 active:scale-95 disabled:opacity-50 border border-slate-200/80"
        >
          {isLocating ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          ) : (
            <Navigation className="h-5 w-5 fill-slate-100" />
          )}
        </button>

        <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md border border-slate-200/80">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex h-10 w-11 items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-brand-600 active:bg-slate-100 border-b border-slate-100"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex h-10 w-11 items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-brand-600 active:bg-slate-100"
          >
            <Minus className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
