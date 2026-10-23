/**
 * @fileoverview My Sustainable Action Plan Component (All 17 UN SDGs).
 *
 * Allows users to track their chosen sustainability commitments across all 17 SDGs,
 * mark them as completed, filter by status or SDG, and add custom actions.
 *
 * Persisted in LocalStorage.
 * Includes academic distinction: self-monitoring vs verified carbon audit.
 */

import { useState, useMemo } from 'react';
import { SDG_DATA } from '../data/emissionFactors';
import {
  CheckCircle2,
  Circle,
  Trash2,
} from 'lucide-react';

export default function SDGActionPlan({
  actions = [],
  onToggleAction,
  onRemoveAction,
  onAddCustomAction,
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [sdgFilter, setSdgFilter] = useState('all'); // 'all' | number
  const [customTitle, setCustomTitle] = useState('');
  const [customSDG, setCustomSDG] = useState(13);

  const completedCount = actions.filter((a) => a.completed).length;
  const totalCount = actions.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredActions = useMemo(() => {
    return actions.filter((a) => {
      // Status match
      if (statusFilter === 'active' && a.completed) return false;
      if (statusFilter === 'completed' && !a.completed) return false;
      // SDG match
      if (sdgFilter !== 'all' && Number(a.sdg) !== Number(sdgFilter)) return false;
      return true;
    });
  }, [actions, statusFilter, sdgFilter]);

  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const chosenGoal = SDG_DATA.find((s) => s.id === Number(customSDG));

    onAddCustomAction({
      id: `custom_${Date.now()}`,
      title: customTitle.trim(),
      sdg: Number(customSDG),
      category: chosenGoal ? chosenGoal.title : 'Personal Commitment',
      impact: 'Personal sustainability habit commitment',
      difficulty: 'Easy',
    });

    setCustomTitle('');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e3ded2] shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3ded2] pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#294B39] tracking-tight">
            Action Tracker & Commitments
          </h2>
          <p className="text-[#41404A]/70 text-sm mt-1 max-w-xl">
            Select practical actions from your assessment or AI recommendations. Check them off as you integrate them into your routine.
          </p>
        </div>

        {/* ── Completion Counter Pill ── */}
        <div className="bg-[#FAF9F6] border border-[#e3ded2] rounded-2xl px-6 py-3.5 text-center sm:text-right shrink-0">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#41404A]/60">
            Completed Commitments
          </p>
          <p className="text-2xl sm:text-3xl font-black text-[#294B39]">
            {completedCount} <span className="text-sm font-semibold text-[#41404A]/60">/ {totalCount}</span>
          </p>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      {totalCount > 0 && (
        <div className="space-y-2 bg-[#FAF9F6] p-4 rounded-2xl border border-[#e3ded2]">
          <div className="flex justify-between text-xs font-bold text-[#41404A]">
            <span>Progress Toward Active Commitments</span>
            <span className="text-[#294B39] font-black">{progressPct}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-[#FAF9F6] border border-[#e3ded2] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-[#294B39] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Filter Controls Row ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'active', label: `Active (${totalCount - completedCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SDG Dropdown Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#41404A]/60">
            Filter SDG:
          </span>
          <select
            value={sdgFilter}
            onChange={(e) => setSdgFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-[#e3ded2] bg-white text-[#41404A] font-medium focus:outline-none focus:ring-2 focus:ring-[#294B39]"
          >
            <option value="all">All 17 SDGs</option>
            {SDG_DATA.map((goal) => (
              <option key={goal.id} value={goal.id}>
                SDG {goal.id} – {goal.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Actions List ── */}
      {actions.length === 0 ? (
        <div className="text-center py-14 px-4 border border-dashed border-[#e3ded2] rounded-2xl bg-[#FAF9F6]">
          <h4 className="text-base font-bold text-[#294B39]">Your Action Plan is Empty</h4>
          <p className="text-xs sm:text-sm text-[#41404A]/70 max-w-md mx-auto mt-1 mb-5">
            Take the 17-SDG Questionnaire or browse the AI recommendations to add sustainable habits to your personalized plan.
          </p>
        </div>
      ) : filteredActions.length === 0 ? (
        <div className="text-center py-10 text-xs sm:text-sm text-[#41404A]/70 italic bg-[#FAF9F6] rounded-2xl border border-[#e3ded2]">
          No actions match the selected filter combination.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActions.map((action) => {
            const goalMeta = SDG_DATA.find((s) => s.id === Number(action.sdg));

            return (
              <div
                key={action.id}
                className={`flex items-start justify-between gap-3 p-4 sm:p-5 rounded-2xl border transition-all ${
                  action.completed
                    ? 'bg-[#FAF9F6] border-[#e3ded2]'
                    : 'bg-white border-[#e3ded2] hover:border-[#294B39]/40 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => onToggleAction(action.id)}
                    className="mt-0.5 text-[#294B39] hover:opacity-80 transition-opacity shrink-0"
                    title={action.completed ? 'Mark incomplete' : 'Mark completed'}
                    aria-label={action.title}
                  >
                    {action.completed ? (
                      <CheckCircle2 size={22} className="fill-[#294B39] text-[#FAF9F6]" />
                    ) : (
                      <Circle size={22} className="text-[#e3ded2] hover:text-[#294B39]" />
                    )}
                  </button>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#294B39] shadow-2xs">
                        SDG {action.sdg} • {goalMeta?.title || `Goal ${action.sdg}`}
                      </span>

                      {action.difficulty && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF9F6] text-[#41404A] border border-[#e3ded2]">
                          {action.difficulty}
                        </span>
                      )}

                      {action.category && (
                        <span className="text-[11px] text-[#41404A]/60 font-medium">
                          {action.category}
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-sm sm:text-base font-semibold leading-snug transition-all ${
                        action.completed ? 'line-through text-[#41404A]/50' : 'text-[#41404A]'
                      }`}
                    >
                      {action.title}
                    </p>

                    {action.impact && (
                      <p className="text-xs text-[#41404A]/70 leading-relaxed">
                        <strong className="text-[#41404A]">Impact:</strong> {action.impact}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveAction(action.id)}
                  className="text-[#41404A]/40 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
                  title="Remove from plan"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Custom Action Bar ── */}
      <form
        onSubmit={handleCreateCustom}
        className="pt-5 border-t border-[#e3ded2] flex flex-col sm:flex-row gap-2.5 items-center"
      >
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          placeholder="Add your own custom sustainability commitment..."
          className="flex-1 w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[#e3ded2] focus:outline-none focus:ring-2 focus:ring-[#294B39] text-[#41404A]"
        />

        <select
          value={customSDG}
          onChange={(e) => setCustomSDG(Number(e.target.value))}
          className="w-full sm:w-auto text-xs px-3 py-2.5 rounded-xl border border-[#e3ded2] bg-white text-[#41404A] font-medium focus:outline-none focus:ring-2 focus:ring-[#294B39]"
        >
          {SDG_DATA.map((goal) => (
            <option key={goal.id} value={goal.id}>
              SDG {goal.id} ({goal.title})
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#294B39] hover:bg-[#1d3528] text-white text-xs font-bold transition-all shadow-xs shrink-0"
        >
          Add Commitment
        </button>
      </form>

      {/* ── Academic Self-Tracking Disclaimer ── */}
      <div className="p-4 bg-[#FAF9F6] border border-[#e3ded2] rounded-2xl text-xs text-[#41404A]">
        <p className="leading-relaxed">
          <strong className="text-[#294B39]">Academic Disclaimer — Self-Reported vs. Certified Audit:</strong> Tracking and marking these
          actions demonstrates conscious personal commitment and educational engagement. It represents
          self-monitored behavioral change, rather than an audited institutional carbon credit or officially
          certified UN sustainability rating.
        </p>
      </div>
    </div>
  );
}
