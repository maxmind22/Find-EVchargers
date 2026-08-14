'use client';

import { Station, StationStatus } from '@/lib/types';
import { useAuth } from '@/lib/authContext';
import {
  Search,
  Edit2,
  Trash2,
  Zap,
  Sparkles,
  Loader2,
  AlertCircle,
  Database,
  User,
  PlusCircle,
} from 'lucide-react';
import { useState } from 'react';

interface AdminStationListProps {
  stations: Station[];
  isLoading: boolean;
  onEditStation: (station: Station) => void;
  onRefresh: () => void;
  onAddNew?: () => void;
}

export function AdminStationList({
  stations,
  isLoading,
  onEditStation,
  onRefresh,
  onAddNew,
}: AdminStationListProps) {
  const { user, isSiteAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Filter stations
  const filtered = stations.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchAddress = s.address.toLowerCase().includes(q);
      const matchOperator = s.operator_name.toLowerCase().includes(q);
      const matchCity = s.city?.toLowerCase().includes(q);
      const matchEmail = s.user_email?.toLowerCase().includes(q);
      return matchName || matchAddress || matchOperator || matchCity || matchEmail;
    }
    return true;
  });

  // Stats calculation
  const totalStations = stations.length;
  const activeStations = stations.filter((s) => s.status === 'ACTIVE').length;
  const maintenanceStations = stations.filter((s) => s.status === 'MAINTENANCE').length;
  const totalPlugs = stations.reduce(
    (acc, s) => acc + (s.connectors?.reduce((cAcc, c) => cAcc + c.quantity, 0) || 0),
    0
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete station "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/stations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
      } else {
        alert('Failed to delete station.');
      }
    } catch (e) {
      alert('Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: StationStatus) => {
    try {
      const res = await fetch(`/api/stations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.warn('Status change error:', e);
    }
  };

  const handleSeed = async () => {
    if (!confirm('This will reload realistic sample EV charging stations into the system. Proceed?')) return;

    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.warn('Seed error:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {isSiteAdmin ? 'Total Network Stations' : 'My Stations'}
          </span>
          <p className="mt-1 text-2xl font-black text-slate-900">{totalStations}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
            Active / Online
          </span>
          <p className="mt-1 text-2xl font-black text-emerald-600">{activeStations}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
            In Maintenance
          </span>
          <p className="mt-1 text-2xl font-black text-amber-600">{maintenanceStations}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            Total Sockets / Plugs
          </span>
          <p className="mt-1 text-2xl font-black text-blue-600">{totalPlugs}</p>
        </div>
      </div>

      {/* Control Bar (Search + Filter + Seed) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, address, operator, or owner..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="MAINTENANCE">Maintenance Only</option>
            <option value="OFFLINE">Offline Only</option>
          </select>
        </div>

        {isSiteAdmin && (
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {isSeeding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" />
            ) : (
              <Database className="h-3.5 w-3.5 text-brand-600" />
            )}
            <span>Reset / Load Demo Hubs</span>
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
            <span className="ml-2 text-xs font-medium">Loading charging stations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-slate-400 space-y-3">
            <AlertCircle className="h-9 w-9 text-slate-300" />
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isSiteAdmin ? 'No charging stations found' : 'You have not added any chargers yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {isSiteAdmin
                  ? 'Try clearing your search query or load demo stations.'
                  : 'Register your electric vehicle charging station to appear on the Kigali Driver Map.'}
              </p>
            </div>
            {onAddNew && (
              <button
                onClick={onAddNew}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Your First Station</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/70 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Station & Operator</th>
                  {isSiteAdmin && <th className="px-4 py-3.5">Owner / Host</th>}
                  <th className="px-4 py-3.5">Coordinates & City</th>
                  <th className="px-4 py-3.5">Plugs & Speeds</th>
                  <th className="px-4 py-3.5">Pricing</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((station) => (
                  <tr key={station.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{station.name}</div>
                      <div className="text-[11px] text-slate-400">{station.operator_name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{station.address}</div>
                    </td>

                    {isSiteAdmin && (
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-700">
                          <User className="h-3 w-3 text-slate-400" />
                          {station.user_email || 'admin@evchargers.rw'}
                        </span>
                      </td>
                    )}

                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      <div>
                        {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                      </div>
                      <span className="font-sans text-[10px] text-slate-400 font-medium">
                        {station.city || 'Kigali'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                          <Zap className="h-3 w-3 text-brand-600" />
                          <span>
                            {station.connectors?.reduce((acc, c) => acc + (c.power_kw * (c.quantity || 1)), 0) || 0} kW Hub Total
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({station.connectors?.reduce((acc, c) => acc + (c.quantity || 1), 0) || 0} bays)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {station.connectors?.map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700"
                            >
                              {c.quantity}x {c.power_kw} kW {c.connector_type === 'GB_T' ? 'GB/T' : c.connector_type.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {station.is_free ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Sparkles className="h-2.5 w-2.5" />
                          Free
                        </span>
                      ) : (
                        <span className="text-slate-700 text-xs font-semibold">
                          {station.pricing_info}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <select
                        value={station.status}
                        onChange={(e) =>
                          handleStatusChange(station.id, e.target.value as StationStatus)
                        }
                        className={`rounded-lg border px-2 py-1 text-[11px] font-bold cursor-pointer focus:outline-none ${
                          station.status === 'ACTIVE'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : station.status === 'MAINTENANCE'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-rose-200 bg-rose-50 text-rose-700'
                        }`}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="OFFLINE">Offline</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditStation(station)}
                          title="Edit Station"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(station.id, station.name)}
                          disabled={deletingId === station.id}
                          title="Delete Station"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                        >
                          {deletingId === station.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
