/**
 * @fileoverview Complete 17 UN Sustainable Development Goals Integration – "My SDG Journey".
 *
 * Subject: Circular Economy for Sustainable Development.
 *
 * Features:
 *  1. 17 SDGs Dashboard ("Your Sustainable Development Journey") with real-time evaluation:
 *     - Supporting (X/17)
 *     - Opportunity to Improve (Y/17)
 *     - Not Yet Assessed (Z/17)
 *  2. 5-Ps Lifestyle Questionnaire (People, Planet, Prosperity, Peace, Partnerships)
 *  3. Dedicated 17 SDGs Explorer with keyword search, 5-Ps filters, and status filters
 *  4. AI-Powered SDG Recommendations powered by Google Gemini (with robust 17-SDG offline fallback)
 *  5. My Sustainable Action Plan with LocalStorage persistence & completion tracking
 *  6. Interactive Goal Detail Modal with direct "Add to Action Plan" functionality
 *  7. Carbon Footprint Calculator connection (SDGs 7, 11, 12, 13, 2)
 *  8. Academic Demonstration: 4-stage pipeline & 4R circular economy model
 */

import { useState, useMemo } from 'react';
import {
  Loader2,
  X as CloseIcon,
} from 'lucide-react';

import { SDG_DATA } from '../data/emissionFactors';
import { evaluateSDGImpact } from '../utils/sdgEvaluator';
import {
  getSDGAnswers,
  saveSDGAnswers,
  getSDGActions,
  addSDGAction,
  toggleSDGAction,
  removeSDGAction,
} from '../utils/storage';
import { generateSDGRecommendations } from '../utils/api';

import SDGQuestionnaire from '../components/SDGQuestionnaire';
import SDGActionPlan from '../components/SDGActionPlan';

// ─── Circular Economy 4R Model ───────────────────────────────────────────────
const CIRCULAR_STEPS = [
  {
    label: 'Reduce',
    desc: 'Minimize resource consumption at source — choose durability, refuse single-use plastics, and avoid excess consumption.',
  },
  {
    label: 'Reuse',
    desc: 'Keep materials circulating through multiple lifecycles — clean, refill, donate, and share usable resources.',
  },
  {
    label: 'Repair',
    desc: 'Extend operational lifespans via maintenance, fixing, and refurbishing rather than immediate replacement.',
  },
  {
    label: 'Recycle',
    desc: 'Reprocess separated mono-material fractions (paper, metals, glass, PET) into clean secondary raw materials.',
  },
];

export default function SDGPage({ footprintResult, setCurrentPage }) {
  // Active Tab: 'dashboard' | 'questionnaire' | 'explorer' | 'ai' | 'actionplan' | 'guide'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard filter pill
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState('all');

  // Explorer search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [explorerGroupFilter, setExplorerGroupFilter] = useState('All');

  // Modal detail view state
  const [modalSDGId, setModalSDGId] = useState(null);

  // Stored state
  const [answers, setAnswers] = useState(() => getSDGAnswers());
  const [actions, setActions] = useState(() => getSDGActions());

  // AI Recommendations state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [aiNotice, setAiNotice] = useState(null);

  // Evaluate answers across all 17 goals
  const evaluation = useMemo(() => {
    return evaluateSDGImpact(answers, footprintResult);
  }, [answers, footprintResult]);

  // Handle questionnaire updates
  const handleAnswerChange = (questionId, value) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    saveSDGAnswers(updated);
  };

  const handleResetAnswers = () => {
    if (window.confirm('Reset all questionnaire answers and clear current SDG evaluation?')) {
      setAnswers({});
      saveSDGAnswers({});
      setAiRecommendations(null);
    }
  };

  // Action plan handlers
  const handleAddToActionPlan = (action) => {
    const updated = addSDGAction(action);
    setActions(updated);
  };

  const handleToggleAction = (actionId) => {
    const updated = toggleSDGAction(actionId);
    setActions(updated);
  };

  const handleRemoveAction = (actionId) => {
    const updated = removeSDGAction(actionId);
    setActions(updated);
  };

  // Check if an action is already in the Action Plan
  const isActionAdded = (title) => {
    return actions.some(
      (a) => a.title.toLowerCase().trim() === title.toLowerCase().trim()
    );
  };

  // Request AI-Powered Recommendations across relevant SDGs
  const handleGenerateAI = async () => {
    setAiLoading(true);
    setAiNotice(null);

    const evaluatedList = evaluation.allEvaluatedList;

    try {
      const result = await generateSDGRecommendations({
        evaluatedSDGs: evaluatedList,
        footprintResult: footprintResult || null,
      });

      if (result.success && result.data?.recommendations) {
        setAiRecommendations(result.data.recommendations);
        if (result.data.isFallback) {
          setAiNotice(
            result.data.errorNotice ||
              'Displaying verified offline rule-based sustainability recommendations for all 17 SDGs.'
          );
        }
      } else {
        setAiNotice('Could not generate AI recommendations. Please check server connection.');
      }
    } catch (err) {
      setAiNotice('Live AI temporarily unavailable; using rule-based sustainability recommendations.');
    } finally {
      setAiLoading(false);
    }
  };

  // Filtered SDG list for Dashboard
  const dashboardFilteredSDGs = useMemo(() => {
    return evaluation.allEvaluatedList.filter((item) => {
      if (dashboardStatusFilter === 'supporting') return item.status === 'Supporting';
      if (dashboardStatusFilter === 'opportunities') return item.status === 'Opportunity to Improve' || item.opportunities.length > 0;
      if (dashboardStatusFilter === 'unassessed') return item.status === 'Not Yet Assessed';
      return true;
    });
  }, [evaluation, dashboardStatusFilter]);

  // Filtered SDG list for Explorer
  const explorerFilteredSDGs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SDG_DATA.filter((goal) => {
      // 5-Ps group filter
      if (explorerGroupFilter !== 'All' && goal.group !== explorerGroupFilter) {
        return false;
      }
      // Search query
      if (q) {
        const matchesTitle = goal.title.toLowerCase().includes(q);
        const matchesDesc = goal.description.toLowerCase().includes(q);
        const matchesRel = goal.relevance.toLowerCase().includes(q);
        const matchesNumber = goal.id.toString() === q;
        const matchesAction = goal.actions.some((a) => a.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesRel && !matchesNumber && !matchesAction) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, explorerGroupFilter]);

  // Active modal goal data
  const modalGoal = useMemo(() => {
    if (!modalSDGId) return null;
    const staticMeta = SDG_DATA.find((s) => s.id === modalSDGId);
    const evalData = evaluation.resultsBySDG[modalSDGId];
    return { ...staticMeta, evalData };
  }, [modalSDGId, evaluation]);

  const completedActionsCount = actions.filter((a) => a.completed).length;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#41404A] pb-20">
      {/* ── Top Hero Banner ── */}
      <div className="bg-[#294B39] text-[#FAF9F6] pt-12 pb-8 px-4 sm:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                My SDG Journey
              </h1>
              <p className="text-[#FAF9F6]/85 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
                A complete, interactive assessment covering <strong>all 17 United Nations Sustainable Development Goals</strong>.
                Analyze your everyday habits, discover actionable improvement opportunities, and receive AI-guided recommendations.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('questionnaire')}
                className="px-5 py-2.5 rounded-xl bg-[#A4C52A] hover:bg-[#b8da35] text-[#294B39] font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                Start Questionnaire
              </button>
              <button
                onClick={() => {
                  setActiveTab('ai');
                  if (!aiRecommendations && !aiLoading) handleGenerateAI();
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm transition-all"
              >
                AI Roadmap
              </button>
            </div>
          </div>

          {/* ── Primary Navigation Tabs ── */}
          <div className="pt-6 flex items-center gap-1.5 border-t border-white/15 overflow-x-auto scrollbar-thin">
            {[
              { id: 'dashboard', label: '17 SDGs Dashboard', badge: `${evaluation.stats.supportingCount}/17` },
              { id: 'questionnaire', label: 'Lifestyle Questionnaire', badge: `${evaluation.stats.totalAnswered}/${evaluation.stats.totalQuestions}` },
              { id: 'explorer', label: '17 SDGs Explorer', badge: '17' },
              { id: 'ai', label: 'AI Roadmap & Tips' },
              { id: 'actionplan', label: 'My Action Plan', badge: `${completedActionsCount}/${actions.length}` },
              { id: 'guide', label: 'Academic & Circular Guide' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all rounded-t-xl ${
                    isActive
                      ? 'border-[#A4C52A] text-white bg-white/10'
                      : 'border-transparent text-[#FAF9F6]/75 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-[#A4C52A] text-[#294B39]' : 'bg-white/20 text-[#FAF9F6]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* ── Stats Summary Strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Supporting */}
          <div className="bg-white rounded-2xl border border-[#e3ded2] p-5 shadow-xs">
            <span className="text-xs font-bold text-[#41404A]/60 uppercase tracking-wider block">
              SDGs Supporting
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#294B39] mt-2">
              {evaluation.stats.supportingCount}
              <span className="text-sm font-medium text-[#41404A]/50"> / 17 Goals</span>
            </p>
            <p className="text-xs text-[#294B39] mt-1">Reported sustainable habits</p>
          </div>

          {/* Card 2: Opportunities */}
          <div className="bg-white rounded-2xl border border-[#e3ded2] p-5 shadow-xs">
            <span className="text-xs font-bold text-[#41404A]/60 uppercase tracking-wider block">
              Opportunities
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#294B39] mt-2">
              {evaluation.stats.activeOpportunitiesCount}
              <span className="text-sm font-medium text-[#41404A]/50"> / 17 Goals</span>
            </p>
            <p className="text-xs text-[#41404A]/70 mt-1">High-impact areas for growth</p>
          </div>

          {/* Card 3: Unassessed */}
          <div className="bg-white rounded-2xl border border-[#e3ded2] p-5 shadow-xs">
            <span className="text-xs font-bold text-[#41404A]/60 uppercase tracking-wider block">
              Not Yet Assessed
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#41404A] mt-2">
              {evaluation.stats.unassessedCount}
              <span className="text-sm font-medium text-[#41404A]/50"> / 17 Goals</span>
            </p>
            <p className="text-xs text-[#41404A]/60 mt-1">Awaiting questionnaire response</p>
          </div>

          {/* Card 4: Questions Completed */}
          <div className="bg-white rounded-2xl border border-[#e3ded2] p-5 shadow-xs">
            <span className="text-xs font-bold text-[#41404A]/60 uppercase tracking-wider block">
              Habits Recorded
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#294B39] mt-2">
              {evaluation.stats.totalAnswered}
              <span className="text-sm font-medium text-[#41404A]/50"> / {evaluation.stats.totalQuestions}</span>
            </p>
            <p className="text-xs text-[#41404A]/70 mt-1">{evaluation.stats.completionPercentage}% of assessment complete</p>
          </div>
        </div>

        {/* ── Carbon Calculator Connection Banner ── */}
        {footprintResult && (
          <div className="bg-white border border-[#e3ded2] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#294B39]">
                Carbon Footprint Linked to SDGs
              </h4>
              <p className="text-xs text-[#41404A]/80 leading-relaxed">
                Calculated Monthly Total: <strong className="text-[#294B39]">{footprintResult.totalMonthly?.toFixed(1)} kg CO₂</strong> •
                Electricity: {footprintResult.electricityCO2?.toFixed(1)} kg (SDG 7) •
                Car: {footprintResult.carCO2?.toFixed(1)} kg (SDG 11) •
                Recycling: {footprintResult.recyclingRate?.toFixed(0)}% (SDG 12)
              </p>
            </div>

            <button
              onClick={() => setCurrentPage('dashboard')}
              className="px-4 py-2 bg-[#FAF9F6] text-[#294B39] border border-[#e3ded2] hover:border-[#294B39] text-xs font-bold rounded-xl shadow-2xs transition-all shrink-0 self-start sm:self-center"
            >
              View Carbon Dashboard
            </button>
          </div>
        )}

        {/* ====================================================================
            TAB 1: 17 SDGs DASHBOARD
           ==================================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e3ded2] shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#41404A]/60 uppercase tracking-wider">
                  Filter Goals:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: `All 17 Goals` },
                    { id: 'supporting', label: `Supporting (${evaluation.stats.supportingCount})` },
                    { id: 'opportunities', label: `Opportunities (${evaluation.stats.activeOpportunitiesCount})` },
                    { id: 'unassessed', label: `Unassessed (${evaluation.stats.unassessedCount})` },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setDashboardStatusFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        dashboardStatusFilter === filter.id
                          ? 'bg-[#294B39] text-[#FAF9F6] shadow-xs'
                          : 'bg-[#FAF9F6] text-[#41404A] border border-[#e3ded2] hover:border-[#294B39]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('questionnaire')}
                className="text-xs text-[#294B39] hover:underline font-bold self-start sm:self-center"
              >
                Take or Update Questionnaire
              </button>
            </div>

            {/* 17 SDG Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dashboardFilteredSDGs.map((item) => {
                const isSupporting = item.status === 'Supporting';
                const isOpportunity = item.status === 'Opportunity to Improve';
                const isUnassessed = item.status === 'Not Yet Assessed';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#e3ded2] hover:border-[#294B39]/40 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Clean Header */}
                      <div className="p-4 bg-[#FAF9F6] border-b border-[#e3ded2] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-[#294B39] text-[#FAF9F6] flex items-center justify-center font-black text-sm shrink-0">
                            {item.id}
                          </span>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#41404A]/60 block">
                              SDG {item.id} • {item.group}
                            </span>
                            <h3 className="font-bold text-sm text-[#294B39] leading-tight">
                              {item.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-4">
                        {/* Status Badge */}
                        <div>
                          {isSupporting && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FAF9F6] text-[#294B39] border border-[#e3ded2]">
                              Supporting ({item.supportedActions.length} habit{item.supportedActions.length > 1 ? 's' : ''})
                            </span>
                          )}
                          {isOpportunity && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FAF9F6] text-[#41404A] border border-[#e3ded2]">
                              Opportunity to Improve
                            </span>
                          )}
                          {isUnassessed && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#FAF9F6] text-[#41404A]/60 border border-[#e3ded2]">
                              Not Yet Assessed
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#41404A]/80 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        {/* User Habits or Opportunities Evidence (Normal text, no nested card) */}
                        {item.supportedActions.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-xs font-bold text-[#294B39] block">
                              Reported Positive Habit:
                            </span>
                            {item.supportedActions.length === 1 ? (
                              <p className="text-xs text-[#41404A] leading-relaxed">
                                {item.supportedActions[0].habit}
                              </p>
                            ) : (
                              <ul className="space-y-1 text-xs text-[#41404A] leading-relaxed">
                                {item.supportedActions.map((act, idx) => (
                                  <li key={idx}>• {act.habit}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                        {item.opportunities.length > 0 && item.supportedActions.length === 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-xs font-bold text-[#41404A]/80 block">
                              Improvement Opportunity:
                            </span>
                            {item.opportunities.length === 1 ? (
                              <p className="text-xs text-[#41404A] leading-relaxed">
                                {item.opportunities[0].gap}
                              </p>
                            ) : (
                              <ul className="space-y-1 text-xs text-[#41404A] leading-relaxed">
                                {item.opportunities.map((opp, idx) => (
                                  <li key={idx}>• {opp.gap}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-3.5 bg-[#FAF9F6] border-t border-[#e3ded2] flex items-center justify-between">
                      <span className="text-[11px] text-[#41404A]/60 font-medium">
                        3 practical actions
                      </span>
                      <button
                        onClick={() => setModalSDGId(item.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-[#e3ded2] hover:border-[#294B39] hover:text-[#294B39] text-[#41404A] shadow-2xs transition-all"
                      >
                        Explore Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 2: LIFESTYLE QUESTIONNAIRE (5 Ps)
           ==================================================================== */}
        {activeTab === 'questionnaire' && (
          <SDGQuestionnaire
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onReset={handleResetAnswers}
            onAnalyze={() => setActiveTab('dashboard')}
          />
        )}

        {/* ====================================================================
            TAB 3: 17 SDGS EXPLORER
           ==================================================================== */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            {/* Search & Filter Header */}
            <div className="bg-white rounded-2xl p-6 border border-[#e3ded2] shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[#294B39]">
                    Explore All 17 United Nations SDGs
                  </h3>
                  <p className="text-xs sm:text-sm text-[#41404A]/70 mt-0.5">
                    Search by keyword, topic, or filter by the 5 Ps of Sustainable Development.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search SDGs (e.g. water, solar, repair)..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e3ded2] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#294B39] text-[#41404A]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-[#41404A]/60 hover:text-[#41404A]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* 5-Ps Filter Buttons */}
              <div className="pt-2 border-t border-[#e3ded2] flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-[#41404A]/60 uppercase tracking-wider shrink-0 mr-1">
                  5 Ps:
                </span>
                {['All', 'People', 'Planet', 'Prosperity', 'Peace', 'Partnerships'].map((group) => (
                  <button
                    key={group}
                    onClick={() => setExplorerGroupFilter(group)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      explorerGroupFilter === group
                        ? 'bg-[#294B39] text-[#FAF9F6] shadow-xs'
                        : 'bg-[#FAF9F6] text-[#41404A] border border-[#e3ded2] hover:border-[#294B39]'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Explorer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {explorerFilteredSDGs.map((goal) => {
                const evalData = evaluation.resultsBySDG[goal.id];

                return (
                  <div
                    key={goal.id}
                    className="bg-white rounded-2xl border border-[#e3ded2] hover:border-[#294B39]/40 shadow-xs hover:shadow-sm transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Clean Header */}
                      <div className="p-4 bg-[#FAF9F6] border-b border-[#e3ded2] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-[#294B39] text-[#FAF9F6] flex items-center justify-center font-black text-sm shrink-0">
                            {goal.id}
                          </span>
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#41404A]/60 block">
                              SDG {goal.id} • {goal.group}
                            </span>
                            <h3 className="font-bold text-sm text-[#294B39] leading-tight">
                              {goal.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3.5">
                        <p className="text-xs text-[#41404A]/80 leading-relaxed">
                          {goal.description}
                        </p>

                        {/* Flat Relevance Info (No nested card) */}
                        <div className="space-y-1 pt-1">
                          <span className="text-xs font-bold text-[#294B39] block">
                            Student &amp; Circular Relevance:
                          </span>
                          <p className="text-xs text-[#41404A] leading-relaxed">
                            {goal.relevance}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="p-3.5 bg-[#FAF9F6] border-t border-[#e3ded2] flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#41404A]/60">
                        Status: {evalData?.status || 'Unassessed'}
                      </span>
                      <button
                        onClick={() => setModalSDGId(goal.id)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-[#e3ded2] hover:border-[#294B39] hover:text-[#294B39] text-[#41404A] shadow-2xs transition-all"
                      >
                        View Actions & Modal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 4: AI ROADMAP & RECOMMENDATIONS
           ==================================================================== */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-[#294B39] rounded-2xl p-6 sm:p-8 text-[#FAF9F6] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  AI-Powered SDG Action Roadmap
                </h3>
                <p className="text-[#FAF9F6]/85 text-xs sm:text-sm leading-relaxed">
                  Generates personalized recommendations across all 17 SDGs tailored to your actual questionnaire answers and carbon footprint data.
                </p>
              </div>

              <button
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className="px-6 py-3.5 rounded-xl bg-[#A4C52A] hover:bg-[#b8da35] text-[#294B39] font-black text-sm shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-[#294B39]" />
                    Analyzing Habits...
                  </>
                ) : (
                  aiRecommendations ? 'Regenerate AI Roadmap' : 'Generate My AI Roadmap'
                )}
              </button>
            </div>

            {aiNotice && (
              <div className="p-4 bg-[#FAF9F6] border border-[#e3ded2] rounded-2xl text-xs text-[#294B39]">
                <span>{aiNotice}</span>
              </div>
            )}

            {/* Recommendations Display */}
            {aiRecommendations && aiRecommendations.length > 0 ? (
              <div className="space-y-6">
                {aiRecommendations.map((rec, index) => {
                  const goalMeta = SDG_DATA.find((s) => s.id === Number(rec.sdgNumber));

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border border-[#e3ded2] shadow-xs overflow-hidden"
                    >
                      {/* Header */}
                      <div className="p-4 bg-[#294B39] text-[#FAF9F6] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-[#FAF9F6]/15 text-[#FAF9F6] flex items-center justify-center font-black text-sm shrink-0">
                            {rec.sdgNumber}
                          </span>
                          <div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-[#FAF9F6]/70 block">
                              SDG {rec.sdgNumber} • Goal Recommendation
                            </span>
                            <h4 className="text-base sm:text-lg font-bold text-[#FAF9F6]">
                              {rec.sdgName || goalMeta?.title || `Goal ${rec.sdgNumber}`}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* Analysis Content (Flat, no nested cards) */}
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-[#41404A]/60 uppercase tracking-wider block">
                              Why It Matters
                            </span>
                            <p className="text-xs text-[#41404A] leading-relaxed">
                              {rec.whyItMatters}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs font-bold text-[#294B39] uppercase tracking-wider block">
                              What You&apos;re Already Doing
                            </span>
                            <p className="text-xs text-[#41404A] leading-relaxed font-medium">
                              {rec.whatYouAreDoing}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-xs font-bold text-[#41404A] uppercase tracking-wider block">
                              What You Can Improve
                            </span>
                            <p className="text-xs text-[#41404A] leading-relaxed font-medium">
                              {rec.whatYouCanImprove}
                            </p>
                          </div>
                        </div>

                        {/* 3 Practical Actions */}
                        <div className="space-y-3 pt-4 border-t border-[#e3ded2]">
                          <h5 className="text-xs font-bold text-[#41404A]/60 uppercase tracking-wider">
                            Three Simple Actions to Try:
                          </h5>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {rec.actions && rec.actions.map((act, actIdx) => {
                              const alreadyAdded = isActionAdded(act.title);

                              return (
                                <div
                                  key={actIdx}
                                  className="p-4 rounded-xl border border-[#e3ded2] bg-[#FAF9F6] flex flex-col justify-between space-y-3"
                                >
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-[#294B39] uppercase tracking-wider">
                                      Action #{actIdx + 1}
                                    </span>
                                    <h6 className="text-xs font-bold text-[#294B39] leading-snug">
                                      {act.title}
                                    </h6>
                                    <p className="text-[11px] text-[#41404A]/70 leading-relaxed">
                                      {act.description}
                                    </p>
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleAddToActionPlan({
                                        id: `ai_${rec.sdgNumber}_${actIdx}_${Date.now()}`,
                                        title: act.title,
                                        sdg: Number(rec.sdgNumber),
                                        category: goalMeta ? goalMeta.title : `SDG ${rec.sdgNumber}`,
                                        impact: act.description,
                                        difficulty: 'Easy',
                                      })
                                    }
                                    disabled={alreadyAdded}
                                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all text-center ${
                                      alreadyAdded
                                        ? 'bg-[#294B39]/10 text-[#294B39] cursor-default'
                                        : 'bg-[#294B39] hover:bg-[#1d3528] text-white shadow-2xs'
                                    }`}
                                  >
                                    {alreadyAdded ? 'In Action Plan' : 'Add to Action Plan'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white rounded-2xl border border-[#e3ded2]">
                <h4 className="text-base font-bold text-[#294B39]">
                  Ready to Generate Your Personalized SDG Roadmap
                </h4>
                <p className="text-xs sm:text-sm text-[#41404A]/70 max-w-md mx-auto mt-1 mb-5">
                  Click the button above to receive customized recommendations across all 17 SDGs powered by Google Gemini.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB 5: MY ACTION PLAN
           ==================================================================== */}
        {activeTab === 'actionplan' && (
          <SDGActionPlan
            actions={actions}
            onToggleAction={handleToggleAction}
            onRemoveAction={handleRemoveAction}
            onAddCustomAction={handleAddToActionPlan}
          />
        )}

        {/* ====================================================================
            TAB 6: ACADEMIC & CIRCULAR ECONOMY GUIDE
           ==================================================================== */}
        {activeTab === 'guide' && (
          <div className="space-y-8">
            {/* 4R Circular Economy Model */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e3ded2] shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold text-[#294B39] uppercase tracking-wider">
                  Core Theoretical Framework
                </span>
                <h3 className="text-2xl font-black text-[#294B39] mt-1">
                  The 4R Circular Economy Hierarchy
                </h3>
                <p className="text-xs sm:text-sm text-[#41404A]/70 mt-1 max-w-2xl leading-relaxed">
                  Contrasting with the linear &ldquo;take-make-dispose&rdquo; industrial paradigm, the circular economy preserves material utility across closed resource loops:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CIRCULAR_STEPS.map((step, idx) => (
                  <div
                    key={step.label}
                    className="p-5 rounded-xl border border-[#e3ded2] bg-[#FAF9F6] space-y-2.5 relative"
                  >
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#294B39]/10 text-[#294B39] inline-block">
                      Priority {idx + 1}
                    </span>
                    <h4 className="font-extrabold text-base text-[#294B39]">
                      {step.label}
                    </h4>
                    <p className="text-xs text-[#41404A]/80 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic 4-Stage Pipeline Table */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e3ded2] shadow-xs space-y-4">
              <div>
                <span className="text-xs font-bold text-[#294B39] uppercase tracking-wider">
                  Auditable Decision Logic
                </span>
                <h3 className="text-2xl font-black text-[#294B39] mt-1">
                  Academic 4-Stage Impact Pipeline
                </h3>
                <p className="text-xs sm:text-sm text-[#41404A]/70 mt-1 leading-relaxed">
                  Transparent transition logic mapping reported individual lifestyle habits to verified UN SDG opportunities and interventions:
                </p>
              </div>

              {evaluation.academicPipelines.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#41404A]/60 italic border border-dashed border-[#e3ded2] rounded-xl">
                  No habits recorded yet. Answer questions in the Questionnaire tab to populate this pipeline.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#e3ded2] bg-[#FAF9F6] text-[#41404A] uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-3 px-4">Stage 1: User Habit</th>
                        <th className="py-3 px-4">Stage 2: Relevant SDG</th>
                        <th className="py-3 px-4">Stage 3: Opportunity</th>
                        <th className="py-3 px-4">Stage 4: Recommended Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3ded2]/60">
                      {evaluation.academicPipelines.slice(0, 10).map((pipe, pIdx) => (
                        <tr key={pIdx} className="hover:bg-[#FAF9F6]">
                          <td className="py-3 px-4 font-semibold text-[#41404A]">
                            {pipe.habit}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF9F6] border border-[#e3ded2] text-[#294B39]">
                              SDG {pipe.sdgId}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#41404A]/80">
                            {pipe.opportunity}
                          </td>
                          <td className="py-3 px-4 text-[#294B39] font-medium">
                            {pipe.recommendedAction}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {evaluation.academicPipelines.length > 10 && (
                    <p className="text-[11px] text-[#41404A]/50 text-center pt-3">
                      Showing 10 of {evaluation.academicPipelines.length} total mapped pipeline connections.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Academic Disclaimers */}
            <div className="p-5 bg-[#FAF9F6] border border-[#e3ded2] rounded-2xl text-xs text-[#41404A] space-y-2">
              <span className="font-bold text-[#294B39] block">Academic &amp; Elective Disclaimers</span>
              <ul className="list-disc list-inside space-y-1 leading-relaxed text-[#41404A]/80 pl-1">
                <li>EcoTrack is an educational college tool built for the subject <em>Circular Economy for Sustainable Development</em>.</li>
                <li>Individual actions reflect positive lifestyle alignment, but do not imply official UN endorsement or corporate carbon accreditation.</li>
                <li>Emission factors used in the Carbon Footprint Calculator are simplified educational approximations to foster awareness.</li>
              </ul>
            </div>
          </div>
        )}

      </div>

      {/* ====================================================================
          INTERACTIVE GOAL DETAIL MODAL
         ==================================================================== */}
      {modalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadein">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e3ded2] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-[#294B39] text-[#FAF9F6] relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#FAF9F6]/15 text-[#FAF9F6] flex items-center justify-center font-black text-base shrink-0">
                  {modalGoal.id}
                </span>
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#FAF9F6]/75 block">
                    SDG {modalGoal.id} • {modalGoal.group}
                  </span>
                  <h3 className="text-xl font-bold text-[#FAF9F6]">
                    {modalGoal.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setModalSDGId(null)}
                className="p-1.5 rounded-xl bg-[#FAF9F6]/15 hover:bg-[#FAF9F6]/25 text-[#FAF9F6] transition-colors"
                title="Close modal"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Definition */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#41404A]/60 tracking-wider">
                  Official UN Target
                </span>
                <p className="text-sm text-[#41404A] leading-relaxed font-medium">
                  {modalGoal.description}
                </p>
              </div>

              {/* Student Relevance (Flat, no nested card) */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#294B39] tracking-wider block">
                  Everyday &amp; Circular Economy Relevance
                </span>
                <p className="text-xs text-[#41404A] leading-relaxed">
                  {modalGoal.relevance}
                </p>
              </div>

              {/* Assessed Status */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#41404A]/60 tracking-wider">
                  Your Current Lifestyle Status
                </span>
                <div>
                  {modalGoal.evalData?.status === 'Supporting' ? (
                    <div className="p-3 bg-[#FAF9F6] border border-[#e3ded2] rounded-xl text-xs font-bold text-[#294B39]">
                      Supporting ({modalGoal.evalData.supportedActions.length} positive habit reported)
                    </div>
                  ) : modalGoal.evalData?.status === 'Opportunity to Improve' ? (
                    <div className="p-3 bg-[#FAF9F6] border border-[#e3ded2] rounded-xl text-xs font-bold text-[#41404A]">
                      Opportunity to Improve (habits not currently adopted)
                    </div>
                  ) : (
                    <div className="p-3 bg-[#FAF9F6] border border-[#e3ded2] rounded-xl text-xs text-[#41404A]/70">
                      Not Yet Assessed in the Questionnaire
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Actions List */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#41404A]/60 tracking-wider">
                  Recommended Everyday Actions
                </span>

                <div className="space-y-2.5">
                  {modalGoal.actions.map((actTitle, aIdx) => {
                    const alreadyAdded = isActionAdded(actTitle);

                    return (
                      <div
                        key={aIdx}
                        className="p-3.5 rounded-xl border border-[#e3ded2] bg-[#FAF9F6] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5 bg-[#294B39]"
                          >
                            {aIdx + 1}
                          </span>
                          <span className="text-xs font-semibold text-[#41404A]">
                            {actTitle}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            handleAddToActionPlan({
                              id: `modal_${modalGoal.id}_${aIdx}_${Date.now()}`,
                              title: actTitle,
                              sdg: modalGoal.id,
                              category: modalGoal.title,
                              impact: 'Supports everyday sustainability habits',
                              difficulty: 'Easy',
                            })
                          }
                          disabled={alreadyAdded}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            alreadyAdded
                              ? 'bg-[#294B39]/10 text-[#294B39] cursor-default'
                              : 'bg-[#294B39] hover:bg-[#1d3528] text-white shadow-2xs'
                          }`}
                        >
                          {alreadyAdded ? 'Added' : 'Add to Plan'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setModalSDGId(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
