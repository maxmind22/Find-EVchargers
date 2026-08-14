'use client';

import { ConnectorType, StationFilter } from '@/lib/types';
import { Zap, Sparkles, SlidersHorizontal, X, Check } from 'lucide-react';
import { useState } from 'react';

interface FilterBarProps {
  filters: StationFilter;
  onChangeFilters: (filters: StationFilter) => void;
  totalCount: number;
}

const CONNECTOR_OPTIONS: { type: ConnectorType; label: string; icon: string }[] = [
  { type: 'CCS_2', label: 'CCS 2 (Combo)', icon: '⚡' },
  { type: 'TYPE_2', label: 'Type 2 (Mennekes)', icon: '🔌' },
  { type: 'GB_T', label: 'GB/T (China Std)', icon: '🔋' },
  { type: 'NACS', label: 'NACS (Tesla)', icon: '⚡' },
  { type: 'CHADEMO', label: 'CHAdeMO', icon: '⚡' },
  { type: 'TYPE_1', label: 'Type 1 (J1772)', icon: '🔌' },
];

const SPEED_OPTIONS = [
  { minKw: 0, label: 'All Speeds' },
  { minKw: 22, label: 'AC (≤ 22 kW)' },
  { minKw: 50, label: 'Fast (≥ 50 kW)' },
  { minKw: 150, label: 'Ultra-Fast (≥ 150 kW)' },
];

export function FilterBar({ filters, onChangeFilters, totalCount }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeConnectorCount = filters.connectorTypes?.length || 0;
  const isSpeedFiltered = (filters.minPowerKw || 0) > 0;
  const isFreeFiltered = !!filters.isFree;

  const totalActiveFilters =
    activeConnectorCount + (isSpeedFiltered ? 1 : 0) + (isFreeFiltered ? 1 : 0);

  const toggleConnector = (type: ConnectorType) => {
    const current = filters.connectorTypes || [];
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChangeFilters({ ...filters, connectorTypes: next.length > 0 ? next : undefined });
  };

  const setSpeed = (minKw: number) => {
    onChangeFilters({ ...filters, minPowerKw: minKw > 0 ? minKw : undefined });
  };

  const toggleFree = () => {
    onChangeFilters({ ...filters, isFree: !filters.isFree ? true : undefined });
  };

  const clearAll = () => {
    onChangeFilters({});
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Top Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 text-xs">
        {/* Filter Drawer Toggle on Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium shadow-sm transition-colors border ${
            totalActiveFilters > 0
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {totalActiveFilters > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-700">
              {totalActiveFilters}
            </span>
          )}
        </button>

        {/* Quick Speed: Ultra-Fast ≥ 150kW */}
        <button
          onClick={() => setSpeed(filters.minPowerKw === 150 ? 0 : 150)}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-medium shadow-sm transition-all border ${
            filters.minPowerKw === 150
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Ultra-Fast (150+ kW)</span>
        </button>

        {/* Quick Connector: GB/T */}
        <button
          onClick={() => toggleConnector('GB_T')}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-medium shadow-sm transition-all border ${
            filters.connectorTypes?.includes('GB_T')
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🔋 GB/T</span>
        </button>

        {/* Quick Connector: CCS 2 */}
        <button
          onClick={() => toggleConnector('CCS_2')}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-medium shadow-sm transition-all border ${
            filters.connectorTypes?.includes('CCS_2')
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>CCS 2</span>
        </button>

        {/* Quick Connector: Type 2 */}
        <button
          onClick={() => toggleConnector('TYPE_2')}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-medium shadow-sm transition-all border ${
            filters.connectorTypes?.includes('TYPE_2')
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Type 2</span>
        </button>

        {/* Quick Free Charging */}
        <button
          onClick={toggleFree}
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-medium shadow-sm transition-all border ${
            filters.isFree
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span>Free Charging</span>
        </button>

        {/* Reset Filter Button */}
        {totalActiveFilters > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          >
            <X className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}

        {/* Stations Counter Pill */}
        <div className="ml-auto hidden sm:flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm border border-slate-200/80 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span>{totalCount} chargers nearby</span>
        </div>
      </div>

      {/* Expanded Filter Panel Dropdown */}
      {isOpen && (
        <div className="mt-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Charging Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-4 text-xs">
            {/* Connector Types */}
            <div>
              <label className="mb-2 block font-semibold text-slate-700">Connector Sockets</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CONNECTOR_OPTIONS.map((c) => {
                  const isChecked = filters.connectorTypes?.includes(c.type);
                  return (
                    <button
                      key={c.type}
                      onClick={() => toggleConnector(c.type)}
                      className={`flex items-center justify-between rounded-xl p-2.5 text-left border transition-all ${
                        isChecked
                          ? 'border-brand-500 bg-brand-50/70 text-brand-900 font-semibold shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{c.icon}</span>
                        <span>{c.label}</span>
                      </div>
                      {isChecked && <Check className="h-3.5 w-3.5 text-brand-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minimum Power */}
            <div>
              <label className="mb-2 block font-semibold text-slate-700">Charging Speed (kW)</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SPEED_OPTIONS.map((s) => {
                  const isSelected = (filters.minPowerKw || 0) === s.minKw;
                  return (
                    <button
                      key={s.minKw}
                      onClick={() => setSpeed(s.minKw)}
                      className={`rounded-xl p-2 text-center border font-medium transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Free Charging Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div>
                <p className="font-semibold text-slate-800">Free Charging Only</p>
                <p className="text-slate-500 text-[11px]">Show stations with zero cost or customer parking</p>
              </div>
              <input
                type="checkbox"
                checked={!!filters.isFree}
                onChange={toggleFree}
                className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
