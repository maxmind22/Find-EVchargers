'use client';

import { getNavigationUrls, formatCoordinates } from '@/lib/spatial';
import { Amenity, Station } from '@/lib/types';
import {
  X,
  Zap,
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Coffee,
  ShoppingBag,
  Wifi,
  Clock,
  Car,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldAlert,
  Gauge,
  BatteryCharging,
} from 'lucide-react';
import { useState } from 'react';
import { ReportModal } from './ReportModal';

interface StationDrawerProps {
  station: Station | null;
  onClose: () => void;
}

const AMENITY_ICONS: Record<Amenity, { label: string; icon: React.ReactNode }> = {
  RESTROOM: { label: 'Restrooms', icon: <Car className="h-3.5 w-3.5" /> },
  COFFEE: { label: 'Coffee / Cafe', icon: <Coffee className="h-3.5 w-3.5" /> },
  SHOPPING: { label: 'Shopping', icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  RESTAURANT: { label: 'Dining', icon: <Coffee className="h-3.5 w-3.5" /> },
  WIFI: { label: 'Free WiFi', icon: <Wifi className="h-3.5 w-3.5" /> },
  ACCESSIBLE: { label: 'Accessible', icon: <HelpCircle className="h-3.5 w-3.5" /> },
  TWENTY_FOUR_SEVEN: { label: '24/7 Access', icon: <Clock className="h-3.5 w-3.5" /> },
  HOTEL: { label: 'Hotel On-site', icon: <Car className="h-3.5 w-3.5" /> },
};

export function StationDrawer({ station, onClose }: StationDrawerProps) {
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  if (!station) return null;

  const navUrls = getNavigationUrls(station.latitude, station.longitude, station.name);

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${station.latitude}, ${station.longitude}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const connectors = station.connectors || [];

  // Max individual charging speed
  const maxPowerKw = connectors.length
    ? Math.max(...connectors.map((c) => c.power_kw))
    : 0;

  // Total hub combined power
  const totalHubPowerKw = connectors.reduce(
    (acc, c) => acc + (c.power_kw * (c.quantity || 1)),
    0
  );

  // Total sockets / stalls
  const totalStalls = connectors.reduce((acc, c) => acc + (c.quantity || 1), 0);

  const statusConfig = {
    ACTIVE: {
      label: 'Operational',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    MAINTENANCE: {
      label: 'Under Maintenance',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    OFFLINE: {
      label: 'Temporarily Offline',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    },
    PLANNED: {
      label: 'Planned Site',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
  }[station.status] || {
    label: 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col bg-white shadow-2xl transition-all duration-300 sm:border-l sm:border-slate-200 animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusConfig.bg}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {station.operator_name}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
              {station.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
          {/* Station Power & Stalls Summary Banner */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-center">
            <div className="rounded-xl bg-white p-2.5 shadow-sm border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Max Speed
              </span>
              <span className="text-sm font-black text-brand-600">
                {maxPowerKw} kW
              </span>
              <span className="text-[9px] text-slate-400 block">per car</span>
            </div>

            <div className="rounded-xl bg-white p-2.5 shadow-sm border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Plugs
              </span>
              <span className="text-sm font-black text-slate-900">
                {totalStalls}
              </span>
              <span className="text-[9px] text-slate-400 block">charging bays</span>
            </div>

            <div className="rounded-xl bg-white p-2.5 shadow-sm border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Hub
              </span>
              <span className="text-sm font-black text-emerald-600">
                {totalHubPowerKw} kW
              </span>
              <span className="text-[9px] text-slate-400 block">combined grid</span>
            </div>
          </div>

          {/* Address & Navigation Quick Action */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-3">
            <div className="flex items-start gap-2.5 text-slate-700">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
              <div>
                <p className="text-xs font-medium leading-relaxed">{station.address}</p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  {formatCoordinates(station.latitude, station.longitude)}
                </p>
              </div>
            </div>

            {/* Navigation CTA Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={navUrls.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Google Maps</span>
                </a>
                <a
                  href={navUrls.appleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Apple Maps</span>
                </a>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <a
                  href={navUrls.waze}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-brand-600 font-medium transition-colors"
                >
                  Navigate with Waze &rarr;
                </a>
                <button
                  onClick={handleCopyCoords}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {copiedCoords ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Coords</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Connectors & Power Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-brand-600" />
                Available Plugs & Speeds ({connectors.length} Plug Types)
              </h3>
            </div>

            <div className="space-y-2.5">
              {connectors.map((conn, idx) => {
                const combinedKw = conn.power_kw * (conn.quantity || 1);
                return (
                  <div
                    key={conn.id || idx}
                    className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-brand-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xs ${
                            conn.current_type === 'DC'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {conn.current_type}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {conn.connector_type === 'GB_T'
                                ? 'GB/T (China Standard)'
                                : conn.connector_type.replace('_', ' ')}
                            </span>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-800">
                              {conn.quantity}x {conn.quantity === 1 ? 'Bay' : 'Bays'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Max output:{' '}
                            <span className="font-bold text-slate-900">
                              {conn.power_kw} kW per vehicle
                            </span>
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                        {conn.status}
                      </span>
                    </div>

                    {/* Combined note */}
                    <div className="rounded-xl bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500 flex items-center justify-between border border-slate-100">
                      <span>{conn.quantity} vehicle stalls simultaneously</span>
                      <span className="font-semibold text-slate-700">{combinedKw} kW total capacity</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & Access Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
              <span className="text-slate-400 font-medium">Pricing</span>
              <p className="mt-1 font-bold text-slate-900 text-sm flex items-center gap-1">
                {station.is_free ? (
                  <>
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700">Free Charging</span>
                  </>
                ) : (
                  station.pricing_info || 'Standard Rate'
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
              <span className="text-slate-400 font-medium">Access</span>
              <p className="mt-1 font-bold text-slate-900 text-sm capitalize">
                {station.access_type.toLowerCase().replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Amenities */}
          {station.amenities && station.amenities.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Nearby Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {station.amenities.map((amenity) => {
                  const item = AMENITY_ICONS[amenity];
                  if (!item) return null;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          {station.notes && (
            <div className="rounded-2xl bg-amber-50/60 p-3.5 border border-amber-100 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>Station Note</span>
              </div>
              <p className="leading-relaxed text-amber-800">{station.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Report Issue */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between text-xs">
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 transition-colors font-medium"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Report broken plug or issue</span>
          </button>
          <span className="text-slate-400 text-[10px]">
            ID: {station.id.slice(0, 8)}
          </span>
        </div>
      </div>

      <ReportModal
        station={station}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </>
  );
}
