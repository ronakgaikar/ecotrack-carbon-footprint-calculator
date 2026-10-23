/**
 * @fileoverview Complete 17 UN SDGs Lifestyle Questionnaire Component.
 *
 * Organized by the official UN 5 Ps:
 *  - People (SDGs 1-5)
 *  - Planet (SDGs 6, 12-15)
 *  - Prosperity (SDGs 7-11)
 *  - Peace (SDG 16)
 *  - Partnerships (SDG 17)
 *
 * Supports transparent multi-level answers:
 *  - "Yes, regularly"
 *  - "Sometimes"
 *  - "Not currently"
 *  - "Not applicable / Skip"
 *
 * Unanswered and skipped questions are never counted as negative habits.
 */

import { useState } from 'react';
import { SDG_QUESTIONNAIRE, SDG_5PS } from '../data/sdgAssessmentData';
import { SDG_DATA } from '../data/emissionFactors';

export default function SDGQuestionnaire({ answers, onAnswerChange, onReset, onAnalyze }) {
  const [activeGroup, setActiveGroup] = useState('All');

  // Count answered questions (excluding skips or empties)
  const answeredCount = Object.entries(answers).filter(
    ([_, val]) => val === 'regularly' || val === 'sometimes' || val === 'not_currently' || val === 'yes' || val === 'no'
  ).length;

  const totalQuestions = SDG_QUESTIONNAIRE.length;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  // Filter questions according to selected 5-Ps group
  const filteredQuestions =
    activeGroup === 'All'
      ? SDG_QUESTIONNAIRE
      : SDG_QUESTIONNAIRE.filter((q) => q.group === activeGroup);

  // Group progress counts
  const getGroupProgress = (groupKey) => {
    const list =
      groupKey === 'All'
        ? SDG_QUESTIONNAIRE
        : SDG_QUESTIONNAIRE.filter((q) => q.group === groupKey);
    const count = list.filter((q) => {
      const a = answers[q.id];
      return a === 'regularly' || a === 'sometimes' || a === 'not_currently' || a === 'yes' || a === 'no';
    }).length;
    return { answered: count, total: list.length };
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e3ded2] shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="p-6 sm:p-8 bg-[#294B39] text-[#FAF9F6] relative">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              My SDG Lifestyle Questionnaire
            </h2>
            <p className="text-[#FAF9F6]/80 text-sm max-w-2xl leading-relaxed">
              Answer questions about your everyday activities across the 5 Ps of Sustainable Development:
              <strong> People, Planet, Prosperity, Peace, and Partnerships</strong>. Every goal has equal importance.
            </p>
          </div>

          <button
            onClick={onReset}
            className="self-start sm:self-auto text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white shrink-0"
            title="Reset answers"
          >
            Reset Answers
          </button>
        </div>

        {/* ── Overall Progress Bar ── */}
        <div className="mt-6 pt-5 border-t border-white/15 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#FAF9F6]/90">
            <span>Overall Assessment Progress: {answeredCount} / {totalQuestions} Questions</span>
            <span className="text-[#A4C52A] font-black">{progressPct}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-[#A4C52A] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#FAF9F6]/70 pt-1">
            <span>Answer honestly based on your typical habits.</span>
            <span>* Unanswered or skipped questions are never counted as negative.</span>
          </div>
        </div>
      </div>

      {/* ── 5 Ps Category Tabs ── */}
      <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#e3ded2]">
        <div className="mb-2 text-xs font-bold text-[#41404A]/60 uppercase tracking-wider">
          Explore by 5 Ps of Sustainable Development:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {SDG_5PS.map((group) => {
            const isSelected = activeGroup === group.id;
            const { answered, total } = getGroupProgress(group.id);
            const isCompleted = answered === total && total > 0;

            return (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-[#294B39] text-[#FAF9F6] border-[#294B39] shadow-xs'
                    : 'bg-white text-[#41404A] border-[#e3ded2] hover:border-[#294B39]'
                }`}
              >
                <span>{group.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-[#FAF9F6]'
                      : isCompleted
                      ? 'bg-[#294B39]/10 text-[#294B39]'
                      : 'bg-[#FAF9F6] text-[#41404A]/60'
                  }`}
                >
                  {answered}/{total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Questions List ── */}
      <div className="p-6 sm:p-8 space-y-4 bg-[#FAF9F6]">
        <div className="text-xs font-semibold text-[#41404A]/60 flex justify-between items-center mb-2">
          <span>
            Showing {filteredQuestions.length} questions in <strong>{activeGroup}</strong>
          </span>
          <span className="text-[11px] text-[#41404A]/50">
            Select one option per question
          </span>
        </div>

        {filteredQuestions.map((q, idx) => {
          const currentAnswer = answers[q.id];
          const primarySDG = SDG_DATA.find((s) => s.id === q.sdg);

          return (
            <div
              key={q.id}
              className="p-4 sm:p-5 rounded-2xl border border-[#e3ded2] bg-white transition-all shadow-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* ── Question Info ── */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* SDG Badge */}
                    <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-[#294B39] shadow-2xs">
                      SDG {q.sdg} – {primarySDG?.title || `Goal ${q.sdg}`}
                    </span>

                    {/* Group tag */}
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FAF9F6] text-[#41404A] border border-[#e3ded2]">
                      {q.group}
                    </span>

                    {/* Topic */}
                    <span className="text-xs text-[#41404A]/60 font-medium hidden sm:inline">
                      • {q.category}
                    </span>

                    {q.sdgs.length > 1 && (
                      <span className="text-[11px] text-[#41404A]/50">
                        (Also links to SDG {q.sdgs.filter((s) => s !== q.sdg).join(', ')})
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-semibold text-[#41404A] leading-snug">
                    {q.question}
                  </h4>

                  {/* Active Feedback Hint */}
                  {(currentAnswer === 'regularly' || currentAnswer === 'yes') && (
                    <p className="text-xs text-[#294B39] font-medium">
                      <strong>Reported:</strong> {q.positiveActionText}
                    </p>
                  )}
                  {currentAnswer === 'sometimes' && (
                    <p className="text-xs text-[#41404A] font-medium">
                      <strong>Developing habit:</strong> Practiced occasionally; room to turn into a daily routine.
                    </p>
                  )}
                  {(currentAnswer === 'not_currently' || currentAnswer === 'no') && (
                    <p className="text-xs text-[#41404A]/70 font-medium">
                      <strong>Improvement opportunity:</strong> {q.opportunityText}
                    </p>
                  )}
                </div>

                {/* ── Multi-Choice Response Buttons ── */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-start lg:self-center">
                  {/* Option 1: Regularly */}
                  <button
                    onClick={() => onAnswerChange(q.id, 'regularly')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      currentAnswer === 'regularly' || currentAnswer === 'yes'
                        ? 'bg-[#294B39] text-white shadow-2xs'
                        : 'bg-white border border-[#e3ded2] text-[#41404A] hover:border-[#294B39]'
                    }`}
                  >
                    Yes, regularly
                  </button>

                  {/* Option 2: Sometimes */}
                  <button
                    onClick={() => onAnswerChange(q.id, 'sometimes')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      currentAnswer === 'sometimes'
                        ? 'bg-[#294B39]/20 text-[#294B39] border border-[#294B39]'
                        : 'bg-white border border-[#e3ded2] text-[#41404A] hover:border-[#294B39]'
                    }`}
                  >
                    Sometimes
                  </button>

                  {/* Option 3: Not currently */}
                  <button
                    onClick={() => onAnswerChange(q.id, 'not_currently')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      currentAnswer === 'not_currently' || currentAnswer === 'no'
                        ? 'bg-[#FAF9F6] text-[#41404A] border border-[#41404A]'
                        : 'bg-white border border-[#e3ded2] text-[#41404A] hover:border-[#41404A]'
                    }`}
                  >
                    Not currently
                  </button>

                  {/* Option 4: Skip / Prefer not to say */}
                  <button
                    onClick={() => onAnswerChange(q.id, 'skip')}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      currentAnswer === 'skip' || currentAnswer === 'na'
                        ? 'bg-[#FAF9F6] text-[#41404A] font-bold border border-[#e3ded2]'
                        : 'bg-transparent text-[#41404A]/50 hover:text-[#41404A]'
                    }`}
                    title="Skip (not counted as negative)"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer Call to Action ── */}
      <div className="p-6 bg-white border-t border-[#e3ded2] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#41404A]/70 text-center sm:text-left">
          {answeredCount === 0 ? (
            'Answer questions across the 5 Ps to generate your personal SDG impact roadmap.'
          ) : (
            <span>
              <strong>{answeredCount} of {totalQuestions}</strong> questions recorded ({progressPct}% complete).
              Your 17 SDGs Dashboard updates in real time!
            </span>
          )}
        </div>

        {onAnalyze && (
          <button
            onClick={onAnalyze}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#294B39] hover:bg-[#1d3528] text-white text-sm font-bold shadow-xs transition-all flex items-center justify-center"
          >
            View 17 SDGs Impact Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
