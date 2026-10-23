/**
 * @fileoverview WasteTrackerPage – Dedicated waste tracking page for EcoTrack.
 *
 * Features:
 *  - Per-category generated / recycled input with validation
 *  - Expandable guidance panels per waste material
 *  - Circular Economy hierarchy: Reduce → Reuse → Repair → Recycle
 *  - Summary view: totals, recycling rate, pie chart, per-category table
 *  - All data persisted to localStorage under 'ecotrack_waste'
 *  - Clear disclaimer separating this tracker from the Calculator
 */

import { useState, useEffect, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ChevronDown, ChevronUp,
} from 'lucide-react';

import { WASTE_CATEGORIES } from '../data/emissionFactors';
import { calculateRecyclingRate } from '../utils/calculations';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** LocalStorage key for waste tracker data. */
const WASTE_STORAGE_KEY = 'ecotrack_waste';

/**
 * Default shape for each waste category entry.
 * generated: kg per week, recycled: kg per week.
 */
const defaultEntry = () => ({ generated: '', recycled: '' });

/** Build initial state from WASTE_CATEGORIES. */
function buildDefaultWasteEntries() {
  return Object.fromEntries(WASTE_CATEGORIES.map((c) => [c.id, defaultEntry()]));
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Safely parse a string to a non-negative float, returning 0 on bad input. */
function toNum(v) {
  const n = parseFloat(v);
  return isNaN(n) || n < 0 ? 0 : n;
}

/** Custom tooltip for the pie chart. */
function WastePieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2 text-sm">
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-gray-600">{value.toFixed(2)} kg/week generated</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Circular Economy Hierarchy Component
// ---------------------------------------------------------------------------

const CE_STEPS = [
  { label: 'Reduce' },
  { label: 'Reuse' },
  { label: 'Repair' },
  { label: 'Recycle' },
];

function CircularEconomySection() {
  return (
    <div className="bg-white border border-[#e3ded2] rounded-2xl shadow-sm p-6">
      <h2 className="font-bold text-[#294B39] text-base mb-4 flex items-center gap-2">
        The Circular Economy Hierarchy
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CE_STEPS.map((step) => (
          <div key={step.label} className="w-full bg-[#FAF9F6] border border-[#e3ded2] rounded-xl p-4 text-center">
            <p className="font-extrabold text-base text-[#294B39]">{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WasteTrackerPage
// ---------------------------------------------------------------------------

export default function WasteTrackerPage() {
  // ── State ────────────────────────────────────────────────────────────────

  /** Per-category { generated: string, recycled: string } */
  const [wasteEntries, setWasteEntries] = useState(() => {
    try {
      const stored = localStorage.getItem(WASTE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge stored data over defaults (handles new categories gracefully)
        return { ...buildDefaultWasteEntries(), ...parsed };
      }
    } catch {
      // Corrupt storage — fall back to defaults
    }
    return buildDefaultWasteEntries();
  });

  /** Which category's guidance panel is open (by id), or null. */
  const [activeGuidance, setActiveGuidance] = useState(null);

  /** 'input' | 'summary' */
  const [viewMode, setViewMode] = useState('input');

  /** Per-field validation errors: { 'plastic_recycled': 'error msg', ... } */
  const [errors, setErrors] = useState({});

  // ── Persist to localStorage on change ───────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(WASTE_STORAGE_KEY, JSON.stringify(wasteEntries));
    } catch {
      // Quota exceeded — fail silently
    }
  }, [wasteEntries]);

  // ── Derived summary values ───────────────────────────────────────────────
  const summary = useMemo(() => {
    let totalGenerated = 0;
    let totalRecycled  = 0;  // only from recyclable categories
    const breakdown = WASTE_CATEGORIES.map((cat) => {
      const entry = wasteEntries[cat.id] ?? defaultEntry();
      const generated = toNum(entry.generated);
      const recycled  = cat.recyclable ? Math.min(toNum(entry.recycled), generated) : 0;
      totalGenerated += generated;
      totalRecycled  += recycled;
      const rate = calculateRecyclingRate(recycled, generated);
      return { ...cat, generated, recycled, rate };
    });
    const overallRate = calculateRecyclingRate(totalRecycled, totalGenerated);
    return { totalGenerated, totalRecycled, overallRate, breakdown };
  }, [wasteEntries]);

  // ── Pie chart data (exclude zeros) ──────────────────────────────────────
  const pieData = summary.breakdown
    .filter((c) => c.generated > 0)
    .map((c) => ({ name: c.label, value: c.generated, color: c.color }));

  // ── Handlers ─────────────────────────────────────────────────────────────

  /**
   * Update a single field in a category entry.
   * Validates recycled ≤ generated.
   */
  const handleChange = (catId, field, rawValue) => {
    // Allow empty string (user clearing the field)
    const value = rawValue === '' ? '' : rawValue;

    setWasteEntries((prev) => {
      const updated = { ...prev, [catId]: { ...prev[catId], [field]: value } };

      // Validate recycled ≤ generated
      const gen = toNum(updated[catId].generated);
      const rec = toNum(updated[catId].recycled);
      const errorKey = `${catId}_recycled`;

      if (rec > gen && gen > 0) {
        setErrors((e) => ({ ...e, [errorKey]: 'Recycled cannot exceed generated.' }));
      } else {
        setErrors((e) => {
          const next = { ...e };
          delete next[errorKey];
          return next;
        });
      }

      return updated;
    });
  };

  /** Reset all entries back to blank. */
  const handleReset = () => {
    setWasteEntries(buildDefaultWasteEntries());
    setErrors({});
  };

  /** Toggle guidance panel for a category. */
  const toggleGuidance = (catId) => {
    setActiveGuidance((prev) => (prev === catId ? null : catId));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#41404A]">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#294B39] tracking-tight">Waste Tracker</h1>
            <p className="text-sm text-[#41404A]/70">Track your weekly waste generation and recycling</p>
          </div>
          {/* View Toggle */}
          <div className="flex bg-[#FAF9F6] border border-[#e3ded2] rounded-xl p-1 gap-1">
            {['input', 'summary'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === mode
                    ? 'bg-[#294B39] shadow-sm text-white'
                    : 'text-[#41404A]/70 hover:text-[#294B39]'
                }`}
              >
                {mode === 'input' ? 'Input' : 'Summary'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Disclaimer Banner ─────────────────────────────────────────────── */}
        <div className="bg-[#FAF9F6] border border-[#e3ded2] rounded-2xl p-4">
          <p className="text-sm text-[#41404A]/80 leading-relaxed">
            <strong className="text-[#294B39]">Note:</strong> Waste data here is tracked <em>separately</em> from the
            Carbon Footprint Calculator. If you want to use waste data in the calculator,
            you must enter it manually there.
          </p>
        </div>

        {/* ── Circular Economy Section ──────────────────────────────────────── */}
        <CircularEconomySection />

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* INPUT VIEW                                                          */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {viewMode === 'input' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#294B39] text-base">
                Weekly Waste by Category
              </h2>
              <button
                onClick={handleReset}
                className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
              >
                Reset All
              </button>
            </div>

            {WASTE_CATEGORIES.map((cat) => {
              const entry = wasteEntries[cat.id] ?? defaultEntry();
              const isOpen = activeGuidance === cat.id;
              const recycledErrorKey = `${cat.id}_recycled`;

              return (
                <div
                  key={cat.id}
                  className="bg-white border border-[#e3ded2] rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Category Header (clickable to toggle guidance) */}
                  <button
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAF9F6] transition-colors"
                    onClick={() => toggleGuidance(cat.id)}
                  >
                    <div>
                      <p className="font-bold text-[#294B39] text-base">{cat.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#41404A]/60 hidden sm:inline">Guidance</span>
                      {isOpen
                        ? <ChevronUp size={16} className="text-[#41404A]/60" />
                        : <ChevronDown size={16} className="text-[#41404A]/60" />
                      }
                    </div>
                  </button>

                  {/* Expandable Guidance Panel */}
                  {isOpen && (
                    <div
                      className="px-5 pb-4 border-t border-[#e3ded2]/50 bg-[#FAF9F6]"
                      style={{ borderLeftColor: cat.color, borderLeftWidth: 3 }}
                    >
                      <div className="pt-3">
                        <p className="text-sm text-[#41404A]/80">{cat.guidance}</p>
                      </div>
                    </div>
                  )}

                  {/* Input Fields */}
                  <div className={`px-5 pb-5 ${cat.recyclable ? 'grid sm:grid-cols-2 gap-4' : 'max-w-md'}`}>
                    {/* Generated */}
                    <div>
                      <label className="block text-xs font-semibold text-[#41404A]/70 mb-1">
                        Amount Generated (kg/week)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0.0"
                        value={entry.generated}
                        onChange={(e) => handleChange(cat.id, 'generated', e.target.value)}
                        className="w-full border border-[#e3ded2] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#294B39] transition text-[#41404A]"
                      />
                    </div>

                    {/* Recycled / Recovered (only for recyclable categories) */}
                    {cat.recyclable && (
                      <div>
                        <label className="block text-xs font-semibold text-[#41404A]/70 mb-1">
                          Amount Recycled / Recovered (kg/week)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="0.0"
                          value={entry.recycled}
                          onChange={(e) => handleChange(cat.id, 'recycled', e.target.value)}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#294B39] transition text-[#41404A] ${
                            errors[recycledErrorKey]
                              ? 'border-red-400 bg-red-50'
                              : 'border-[#e3ded2]'
                          }`}
                        />
                        {errors[recycledErrorKey] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[recycledErrorKey]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Switch to Summary nudge */}
            <div className="text-center pt-2">
              <button
                onClick={() => setViewMode('summary')}
                className="bg-[#294B39] hover:bg-[#1f3a2c] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center mx-auto"
              >
                View My Waste Summary
              </button>
            </div>
          </div>
        )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SUMMARY VIEW                                                        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'summary' && (
        <div className="space-y-6">

          {/* ── Top Stats ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#e3ded2] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#41404A]/60 mb-1">Total Generated</p>
              <p className="text-2xl font-black text-[#294B39]">{summary.totalGenerated.toFixed(2)} kg</p>
              <p className="text-xs text-[#41404A]/60 mt-0.5">per week</p>
            </div>
            <div className="bg-white border border-[#e3ded2] rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#41404A]/60 mb-1">Total Recycled</p>
              <p className="text-2xl font-black text-[#294B39]">{summary.totalRecycled.toFixed(2)} kg</p>
              <p className="text-xs text-[#41404A]/60 mt-0.5">recyclable categories only</p>
            </div>
            <div className="bg-white border border-[#e3ded2] rounded-2xl p-5 shadow-sm col-span-2 md:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#41404A]/60 mb-1">Recycling Rate</p>
              <p className="text-2xl font-black text-[#294B39]">{summary.overallRate.toFixed(1)}%</p>
              <div className="mt-2 h-2 bg-[#FAF9F6] border border-[#e3ded2] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#294B39] rounded-full transition-all"
                  style={{ width: `${Math.min(100, summary.overallRate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recycling rate disclaimer */}
          <p className="text-xs text-[#41404A]/60 italic -mt-2">
            * Recycling rate is calculated only from recyclable categories (Plastic, Paper,
            Glass, Metal). Organic recovery (composting) and e-waste take-back are not
            included in this rate.
          </p>

          {/* ── Pie Chart ──────────────────────────────────────────────────── */}
          <div className="bg-white border border-[#e3ded2] rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-[#294B39] text-base mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#294B39] inline-block" />
              Waste by Category (kg/week generated)
            </h2>
            {pieData.length === 0 ? (
              <p className="text-[#41404A]/60 text-sm text-center py-8">
                No waste data entered yet. Switch to the Input view to add data.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<WastePieTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs text-gray-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Per-Category Breakdown Table ─────────────────────────────── */}
          <div className="bg-white border border-[#e3ded2] rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-[#294B39] text-base mb-4">Category Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e3ded2] text-[#41404A]/60 text-xs">
                    <th className="py-2 pr-4 text-left font-medium">Category</th>
                    <th className="py-2 pr-4 text-right font-medium">Generated (kg/wk)</th>
                    <th className="py-2 pr-4 text-right font-medium">Recycled (kg/wk)</th>
                    <th className="py-2 text-right font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3ded2]/50">
                  {summary.breakdown.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#FAF9F6]">
                        <td className="py-3 pr-4">
                          <span className="text-[#41404A] font-medium">{cat.label}</span>
                          {!cat.recyclable && (
                            <span className="text-xs text-[#41404A]/50 ml-1.5 hidden sm:inline">
                              (non-recyclable)
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right text-[#41404A]">
                          {cat.generated > 0 ? cat.generated.toFixed(2) : '—'}
                        </td>
                        <td className="py-3 pr-4 text-right text-[#294B39] font-medium">
                          {cat.recyclable && cat.recycled > 0
                            ? cat.recycled.toFixed(2)
                            : cat.recyclable
                            ? '—'
                            : <span className="text-[#41404A]/40 text-xs">N/A</span>
                          }
                        </td>
                        <td className="py-3 text-right">
                          {cat.recyclable && cat.generated > 0 ? (
                            <span className={`inline-block font-semibold text-xs px-2 py-0.5 rounded-full ${
                              cat.rate >= 50
                                ? 'bg-green-100 text-green-700'
                                : cat.rate >= 20
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {cat.rate.toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-[#41404A]/40 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Guidance Cards ────────────────────────────────────────────── */}
          <div className="bg-white border border-[#e3ded2] rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-[#294B39] text-base mb-4">
              Material-Specific Guidance
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {WASTE_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="border border-[#e3ded2] rounded-xl p-4 bg-[#FAF9F6]"
                  style={{ borderLeftColor: cat.color, borderLeftWidth: 3 }}
                >
                  <p className="font-bold text-[#294B39] text-sm mb-1">{cat.label}</p>
                  <p className="text-xs text-[#41404A]/80 leading-relaxed">{cat.guidance}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Back to Input */}
          <div className="text-center pt-2">
            <button
              onClick={() => setViewMode('input')}
              className="border border-[#e3ded2] hover:border-[#294B39] bg-white text-[#41404A] font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              ← Back to Input
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
