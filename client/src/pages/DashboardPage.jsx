/**
 * @fileoverview DashboardPage – Full-featured results dashboard for EcoTrack.
 *
 * Displays a visual breakdown of the user's carbon footprint with:
 *  - Summary stat cards (monthly, annual, recycling rate, largest category)
 *  - Donut + Bar charts (Recharts)
 *  - Emission breakdown table with formula explanation
 *  - AI-generated sustainability recommendations via the backend
 *  - Save / History with comparison support
 */

import { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import {
  BarChart2, Leaf, Bot, Save, Trash2, RefreshCw,
  ChevronDown, ChevronUp, Calculator, CheckCircle,
  AlertCircle, Loader2, TrendingDown, Zap, Globe, ArrowRight,
} from 'lucide-react';

import { generateRecommendations } from '../utils/api';
import { formatCO2, round1 } from '../utils/calculations';
import { saveAssessment, getAssessments, deleteAssessment } from '../utils/storage';
import EcoChallenges from '../components/EcoChallenges';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Tailwind/hex colour palette for pie / bar segments. */
const CATEGORY_COLORS = {
  Electricity:      '#22c55e', // green-500
  Car:              '#ef4444', // red-500
  Bike:             '#f97316', // orange-500
  'Public Transport': '#3b82f6', // blue-500
  Waste:            '#a855f7', // purple-500
};

/** Emission factor reference strings (for the breakdown table). */
const FACTOR_LABELS = {
  electricity:     '× 0.7 kg CO₂/kWh',
  car:             '× 0.12 kg CO₂/km',
  bike:            '× 0.05 kg CO₂/km',
  publicTransport: '× 0.04 kg CO₂/passenger-km',
  waste:           'kg/week × 4 weeks × 0.5 kg CO₂/kg',
};

// ---------------------------------------------------------------------------
// Small reusable sub-components
// ---------------------------------------------------------------------------

/** A single stat summary card without decorative icons. */
function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-[#e3ded2] rounded-2xl p-5 flex flex-col gap-1 shadow-sm">
      <div className="text-xs font-semibold text-[#41404A]/70 uppercase tracking-wider">
        {label}
      </div>
      <p className="text-2xl sm:text-3xl font-black text-[#294B39] mt-1 tracking-tight">{value}</p>
      {sub && <div className="text-xs text-[#41404A]/70 mt-0.5">{sub}</div>}
    </div>
  );
}

/** Custom tooltip for the Pie chart. */
function PieTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2 text-sm">
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-gray-600">{round1(value)} kg CO₂</p>
      <p className="text-gray-400">{pct}% of total</p>
    </div>
  );
}

/** Custom tooltip for Bar / Line charts. */
function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2 text-sm">
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-green-700">{round1(payload[0].value)} kg CO₂</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DashboardPage
// ---------------------------------------------------------------------------

/**
 * @param {{ footprintResult: Object|null, setCurrentPage: Function }} props
 */
export default function DashboardPage({ footprintResult, setCurrentPage }) {
  // ── AI recommendation state ──────────────────────────────────────────────
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiResult,   setAiResult]   = useState(null);   // string | null
  const [aiError,    setAiError]    = useState(null);   // string | null

  // ── Save state ───────────────────────────────────────────────────────────
  const [saved,        setSaved]        = useState(false);
  const [saveSuccess,  setSaveSuccess]  = useState(false);

  // ── History state ────────────────────────────────────────────────────────
  const [showHistory,    setShowHistory]    = useState(false);
  const [assessments,    setAssessments]    = useState([]);
  const [compareIds,     setCompareIds]     = useState([]);   // max 2

  // Load history on mount / when showHistory is opened
  useEffect(() => {
    if (showHistory) setAssessments(getAssessments());
  }, [showHistory]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Call AI endpoint and update state. */
  const handleGenerateAI = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    const result = await generateRecommendations(footprintResult);
    setAiLoading(false);
    if (result.success) {
      setAiResult(result.data?.recommendations ?? 'No recommendations returned.');
    } else {
      setAiError(result.error ?? 'Unknown error.');
    }
  }, [footprintResult]);

  /** Save current assessment to LocalStorage. */
  const handleSave = () => {
    if (saved) return;
    saveAssessment(footprintResult);
    setSaved(true);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    // Refresh history list if open
    if (showHistory) setAssessments(getAssessments());
  };

  /** Delete a history entry. */
  const handleDelete = (id) => {
    deleteAssessment(id);
    setAssessments(getAssessments());
    setCompareIds((prev) => prev.filter((cid) => cid !== id));
  };

  /** Toggle a compare checkbox (max 2). */
  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((cid) => cid !== id);
      if (prev.length >= 2) return [prev[1], id]; // drop oldest selection
      return [...prev, id];
    });
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!footprintResult) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#41404A]">
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          <div className="flex flex-col items-center justify-center min-h-[35vh] gap-6 text-center px-4">
            <div className="bg-white border border-[#e3ded2] rounded-3xl p-10 max-w-md shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#294B39]/10 text-[#294B39] flex items-center justify-center mx-auto mb-4">
                <BarChart2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-[#294B39] mb-2">No Active Calculation</h2>
              <p className="text-[#41404A]/70 text-sm mb-6 leading-relaxed">
                Complete the Carbon Footprint Calculator first to see your personalised
                dashboard, charts, and AI insights here.
              </p>
              <button
                onClick={() => setCurrentPage('calculator')}
                className="bg-[#294B39] hover:bg-[#1f3a2c] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 mx-auto"
              >
                <Calculator size={18} />
                Go to Calculator
              </button>
            </div>
          </div>

          {/* Sustainability Challenges */}
          <EcoChallenges />
        </div>
      </div>
    );
  }

  // ── Derived chart data ───────────────────────────────────────────────────
  const {
    electricityCO2, carCO2, bikeCO2, publicTransportCO2, wasteCO2,
    totalMonthly, annualCO2, recyclingRate, largestCategory, inputs,
  } = footprintResult;

  const rawCategories = [
    { name: 'Electricity',      value: electricityCO2 },
    { name: 'Car',              value: carCO2 },
    { name: 'Bike',             value: bikeCO2 },
    { name: 'Public Transport', value: publicTransportCO2 },
    { name: 'Waste',            value: wasteCO2 },
  ];

  // Filter out zeros for pie chart
  const pieData = rawCategories.filter((c) => c.value > 0);

  // Bar chart uses all categories (zero values shown as empty bars)
  const barData = rawCategories.map((c) => ({ ...c, value: round1(c.value) }));

  // ── Recycling rate mini-bar width ────────────────────────────────────────
  const recyclingBarWidth = `${Math.min(100, Math.max(0, recyclingRate))}%`;

  // ── Annual display ───────────────────────────────────────────────────────
  const annualDisplay = formatCO2(annualCO2);

  // ── History line chart data ──────────────────────────────────────────────
  const historyLineData = assessments.map((a, i) => ({
    name: `#${i + 1}`,
    date: new Date(a.savedAt).toLocaleDateString(),
    total: round1(a.totalMonthly),
  }));

  // ── Comparison cards ─────────────────────────────────────────────────────
  const compareEntries = assessments.filter((a) => compareIds.includes(a.id));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#41404A]">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#294B39] text-[#FAF9F6] flex items-center justify-center shrink-0">
            <BarChart2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#294B39] tracking-tight">Your Carbon Dashboard</h1>
            <p className="text-sm text-[#41404A]/70">Based on your latest footprint calculation</p>
          </div>
        </div>

        {/* ── Summary Cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Monthly CO₂"
            value={`${round1(totalMonthly)} kg`}
            sub="Total emissions this month"
          />
          <StatCard
            label="Annual CO₂"
            value={annualDisplay}
            sub="Projected over 12 months"
          />
          <StatCard
            label="Recycling Rate"
            value={`${round1(recyclingRate)}%`}
            sub={
              <span className="block mt-1">
                <span
                  className="inline-block h-1.5 rounded-full bg-[#294B39]"
                  style={{ width: recyclingBarWidth, minWidth: '4px', display: 'inline-block' }}
                />
              </span>
            }
          />
          <StatCard
            label="Largest Category"
            value={largestCategory}
            sub={`${round1(rawCategories.find(c => c.name === largestCategory)?.value ?? 0)} kg CO₂`}
          />
        </div>

      {/* ── Charts Row ───────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Donut Chart */}
        <div className="bg-white border border-[#e3ded2] rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-[#294B39] mb-4 flex items-center gap-2 text-base">
            <span className="w-2.5 h-2.5 rounded-full bg-[#294B39] inline-block" />
            Emissions by Category
          </h2>
          {pieData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No emissions to display.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip total={totalMonthly} />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white border border-[#e3ded2] rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-[#294B39] mb-4 flex items-center gap-2 text-base">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A4C52A] inline-block" />
            Category Comparison
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={48}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6b7280' }}
                label={{
                  value: 'kg CO₂',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 10, fill: '#9ca3af' },
                }}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#9ca3af'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Emission Breakdown Table ──────────────────────────────────────── */}
      <div className="bg-white border border-[#e3ded2] rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-[#294B39] mb-4 text-base">Emission Calculation Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e3ded2]">
                <th className="text-left py-2 pr-4 text-[#41404A]/60 font-medium">Category</th>
                <th className="text-left py-2 pr-4 text-[#41404A]/60 font-medium">Calculation</th>
                <th className="text-right py-2 text-[#41404A]/60 font-medium">CO₂ (kg/month)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3ded2]/50">
              <tr>
                <td className="py-3 pr-4 font-medium text-[#41404A]">Electricity</td>
                <td className="py-3 pr-4 text-[#41404A]/70 font-mono text-xs">
                  {Number(inputs.electricity) || 0} kWh × 0.7
                </td>
                <td className="py-3 text-right font-semibold text-[#294B39]">
                  {round1(electricityCO2)}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#41404A]">Car</td>
                <td className="py-3 pr-4 text-[#41404A]/70 font-mono text-xs">
                  {Number(inputs.carKm) || 0} km × 0.12
                </td>
                <td className="py-3 text-right font-semibold text-[#294B39]">
                  {round1(carCO2)}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#41404A]">Bike</td>
                <td className="py-3 pr-4 text-[#41404A]/70 font-mono text-xs">
                  {Number(inputs.bikeKm) || 0} km × 0.05
                </td>
                <td className="py-3 text-right font-semibold text-[#294B39]">
                  {round1(bikeCO2)}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#41404A]">Public Transport</td>
                <td className="py-3 pr-4 text-[#41404A]/70 font-mono text-xs">
                  {Number(inputs.publicTransportKm) || 0} km × 0.04
                </td>
                <td className="py-3 text-right font-semibold text-[#294B39]">
                  {round1(publicTransportCO2)}
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[#41404A]">Waste</td>
                <td className="py-3 pr-4 text-[#41404A]/70 font-mono text-xs">
                  {Number(inputs.weeklyWaste) || 0} kg/week × 4 × 0.5
                </td>
                <td className="py-3 text-right font-semibold text-[#294B39]">
                  {round1(wasteCO2)}
                </td>
              </tr>
              <tr className="bg-[#FAF9F6]">
                <td className="py-3 pr-4 font-bold text-[#294B39]">Total Monthly</td>
                <td className="py-3 pr-4 text-[#41404A]/60 text-xs">Sum of all categories</td>
                <td className="py-3 text-right font-black text-[#294B39] text-base">
                  {round1(totalMonthly)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recycling Rate Calculation */}
        <div className="mt-4 bg-[#FAF9F6] border border-[#e3ded2] rounded-xl p-4 text-sm text-[#41404A]">
          <span className="font-semibold text-[#294B39]">Recycling Rate: </span>
          <span className="font-mono text-xs text-[#41404A]/80">
            {Number(inputs.weeklyWaste) > 0 ? (
              <>
                {Number(inputs.weeklyRecycled) || 0} ÷ {Number(inputs.weeklyWaste)} × 100
                = <strong className="text-[#294B39]">{round1(recyclingRate)}%</strong>
              </>
            ) : (
              <strong className="text-[#294B39]">0%</strong>
            )}
          </span>
        </div>
      </div>

      {/* ── AI Recommendations ───────────────────────────────────────────── */}
      <div className="bg-white border border-[#e3ded2] rounded-2xl shadow-sm p-6">
        <div className="mb-4">
          <h2 className="font-bold text-[#294B39] text-base">AI Sustainability Insights</h2>
        </div>

        {/* Generate Button */}
        {!aiResult && !aiLoading && (
          <button
            onClick={handleGenerateAI}
            className="bg-[#294B39] hover:bg-[#1f3a2c] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Bot size={18} />
            Generate My AI Sustainability Insights
          </button>
        )}

        {/* Loading State */}
        {aiLoading && (
          <div className="flex items-center gap-3 text-[#294B39] py-4">
            <Loader2 size={22} className="animate-spin text-[#294B39]" />
            <span className="text-sm font-medium">EcoBot is analysing your data…</span>
          </div>
        )}

        {/* Success Result */}
        {aiResult && !aiLoading && (
          <div className="space-y-3">
            <div className="bg-[#FAF9F6] border border-[#e3ded2] rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Leaf size={18} className="text-[#294B39] mt-0.5 shrink-0" />
                <p className="text-sm text-[#41404A] whitespace-pre-line leading-relaxed">
                  {aiResult}
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerateAI}
              className="text-sm font-semibold text-[#294B39] hover:text-[#1f3a2c] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
          </div>
        )}

        {/* Error + Fallback */}
        {aiError && !aiLoading && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">Could not reach EcoBot</p>
                <p className="text-xs text-red-600 mt-0.5">{aiError}</p>
              </div>
            </div>
            {/* Rule-based fallback */}
            <div className="bg-[#FAF9F6] border border-[#e3ded2] rounded-xl p-5">
              <p className="text-sm font-bold text-[#294B39] mb-2">
                💡 General Eco Tips (offline mode):
              </p>
              <ul className="text-sm text-[#41404A]/80 space-y-1.5 list-disc list-inside">
                {electricityCO2 > 100 && (
                  <li>Your electricity use is high — consider LED bulbs and unplugging idle devices.</li>
                )}
                {carCO2 > 50 && (
                  <li>Try carpooling, remote work days, or switching to public transport to cut car emissions.</li>
                )}
                {bikeCO2 > 30 && (
                  <li>An electric two-wheeler could drastically lower your bike emissions.</li>
                )}
                {wasteCO2 > 20 && (
                  <li>Reduce single-use items and separate wet / dry waste to lower your waste footprint.</li>
                )}
                {recyclingRate < 30 && (
                  <li>Your recycling rate is low — set up a home recycling station to improve it.</li>
                )}
                <li>Track your footprint monthly to spot trends and celebrate improvements!</li>
              </ul>
            </div>
            <button
              onClick={handleGenerateAI}
              className="text-sm font-semibold text-[#294B39] hover:text-[#1f3a2c] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* ── Save Assessment ───────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e3ded2] rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-[#294B39] mb-4 text-base">
          Save This Assessment
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saved}
            className={`font-semibold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 ${
              saved
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#294B39] hover:bg-[#1f3a2c] text-white'
            }`}
          >
            <Save size={16} />
            {saved ? 'Already Saved' : 'Save This Assessment'}
          </button>
          {saveSuccess && (
            <span className="flex items-center gap-1 text-[#294B39] text-sm font-medium">
              <CheckCircle size={16} />
              Saved successfully!
            </span>
          )}
        </div>
      </div>

      {/* ── My SDG Impact Roadmap CTA ── */}
      <div className="bg-[#294B39] text-[#FAF9F6] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Map Your Footprint to SDGs</h3>
          <p className="text-[#FAF9F6]/80 text-xs sm:text-sm max-w-lg leading-relaxed">
            See how your electricity, travel, and waste metrics align with the UN Sustainable Development Goals.
            Complete the lifestyle assessment to get a personalized action roadmap.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage('sdg')}
          className="self-start sm:self-auto px-6 py-3.5 rounded-xl bg-[#A4C52A] text-[#294B39] hover:bg-[#b8da35] font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
        >
          View My SDG Impact
          <ArrowRight size={16} />
        </button>
      </div>

      {/* ── History Section ───────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e3ded2] rounded-2xl shadow-sm p-6">
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="font-bold text-[#294B39] flex items-center gap-2 text-base">
            <BarChart2 size={18} className="text-[#294B39]" />
            Assessment History
          </h2>
          {showHistory ? <ChevronUp size={18} className="text-[#41404A]/60" /> : <ChevronDown size={18} className="text-[#41404A]/60" />}
        </button>

        {showHistory && (
          <div className="mt-4 space-y-4">
            {assessments.length === 0 ? (
              <p className="text-sm text-[#41404A]/60 text-center py-4">
                No saved assessments yet. Save one above!
              </p>
            ) : (
              <>
                {/* History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e3ded2] text-[#41404A]/60 text-xs">
                        <th className="py-2 pr-2 text-left font-medium w-6">Compare</th>
                        <th className="py-2 pr-4 text-left font-medium">Date</th>
                        <th className="py-2 pr-4 text-right font-medium">Monthly CO₂</th>
                        <th className="py-2 pr-4 text-right font-medium">Recycling Rate</th>
                        <th className="py-2 text-right font-medium">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3ded2]/50">
                      {assessments.map((a) => (
                        <tr key={a.id} className="hover:bg-[#FAF9F6]">
                          <td className="py-3 pr-2">
                            <input
                              type="checkbox"
                              checked={compareIds.includes(a.id)}
                              onChange={() => toggleCompare(a.id)}
                              className="accent-[#294B39]"
                              title="Select for comparison"
                            />
                          </td>
                          <td className="py-3 pr-4 text-[#41404A]">
                            {new Date(a.savedAt).toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 pr-4 text-right font-bold text-[#294B39]">
                            {round1(a.totalMonthly)} kg
                          </td>
                          <td className="py-3 pr-4 text-right text-[#41404A]/80 font-semibold">
                            {round1(a.recyclingRate)}%
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDelete(a.id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                              title="Delete this entry"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Line Chart (2+ assessments) */}
                {assessments.length >= 2 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-[#294B39] mb-3">
                      📈 Monthly CO₂ Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={historyLineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e3ded2" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#41404A' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#41404A' }} />
                        <Tooltip
                          formatter={(val, _name, props) => [
                            `${val} kg CO₂`,
                            props.payload?.date,
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#294B39"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#294B39' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Comparison Card */}
                {compareEntries.length === 2 && (
                  <div className="mt-4 bg-[#FAF9F6] border border-[#e3ded2] rounded-xl p-5">
                    <h3 className="font-bold text-[#294B39] mb-4">🔍 Comparison</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {compareEntries.map((a, idx) => {
                        const delta =
                          idx === 1
                            ? round1(a.totalMonthly - compareEntries[0].totalMonthly)
                            : null;
                        return (
                          <div key={a.id} className="bg-white border border-[#e3ded2] rounded-xl p-4 shadow-sm">
                            <p className="text-xs text-[#41404A]/60 mb-1">
                              {new Date(a.savedAt).toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })}
                            </p>
                            <p className="text-2xl font-black text-[#294B39]">
                              {round1(a.totalMonthly)} kg
                            </p>
                            <p className="text-sm text-[#41404A]/70">
                              Recycling: {round1(a.recyclingRate)}%
                            </p>
                            {delta !== null && (
                              <p
                                className={`text-sm font-semibold mt-2 ${
                                  delta <= 0 ? 'text-[#294B39]' : 'text-red-500'
                                }`}
                              >
                                {delta <= 0 ? '▼' : '▲'} {Math.abs(delta)} kg vs first
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Eco Challenges Section ── */}
      <EcoChallenges />
    </div>
  </div>
  );
}
