'use client';

import { Connector, ConnectorType, CurrentType } from '@/lib/types';
import { Plus, Trash2, Zap, Info, BatteryCharging, Gauge } from 'lucide-react';

interface ConnectorBuilderProps {
  connectors: Omit<Connector, 'id' | 'station_id'>[];
  onChange: (connectors: Omit<Connector, 'id' | 'station_id'>[]) => void;
}

const CONNECTOR_TYPES: { type: ConnectorType; label: string; defaultCurrent: CurrentType }[] = [
  { type: 'GB_T', label: 'GB/T (China Standard - BYD / Fleet / Bus)', defaultCurrent: 'DC' },
  { type: 'CCS_2', label: 'CCS 2 (European Standard Combo)', defaultCurrent: 'DC' },
  { type: 'TYPE_2', label: 'Type 2 (Mennekes AC)', defaultCurrent: 'AC' },
  { type: 'NACS', label: 'NACS (Tesla Supercharger Standard)', defaultCurrent: 'DC' },
  { type: 'CHADEMO', label: 'CHAdeMO (Japanese Standard)', defaultCurrent: 'DC' },
  { type: 'TYPE_1', label: 'Type 1 (J1772 AC)', defaultCurrent: 'AC' },
];

const POWER_PRESETS = [7, 11, 22, 50, 100, 120, 150, 240, 350];

export function ConnectorBuilder({ connectors, onChange }: ConnectorBuilderProps) {
  const handleAdd = () => {
    onChange([
      ...connectors,
      {
        connector_type: 'GB_T',
        power_kw: 120,
        quantity: 2,
        status: 'AVAILABLE',
        current_type: 'DC',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    onChange(connectors.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, updates: Partial<Omit<Connector, 'id' | 'station_id'>>) => {
    const updated = connectors.map((c, i) => (i === index ? { ...c, ...updates } : c));
    onChange(updated);
  };

  // Calculations
  const maxSingleVehicleSpeed = connectors.length
    ? Math.max(...connectors.map((c) => c.power_kw || 0))
    : 0;

  const totalHubCapacityKw = connectors.reduce(
    (acc, c) => acc + ((c.power_kw || 0) * (c.quantity || 1)),
    0
  );

  const totalSimultaneousVehicles = connectors.reduce(
    (acc, c) => acc + (c.quantity || 1),
    0
  );

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-brand-600" />
            3. Charging Plugs & Station Power Specifications
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure the plug types, per-socket output speeds, and number of charging stalls available at this hub.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Another Plug Type</span>
        </button>
      </div>

      {/* Live Hub Power Breakdown Card */}
      <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50/70 via-emerald-50/50 to-blue-50/50 p-4 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 mb-2">
          <Gauge className="h-4 w-4 text-brand-600" />
          <span>Station Power Summary (Auto-Calculated)</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl bg-white p-3 border border-brand-100 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Max Single-Car Speed
            </span>
            <p className="mt-1 text-lg font-black text-brand-700">
              {maxSingleVehicleSpeed} kW{' '}
              <span className="text-xs font-semibold text-slate-500">
                {maxSingleVehicleSpeed > 22 ? '(DC Fast)' : '(AC Standard)'}
              </span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Fastest rate a single vehicle can draw</p>
          </div>

          <div className="rounded-xl bg-white p-3 border border-brand-100 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Total Station Power (All Plugs)
            </span>
            <p className="mt-1 text-lg font-black text-emerald-700">
              {totalHubCapacityKw} kW
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Combined electrical output across all stalls</p>
          </div>

          <div className="rounded-xl bg-white p-3 border border-brand-100 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Total Charging Stalls
            </span>
            <p className="mt-1 text-lg font-black text-blue-700">
              {totalSimultaneousVehicles} {totalSimultaneousVehicles === 1 ? 'Bay' : 'Bays / Plugs'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Vehicles that can charge at the same time</p>
          </div>
        </div>
      </div>

      {/* Plugs List */}
      {connectors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 space-y-2">
          <BatteryCharging className="h-8 w-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No charging plugs defined yet</p>
          <p>Click &ldquo;Add Another Plug Type&rdquo; above to specify the connector types and power ratings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {connectors.map((c, idx) => {
            const plugSubtotalKw = (c.power_kw || 0) * (c.quantity || 1);
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-slate-300 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-900 text-white px-2 py-0.5 text-[11px] font-bold">
                      Plug Group #{idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-brand-700">
                      {c.current_type === 'DC' ? '⚡ DC Fast Charging' : '🔌 AC Standard Charging'}
                    </span>
                  </div>

                  {connectors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
                  {/* Connector Type */}
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Connector Standard *
                    </label>
                    <select
                      value={c.connector_type}
                      onChange={(e) => {
                        const type = e.target.value as ConnectorType;
                        const preset = CONNECTOR_TYPES.find((t) => t.type === type);
                        handleUpdate(idx, {
                          connector_type: type,
                          current_type: preset?.defaultCurrent || 'DC',
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none shadow-sm"
                    >
                      {CONNECTOR_TYPES.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Power per Plug (kW) */}
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Max Output per Plug (kW) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={c.power_kw}
                      onChange={(e) => {
                        const kw = parseFloat(e.target.value) || 0;
                        handleUpdate(idx, {
                          power_kw: kw,
                          current_type: kw > 22 ? 'DC' : 'AC',
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none shadow-sm"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Max speed to 1 vehicle (e.g. 120 kW)
                    </span>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="mb-1 block font-semibold text-slate-700">
                      Number of Plugs / Stalls *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={c.quantity}
                      onChange={(e) =>
                        handleUpdate(idx, { quantity: parseInt(e.target.value) || 1 })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none shadow-sm"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Simultaneous parking stalls
                    </span>
                  </div>
                </div>

                {/* Quick Presets & Live Subtotal Note */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">Quick kW:</span>
                    {POWER_PRESETS.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() =>
                          handleUpdate(idx, {
                            power_kw: kw,
                            current_type: kw > 22 ? 'DC' : 'AC',
                          })
                        }
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                          c.power_kw === kw
                            ? 'bg-brand-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {kw} kW
                      </button>
                    ))}
                  </div>

                  <div className="font-semibold text-[11px] text-slate-700">
                    Subtotal: <span className="text-emerald-600 font-bold">{c.quantity}x {c.power_kw} kW</span> = <span className="text-slate-900 font-extrabold">{plugSubtotalKw} kW combined</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
