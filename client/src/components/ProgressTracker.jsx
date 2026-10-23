/**
 * @fileoverview ProgressTracker component for EcoTrack.
 *
 * Lets users save footprint snapshots, view them as a line chart over time,
 * delete old entries, and compare any two assessments side-by-side.
 *
 * Props:
 *  - footprintResult {Object|null} — the latest calculated result (optional).
 *    When provided, a "Save Assessment" button appears in the header.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { getAssessments, deleteAssessment, saveAssessment } from '../utils/storage';
import { formatCO2 } from '../utils/calculations';
import {
  Save,
  Trash2,
  TrendingUp,
  BarChart2,
  CheckSquare,
  Square,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format an ISO date string into a short human-readable label.
 * e.g. "2024-03-15T10:30:00.000Z" → "15 Mar 2024"
 *
 * @param {string} iso
 * @returns {string}
 */
function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Short date for chart X-axis labels.
 * @param {string} iso
 * @returns {string}
 */
function fmtShortDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return iso;
  }
}

/**
 * Format a percentage difference with a sign.
 * @param {number} pct
 * @returns {string}
 */
function fmtPct(pct) {
  if (!isFinite(pct)) return '—';
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

/**
 * Compute the percentage difference from `a` to `b`.
 * Returns Infinity when `a` is 0.
 *
 * @param {number} a - baseline value
 * @param {number} b - comparison value
 * @returns {number}
 */
function pctDiff(a, b) {
  if (a === 0) return b === 0 ? 0 : Infinity;
  return ((b - a) / Math.abs(a)) * 100;
}

// ---------------------------------------------------------------------------
// Custom Tooltip for the line chart
// ---------------------------------------------------------------------------

/**
 * @param {{ active: boolean, payload: Array, label: string }} props
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '12px 16px',
        fontSize: '0.8rem',
        color: '#F1F5F9',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#94A3B8' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ margin: '3px 0', color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value?.toFixed(1)} kg CO₂
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Comparison row
// ---------------------------------------------------------------------------

/**
 * A single row in the comparison table.
 *
 * @param {{
 *   label: string,
 *   valA: number|string,
 *   valB: number|string,
 *   unit?: string,
 *   higherIsBetter?: boolean,  // true for recycling rate
 *   isRate?: boolean            // skip pct diff for recycling rate
 * }} props
 */
function CompareRow({ label, valA, valB, unit = 'kg CO₂', higherIsBetter = false, isRate = false }) {
  const numA = Number(valA) || 0;
  const numB = Number(valB) || 0;
  const diff = numB - numA;
  const pct = pctDiff(numA, numB);

  // For CO₂: decrease is good (green). For recycling rate: increase is good (green).
  const isImprovement = higherIsBetter ? diff > 0 : diff < 0;
  const isNeutral = diff === 0;

  const diffColor = isNeutral ? '#94A3B8' : isImprovement ? '#22C55E' : '#EF4444';

  const DiffIcon = isNeutral ? Minus : isImprovement ? ArrowDownRight : ArrowUpRight;

  return (
    <tr
      style={{
        borderBottom: '1px solid #F1F5F9',
      }}
    >
      {/* Label */}
      <td
        style={{
          padding: '10px 12px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#475569',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </td>
      {/* Value A */}
      <td
        style={{
          padding: '10px 12px',
          fontSize: '0.85rem',
          color: '#1E293B',
          textAlign: 'right',
        }}
      >
        {isRate ? `${numA.toFixed(1)}%` : formatCO2(numA)}
      </td>
      {/* Value B */}
      <td
        style={{
          padding: '10px 12px',
          fontSize: '0.85rem',
          color: '#1E293B',
          textAlign: 'right',
        }}
      >
        {isRate ? `${numB.toFixed(1)}%` : formatCO2(numB)}
      </td>
      {/* Difference */}
      <td
        style={{
          padding: '10px 12px',
          textAlign: 'right',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: diffColor,
            background: isNeutral ? '#F8FAFC' : isImprovement ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${isNeutral ? '#E2E8F0' : isImprovement ? '#BBF7D0' : '#FECACA'}`,
            borderRadius: '8px',
            padding: '3px 8px',
          }}
        >
          <DiffIcon size={13} strokeWidth={2.5} />
          {isRate ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%` : fmtPct(pct)}
        </span>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

/**
 * Monthly Progress Tracker.
 *
 * @param {{ footprintResult?: Object|null }} props
 * @returns {JSX.Element}
 */
export default function ProgressTracker({ footprintResult = null }) {
  /** @type {[Array<Object>, Function]} */
  const [assessments, setAssessments] = useState([]);

  /** IDs of the two assessments selected for comparison (max 2). */
  const [compareSelected, setCompareSelected] = useState([]);

  /** Whether the comparison panel is open. */
  const [showCompare, setShowCompare] = useState(false);

  /** Feedback message after save action. */
  const [saveMsg, setSaveMsg] = useState('');

  // Load assessments from storage on mount
  useEffect(() => {
    setAssessments(getAssessments());
  }, []);

  // Sort newest first for display
  const sorted = [...assessments].sort(
    (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
  );

  // Chart data: oldest → newest (ascending)
  const chartData = [...assessments]
    .sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt))
    .map((a) => ({
      date: fmtShortDate(a.savedAt),
      totalMonthly: +(a.totalMonthly?.toFixed(1) ?? 0),
      electricityCO2: +(a.electricityCO2?.toFixed(1) ?? 0),
      wasteCO2: +(a.wasteCO2?.toFixed(1) ?? 0),
    }));

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Save the current footprintResult to localStorage. */
  const handleSave = useCallback(() => {
    if (!footprintResult) return;
    saveAssessment(footprintResult);
    const updated = getAssessments();
    setAssessments(updated);
    setSaveMsg('Assessment saved!');
    setTimeout(() => setSaveMsg(''), 3000);
  }, [footprintResult]);

  /** Delete an assessment by ID. */
  const handleDelete = useCallback((id) => {
    deleteAssessment(id);
    setAssessments(getAssessments());
    // Remove from comparison if it was selected
    setCompareSelected((prev) => prev.filter((cid) => cid !== id));
  }, []);

  /**
   * Toggle selection of an assessment for comparison.
   * Max 2 can be selected at a time.
   *
   * @param {string} id
   */
  const handleCompareToggle = useCallback((id) => {
    setCompareSelected((prev) => {
      if (prev.includes(id)) return prev.filter((cid) => cid !== id);
      if (prev.length >= 2) return prev; // already at max
      return [...prev, id];
    });
  }, []);

  // Resolve comparison assessments
  const [compA, compB] = compareSelected.map((id) =>
    assessments.find((a) => a.id === id)
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TrendingUp size={28} color="#10B981" strokeWidth={2} />
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#1E293B',
              }}
            >
              Monthly Progress Tracker
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
              Save and compare your footprint over time
            </p>
          </div>
        </div>

        {/* Save button — only rendered when a footprint result is available */}
        {footprintResult && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {saveMsg && (
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#16A34A',
                  background: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: '8px',
                  padding: '6px 12px',
                }}
              >
                ✓ {saveMsg}
              </span>
            )}
            <button
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Save size={16} strokeWidth={2.5} />
              Save Assessment
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Empty state                                                         */}
      {/* ------------------------------------------------------------------ */}
      {assessments.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#F8FAFC',
            border: '2px dashed #CBD5E1',
            borderRadius: '20px',
            color: '#94A3B8',
          }}
        >
          <BarChart2 size={48} strokeWidth={1.5} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#64748B' }}>
            No assessments saved yet.
          </p>
          <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: '#94A3B8' }}>
            Calculate your footprint and save it to start tracking progress.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Assessment History List                                             */}
      {/* ------------------------------------------------------------------ */}
      {assessments.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#1E293B',
              }}
            >
              Assessment History
            </h3>
            {compareSelected.length === 2 && (
              <button
                onClick={() => setShowCompare((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: showCompare
                    ? 'linear-gradient(135deg, #6366F1, #4F46E5)'
                    : 'linear-gradient(135deg, #E0E7FF, #C7D2FE)',
                  color: showCompare ? '#fff' : '#4338CA',
                  border: '1px solid #A5B4FC',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <BarChart2 size={15} strokeWidth={2.5} />
                {showCompare ? 'Hide Comparison' : 'Compare Selected'}
              </button>
            )}
          </div>

          {/* Compare hint */}
          {assessments.length >= 2 && compareSelected.length < 2 && (
            <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: '#94A3B8' }}>
              ☑ Select 2 assessments below to compare them side-by-side.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sorted.map((assessment) => {
              const isSelected = compareSelected.includes(assessment.id);
              return (
                <div
                  key={assessment.id}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, #EEF2FF, #E0E7FF)'
                      : '#FFFFFF',
                    border: isSelected ? '2px solid #818CF8' : '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Comparison checkbox */}
                  {assessments.length >= 2 && (
                    <button
                      onClick={() => handleCompareToggle(assessment.id)}
                      disabled={!isSelected && compareSelected.length >= 2}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: compareSelected.length >= 2 && !isSelected ? 'not-allowed' : 'pointer',
                        padding: 0,
                        color: isSelected ? '#6366F1' : '#CBD5E1',
                        opacity: compareSelected.length >= 2 && !isSelected ? 0.4 : 1,
                        flexShrink: 0,
                      }}
                      aria-label={isSelected ? 'Deselect for comparison' : 'Select for comparison'}
                    >
                      {isSelected ? (
                        <CheckSquare size={20} strokeWidth={2} />
                      ) : (
                        <Square size={20} strokeWidth={2} />
                      )}
                    </button>
                  )}

                  {/* Date */}
                  <div style={{ minWidth: '110px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                      DATE
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>
                      {fmtDate(assessment.savedAt)}
                    </p>
                  </div>

                  {/* Total Monthly */}
                  <div style={{ minWidth: '130px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                      MONTHLY CO₂
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#10B981' }}>
                      {formatCO2(assessment.totalMonthly ?? 0)}
                    </p>
                  </div>

                  {/* Annual CO₂ */}
                  <div style={{ minWidth: '130px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                      ANNUAL CO₂
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#3B82F6' }}>
                      {formatCO2(assessment.annualCO2 ?? 0)}
                    </p>
                  </div>

                  {/* Recycling Rate */}
                  <div style={{ minWidth: '110px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                      RECYCLING
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#8B5CF6' }}>
                      {(assessment.recyclingRate ?? 0).toFixed(1)}%
                    </p>
                  </div>

                  {/* Spacer */}
                  <div style={{ flexGrow: 1 }} />

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(assessment.id)}
                    aria-label="Delete assessment"
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      padding: '7px 10px',
                      cursor: 'pointer',
                      color: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FEE2E2';
                      e.currentTarget.style.borderColor = '#FCA5A5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FEF2F2';
                      e.currentTarget.style.borderColor = '#FECACA';
                    }}
                  >
                    <Trash2 size={15} strokeWidth={2} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Line Chart (shown when 2+ assessments)                              */}
      {/* ------------------------------------------------------------------ */}
      {assessments.length >= 2 && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '28px',
            marginBottom: '40px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h3
              style={{
                margin: '0 0 4px',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#1E293B',
              }}
            >
              Your Emissions Over Time
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
              Each point represents a saved assessment, not continuous monitoring.
            </p>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v} kg`}
                width={64}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '0.82rem', fontWeight: 600, paddingTop: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="totalMonthly"
                name="Total Monthly"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="electricityCO2"
                name="Electricity"
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
              />
              <Line
                type="monotone"
                dataKey="wasteCO2"
                name="Waste"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Comparison Panel (shown when 2 assessments selected + toggled)      */}
      {/* ------------------------------------------------------------------ */}
      {showCompare && compA && compB && (
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #818CF8',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(99,102,241,0.12)',
          }}
        >
          <h3
            style={{
              margin: '0 0 4px',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#1E293B',
            }}
          >
            Side-by-Side Comparison
          </h3>
          <p style={{ margin: '0 0 20px', fontSize: '0.8rem', color: '#94A3B8' }}>
            Green = improvement over baseline. Red = increase in emissions.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
              }}
            >
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th
                    style={{
                      padding: '10px 12px',
                      textAlign: 'left',
                      fontWeight: 700,
                      color: '#64748B',
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '2px solid #E2E8F0',
                    }}
                  >
                    Metric
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: '#6366F1',
                      fontSize: '0.78rem',
                      borderBottom: '2px solid #E2E8F0',
                    }}
                  >
                    A · {fmtDate(compA.savedAt)}
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: '#8B5CF6',
                      fontSize: '0.78rem',
                      borderBottom: '2px solid #E2E8F0',
                    }}
                  >
                    B · {fmtDate(compB.savedAt)}
                  </th>
                  <th
                    style={{
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: '#64748B',
                      fontSize: '0.78rem',
                      borderBottom: '2px solid #E2E8F0',
                    }}
                  >
                    Change (A→B)
                  </th>
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="Total Monthly CO₂"
                  valA={compA.totalMonthly}
                  valB={compB.totalMonthly}
                />
                <CompareRow
                  label="Electricity CO₂"
                  valA={compA.electricityCO2}
                  valB={compB.electricityCO2}
                />
                <CompareRow
                  label="Car CO₂"
                  valA={compA.carCO2}
                  valB={compB.carCO2}
                />
                <CompareRow
                  label="Bike CO₂"
                  valA={compA.bikeCO2}
                  valB={compB.bikeCO2}
                />
                <CompareRow
                  label="Public Transport CO₂"
                  valA={compA.publicTransportCO2}
                  valB={compB.publicTransportCO2}
                />
                <CompareRow
                  label="Waste CO₂"
                  valA={compA.wasteCO2}
                  valB={compB.wasteCO2}
                />
                <CompareRow
                  label="Recycling Rate"
                  valA={compA.recyclingRate}
                  valB={compB.recyclingRate}
                  unit="%"
                  higherIsBetter={true}
                  isRate={true}
                />
              </tbody>
            </table>
          </div>

          {/* Disclaimer */}
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              background: '#F8FAFC',
              borderRadius: '10px',
              padding: '12px 16px',
            }}
          >
            <AlertCircle size={16} color="#94A3B8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.6 }}>
              Values are educational estimates based on simplified emission factors.
              Results may not reflect real-world changes in emissions.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
