'use client';

import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { BoundingBox, Station } from '@/lib/types';
import { Navigation, Plus, Minus, Loader2, Key, ExternalLink } from 'lucide-react';

interface GoogleEVMapProps {
  stations: Station[];
  selectedStation: Station | null;
  onSelectStation: (station: Station | null) => void;
  onBoundsChange?: (bounds: BoundingBox) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
}

export function GoogleEVMap({
  stations,
  selectedStation,
  onSelectStation,
  onBoundsChange,
  initialCenter = { lat: -1.9536, lng: 30.0880 }, // Kigali, Rwanda
  initialZoom = 13,
}: GoogleEVMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [id: string]: google.maps.Marker }>({});
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Initialize Google Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!apiKey) {
      setApiKeyError(true);
      return;
    }

    setOptions({
      key: apiKey,
      v: 'weekly',
    });

    importLibrary('maps')
      .then(async (mapsLib) => {
        const { Map } = mapsLib;

        const map = new Map(mapContainerRef.current!, {
          center: initialCenter,
          zoom: initialZoom,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'transit',
              elementType: 'labels.icon',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        mapRef.current = map;
        setMapLoaded(true);

        const emitBounds = () => {
          if (!onBoundsChange) return;
          const bounds = map.getBounds();
          if (bounds) {
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            onBoundsChange({
              minLng: sw.lng(),
              minLat: sw.lat(),
              maxLng: ne.lng(),
              maxLat: ne.lat(),
            });
          }
        };

        map.addListener('idle', emitBounds);
      })
      .catch((err) => {
        console.warn('Google Maps Load Error:', err);
        setApiKeyError(true);
      });
  }, [apiKey]);

  // Helper to create custom SVG icon for Google Maps
  const createGoogleMarkerIcon = (station: Station, isSelected: boolean) => {
    const maxPower = station.connectors?.length
      ? Math.max(...station.connectors.map((c) => c.power_kw))
      : 0;

    let bgColor = '#10b981'; // Emerald (Active)
    if (station.status === 'MAINTENANCE') {
      bgColor = '#f59e0b'; // Amber
    } else if (station.status === 'OFFLINE') {
      bgColor = '#ef4444'; // Red
    } else if (maxPower >= 150) {
      bgColor = '#059669'; // Ultra-Fast
    }

    if (isSelected) {
      bgColor = '#0284c7'; // Electric Blue
    }

    const labelText = maxPower > 0 ? `${maxPower}k` : 'EV';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="56" height="38" viewBox="0 0 56 38">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <rect x="3" y="3" width="50" height="24" rx="12" fill="${bgColor}" stroke="#ffffff" stroke-width="2"/>
          <polygon points="28,33 23,26 33,26" fill="${bgColor}"/>
          <text x="18" y="19" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="bold" fill="#ffffff">⚡</text>
          <text x="27" y="19" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="bold" fill="#ffffff">${labelText}</text>
        </g>
      </svg>
    `;

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      scaledSize: new google.maps.Size(56, 38),
      anchor: new google.maps.Point(28, 35),
    };
  };

  // Render & Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || typeof google === 'undefined') return;

    const currentStationIds = new Set(stations.map((s) => s.id));

    // Remove deleted markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentStationIds.has(id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    stations.forEach((station) => {
      const isSelected = selectedStation?.id === station.id;
      const icon = createGoogleMarkerIcon(station, isSelected);
      const position = { lat: station.latitude, lng: station.longitude };

      const existingMarker = markersRef.current[station.id];

      if (existingMarker) {
        existingMarker.setIcon(icon);
        existingMarker.setPosition(position);
        existingMarker.setZIndex(isSelected ? 1000 : 10);
      } else {
        const marker = new google.maps.Marker({
          position,
          map,
          icon,
          title: station.name,
          zIndex: isSelected ? 1000 : 10,
        });

        marker.addListener('click', () => {
          onSelectStation(station);
          map.panTo(position);
          if (map.getZoom()! < 14) {
            map.setZoom(14);
          }
        });

        markersRef.current[station.id] = marker;
      }
    });
  }, [stations, selectedStation, mapLoaded, onSelectStation]);

  // Center on selected station
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStation) return;

    map.panTo({ lat: selectedStation.latitude, lng: selectedStation.longitude });
    if (map.getZoom()! < 14) {
      map.setZoom(14);
    }
  }, [selectedStation]);

  // Locate Me Button
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapRef.current || typeof google === 'undefined') {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const map = mapRef.current;
        if (!map) return;

        const position = { lat: latitude, lng: longitude };

        const userSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#0284c7" fill-opacity="0.3"/>
            <circle cx="12" cy="12" r="6" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
          </svg>
        `;

        const userIcon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(userSvg)}`,
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
        };

        if (userMarkerRef.current) {
          userMarkerRef.current.setPosition(position);
        } else {
          userMarkerRef.current = new google.maps.Marker({
            position,
            map,
            icon: userIcon,
            zIndex: 999,
          });
        }

        map.panTo(position);
        map.setZoom(14);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        alert('Could not access your location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleZoomIn = () => {
    const map = mapRef.current;
    if (map) map.setZoom((map.getZoom() || 13) + 1);
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (map) map.setZoom((map.getZoom() || 13) - 1);
  };

  // If no Google Maps API Key is provided in .env.local
  if (apiKeyError || !apiKey) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 p-6 text-center">
        <div className="max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-200 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Key className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Google Maps API Key Required</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Google Maps requires a free API key. Google provides <strong>$200 free credit monthly</strong> (over 28,000 map loads/month for $0).
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-left text-xs space-y-2 border border-slate-100">
            <p className="font-semibold text-slate-800">Add to your <code className="text-brand-700">.env.local</code> file:</p>
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-emerald-400">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSy..."
            </pre>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href="https://console.cloud.google.com/google/maps-apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            >
              <span>Get Free Google Maps Key</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Floating Controls */}
      <div className="absolute right-4 bottom-24 sm:bottom-6 z-20 flex flex-col gap-2">
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
