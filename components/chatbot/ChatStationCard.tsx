'use client';

import { Station } from '@/lib/types';
import { getNavigationUrls } from '@/lib/spatial';
import {
  Zap,
  MapPin,
  Navigation,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface ChatStationCardProps {
  station: Station;
  onSelectStation?: (station: Station) => void;
}

export function ChatStationCard({ station, onSelectStation }: ChatStationCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMapPage = pathname === '/';

  const navUrls = getNavigationUrls(station.latitude, station.longitude, station.name);
  const connectors = station.connectors || [];
  const maxPowerKw = connectors.length
    ? Math.max(...connectors.map((c) => c.power_kw))
    : 0;

  const isOperational = station.status === 'ACTIVE';

  const handleLocateOnMap = () => {
    if (onSelectStation) {
      onSelectStation(station);
    }

    // Dispatch global custom event for map
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ev:select-station', {
          detail: { station },
        })
      );
    }

    // If not on map page, navigate to map with query params
    if (!isMapPage) {
      router.push(`/?stationId=${station.id}&lat=${station.latitude}&lng=${station.longitude}`);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition-all hover:border-brand-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                isOperational
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isOperational ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-amber-600" />
              )}
              {isOperational ? 'Available' : station.status}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {station.operator_name}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 leading-snug">
            {station.name}
          </h4>
        </div>

        {/* Max Power Badge */}
        <div className="flex items-center gap-1 rounded-xl bg-brand-50 px-2 py-1 text-xs font-black text-brand-700 border border-brand-200/80 shrink-0">
          <Zap className="h-3 w-3 fill-brand-600 text-brand-600" />
          <span>{maxPowerKw} kW</span>
        </div>
      </div>

      {/* Address */}
      <div className="mt-2 flex items-start gap-1.5 text-slate-600 text-[11px]">
        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span className="line-clamp-1">{station.address}</span>
      </div>

      {/* Connectors Chips */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {connectors.map((c, idx) => (
          <span
            key={c.id || idx}
            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
              c.connector_type === 'GB_T'
                ? 'bg-red-50 text-red-700 border-red-200'
                : c.connector_type === 'CCS_2'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {c.connector_type === 'GB_T' ? 'GB/T (BYD)' : c.connector_type.replace('_', ' ')} • {c.power_kw}kW
          </span>
        ))}
      </div>

      {/* Pricing & Quick Navigation Actions */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
        <div className="text-[11px] font-semibold text-slate-700">
          {station.is_free ? (
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <Sparkles className="h-3 w-3" /> Free Charging
            </span>
          ) : (
            <span>{station.pricing_info}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={navUrls.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            title="Directions"
          >
            <Navigation className="h-3 w-3" />
            <span>Map</span>
          </a>

          <button
            type="button"
            onClick={handleLocateOnMap}
            className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Locate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
