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
      {/* Top Filter Chips Bar (Single horizontal scroll row on mobile) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs flex-nowrap -mx-1 px-1">
        {/* Filter Drawer Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full px-3.5 py-2 font-semibold shadow-sm transition-all border active:scale-95 ${
            totalActiveFilters > 0
              ? 'bg-brand-600 text-white border-brand-600 shadow-brand-500/20'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:bg-slate-50 backdrop-blur-md'
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
          className={`flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full px-3 py-2 font-medium shadow-sm transition-all border active:scale-95 ${
            filters.minPowerKw === 150
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:bg-slate-50 backdrop-blur-md'
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Ultra-Fast (150+ kW)</span>
        </button>

        {/* Quick Connector: GB/T */}
        <button
          onClick={() => toggleConnector('GB_T')}
          className={`flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full px-3 py-2 font-medium shadow-sm transition-all border active:scale-95 ${
            filters.connectorTypes?.includes('GB_T')
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:bg-slate-50 backdrop-blur-md'
          }`}
        >
          <span>🔋 GB/T</span>
        </button>

        {/* Quick Connector: CCS 2 */}
        <button
          onClick={() => toggleConnector('CCS_2')}
          className={`flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full px-3 py-2 font-medium shadow-sm transition-all border active:scale-95 ${
            filters.connectorTypes?.includes('CCS_2')
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:bg-slate-50 backdrop-blur-md'
          }`}
        >
          <span>CCS 2</span>
        </button>

        {/* Quick Connector: Type 2 */}
        <button
          onClick={() => toggleConnector('TYPE_2')}
          className={`flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full px-3 py-2 font-medium shadow-sm transition-all border active:scale-95 ${
            filters.connectorTypes?.includes('TYPE_2')
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:bg-slate-50 backdrop-blur-md'
          }`}
        >
          <span>Type 2</span>
        </button>

        {/* Quick Free Charging */}
        <button
          onClick={toggleFree}
          className={`flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full px-3 py-2 font-medium shadow-sm transition-all border active:scale-95 ${
            filters.isFree
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:bg-slate-50 backdrop-blur-md'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Free Charging</span>
        </button>

        {/* Reset Filter Button */}
        {totalActiveFilters > 0 && (
          <button
            onClick={clearAll}
            className="flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full bg-slate-200/80 px-2.5 py-1.5 text-slate-700 hover:bg-slate-300 transition-colors font-medium active:scale-95"
          >
            <X className="h-3 w-3" />
            <span>Reset ({totalActiveFilters})</span>
          </button>
        )}

        {/* Stations Counter Pill */}
        <div className="ml-auto hidden sm:flex shrink-0 whitespace-nowrap items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm border border-slate-200/80 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span>{totalCount} chargers nearby</span>
        </div>
      </div>

      {/* Expanded Filter Modal / Sheet (Bottom sheet on mobile, dropdown on desktop) */}
      {isOpen && (
        <>
          {/* Mobile Backdrop Overlay */}
          <div
            className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs sm:hidden animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] rounded-t-3xl border-t border-slate-200 bg-white p-5 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 pb-safe sm:static sm:z-auto sm:mt-1 sm:max-h-none sm:rounded-2xl sm:border sm:border-slate-200 sm:p-4 sm:shadow-xl sm:animate-in sm:fade-in-50 sm:zoom-in-95 sm:slide-in-from-bottom-0 sm:w-full sm:max-w-xl"
          >
            {/* Mobile Sheet Drag Handle */}
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300 sm:hidden" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Charging Filters</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {totalCount} matching
                </span>
              </div>
              <div className="flex items-center gap-2">
                {totalActiveFilters > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-3 space-y-4 text-xs pr-1">
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
                        className={`flex min-h-[44px] items-center justify-between rounded-xl p-2.5 text-left border transition-all active:scale-98 ${
                          isChecked
                            ? 'border-brand-500 bg-brand-50/70 text-brand-900 font-semibold shadow-sm'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <span className="text-sm shrink-0">{c.icon}</span>
                          <span className="truncate">{c.label}</span>
                        </div>
                        {isChecked && <Check className="h-3.5 w-3.5 text-brand-600 shrink-0" />}
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
                        className={`min-h-[40px] rounded-xl p-2 text-center border font-medium transition-all active:scale-98 ${
                          isSelected
                            ? 'border-brand-500 bg-brand-500 text-white shadow-sm font-semibold'
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
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800 text-xs">Free Charging Only</p>
                  <p className="text-slate-500 text-[11px]">Zero-cost charging and customer-validated parking</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!filters.isFree}
                  onChange={toggleFree}
                  className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Mobile Bottom Apply Button */}
            <div className="pt-3 mt-2 border-t border-slate-100 sm:hidden">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-600 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-700 active:scale-98 transition-all"
              >
                <span>View {totalCount} Chargers</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
