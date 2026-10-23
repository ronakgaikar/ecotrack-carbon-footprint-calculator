/**
 * @fileoverview EcoChallenges component for EcoTrack.
 *
 * Displays 7 eco-friendly challenge cards the user can mark complete/incomplete.
 * Progress is persisted to LocalStorage via storage utils.
 */

import { useState, useEffect } from 'react';
import { ECO_CHALLENGES } from '../data/emissionFactors';
import { getChallengeProgress, toggleChallenge } from '../utils/storage';

/**
 * Single challenge card.
 */
function ChallengeCard({ challenge, isCompleted, onToggle }) {
  return (
    <div
      className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
        isCompleted
          ? 'bg-[#FAF9F6] border-[#294B39] shadow-xs'
          : 'bg-white border-[#e3ded2] hover:border-[#294B39]/40 shadow-xs'
      }`}
    >
      <div className="space-y-2 mb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#294B39]/70">
          {challenge.category}
        </span>
        <h3 className="text-base font-extrabold text-[#294B39] leading-snug">
          {challenge.title}
        </h3>
        <p className="text-xs text-[#41404A]/75 leading-relaxed">
          {challenge.description}
        </p>
      </div>

      <button
        onClick={() => onToggle(challenge.id)}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
          isCompleted
            ? 'bg-[#294B39] text-[#FAF9F6] hover:bg-[#1d3528]'
            : 'border border-[#e3ded2] text-[#294B39] hover:bg-[#FAF9F6]'
        }`}
        aria-pressed={isCompleted}
      >
        {isCompleted ? 'Completed' : 'Mark Complete'}
      </button>
    </div>
  );
}

/**
 * EcoChallenges section component.
 */
export default function EcoChallenges() {
  const TOTAL = ECO_CHALLENGES.length; // 7

  const [progress, setProgress] = useState({});

  useEffect(() => {
    setProgress(getChallengeProgress());
  }, []);

  const handleToggle = (id) => {
    toggleChallenge(id);
    setProgress(getChallengeProgress());
  };

  const completedCount = ECO_CHALLENGES.filter((c) => !!progress[c.id]).length;
  const allDone = completedCount === TOTAL;
  const progressPercent = Math.round((completedCount / TOTAL) * 100);

  return (
    <section className="max-w-4xl mx-auto py-8">
      {/* ── Header ── */}
      <div className="text-center mb-6 space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#294B39] tracking-tight">
          My Eco Challenges
        </h2>
        <p className="text-xs sm:text-sm text-[#41404A]/70 max-w-lg mx-auto">
          Small daily actions that support sustainable living.
        </p>
      </div>

      {/* ── Progress Counter + Bar ── */}
      <div className="bg-white border border-[#e3ded2] rounded-2xl p-5 mb-8 space-y-2.5 shadow-xs">
        <div className="flex justify-between items-center text-sm font-semibold text-[#41404A]">
          <span>
            Challenges Completed: <strong className="text-[#294B39] text-base">{completedCount}</strong> <span className="text-[#41404A]/50">/ {TOTAL}</span>
          </span>
          <span className="font-bold text-[#294B39]">{progressPercent}%</span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          className="w-full h-2 bg-[#FAF9F6] border border-[#e3ded2] rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-[#294B39] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Celebration message (when all 7 complete) ── */}
      {allDone && (
        <div className="bg-[#294B39]/10 border border-[#294B39]/30 rounded-2xl p-5 mb-8 text-center">
          <p className="font-extrabold text-[#294B39] text-base">
            All {TOTAL} challenges completed!
          </p>
          <p className="text-xs text-[#41404A]/80 mt-1">
            Every sustainable habit counts. Keep up the great work for a greener future!
          </p>
        </div>
      )}

      {/* ── Challenge Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {ECO_CHALLENGES.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            isCompleted={!!progress[challenge.id]}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </section>
  );
}
