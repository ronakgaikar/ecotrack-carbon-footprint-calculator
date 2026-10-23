/**
 * @fileoverview Pure JavaScript rule evaluator for "My SDG Journey" (All 17 UN SDGs).
 *
 * Evaluates user responses to the lifestyle questionnaire across all 17 SDGs
 * alongside their carbon footprint calculation (if available), producing transparent,
 * auditable SDG status badges, supporting evidence, opportunities, and
 * the academic 4-stage pipeline:
 * User Habit → Relevant SDG → Improvement Opportunity → Recommended Action
 *
 * Rules:
 *  - Does NOT assume a low carbon footprint proves a user follows every goal.
 *  - Unanswered or skipped questions ('na', 'skip', undefined) are NEVER treated as negative responses.
 *  - Distinguishes "regularly" (+1), "sometimes" (+0.5), and "not_currently" (opportunity).
 *  - Supports both new multi-choice values ('regularly', 'sometimes', 'not_currently') and legacy ('yes', 'no').
 */

import { SDG_QUESTIONNAIRE } from '../data/sdgAssessmentData';
import { SDG_DATA } from '../data/emissionFactors';

/**
 * Evaluates the user's SDG impact across all 17 goals.
 *
 * @param {Object.<string, string>} answers - Questionnaire answers map (questionId -> answerKey).
 * @param {Object|null} footprintResult - Optional carbon footprint result object.
 * @returns {Object} Comprehensive 17-SDG evaluation result.
 */
export function evaluateSDGImpact(answers = {}, footprintResult = null) {
  const ALL_SDG_IDS = Array.from({ length: 17 }, (_, i) => i + 1);

  const resultsBySDG = {};
  const academicPipelines = [];

  // Group questionnaire questions by SDG
  const questionsBySDG = {};
  ALL_SDG_IDS.forEach((id) => {
    questionsBySDG[id] = SDG_QUESTIONNAIRE.filter((q) => q.sdgs && q.sdgs.includes(id));
  });

  ALL_SDG_IDS.forEach((sdgId) => {
    const meta = SDG_DATA.find((s) => s.id === sdgId) || {
      id: sdgId,
      title: `SDG ${sdgId}`,
      color: '#16a34a',
      icon: 'Globe',
      group: 'General',
      description: '',
      relevance: '',
    };

    const relatedQuestions = questionsBySDG[sdgId] || [];
    let answeredCount = 0;
    let positiveScore = 0;
    const supportedActions = [];
    const opportunities = [];
    const recommendedActions = [];

    relatedQuestions.forEach((q) => {
      const ans = answers[q.id];

      // Handle both new options ('regularly', 'sometimes', 'not_currently') and legacy ('yes', 'no')
      if (ans === 'regularly' || ans === 'yes') {
        answeredCount++;
        positiveScore += 1;
        supportedActions.push({
          questionId: q.id,
          habit: q.positiveActionText,
          category: q.category,
          level: 'Regular habit',
        });

        academicPipelines.push({
          habit: q.positiveActionText,
          status: 'Supporting',
          sdgId,
          sdgTitle: meta.title,
          opportunity: 'Maintain habit and inspire household / peers to adopt it',
          recommendedAction: `Continue ${q.positiveActionText.toLowerCase()} and advocate for community participation.`,
          actionObj: q.defaultAction,
        });
      } else if (ans === 'sometimes') {
        answeredCount++;
        positiveScore += 0.5;
        supportedActions.push({
          questionId: q.id,
          habit: `${q.positiveActionText} (occasional)`,
          category: q.category,
          level: 'Developing habit',
        });

        // Also add an opportunity to turn occasional action into a consistent daily routine
        opportunities.push({
          questionId: q.id,
          gap: `Currently practiced only sometimes: ${q.positiveActionText.toLowerCase()}`,
          category: q.category,
        });
        recommendedActions.push(q.defaultAction);

        academicPipelines.push({
          habit: `Practices sometimes: ${q.question.replace(/^Do you\s+/i, '').replace(/\?$/, '')}`,
          status: 'Developing',
          sdgId,
          sdgTitle: meta.title,
          opportunity: `Transition occasional practice into a regular daily routine`,
          recommendedAction: q.defaultAction.title,
          actionObj: q.defaultAction,
        });
      } else if (ans === 'not_currently' || ans === 'no') {
        answeredCount++;
        opportunities.push({
          questionId: q.id,
          gap: q.opportunityText,
          category: q.category,
        });
        recommendedActions.push(q.defaultAction);

        academicPipelines.push({
          habit: `Currently does not: ${q.question.replace(/^Do you\s+/i, '').replace(/\?$/, '')}`,
          status: 'Opportunity',
          sdgId,
          sdgTitle: meta.title,
          opportunity: q.opportunityText,
          recommendedAction: q.defaultAction.title,
          actionObj: q.defaultAction,
        });
      }
      // 'na', 'skip', undefined: ignored, not counted as negative
    });

    // ── Incorporate Carbon Footprint Context (if available) ─────────────────
    if (footprintResult) {
      if (sdgId === 7 && footprintResult.electricityCO2 > 60) {
        opportunities.push({
          questionId: 'fp_electricity',
          gap: `Electricity emissions are relatively high (~${footprintResult.electricityCO2.toFixed(1)} kg CO₂/mo)`,
          category: 'Energy Demand',
        });
      }

      if (sdgId === 11 && footprintResult.carCO2 > 40) {
        opportunities.push({
          questionId: 'fp_transport',
          gap: `Personal motor vehicle travel produces substantial emissions (~${footprintResult.carCO2.toFixed(1)} kg CO₂/mo)`,
          category: 'Urban Mobility',
        });
      }

      if (sdgId === 12 && footprintResult.recyclingRate < 35 && footprintResult.inputs?.weeklyWaste > 0) {
        opportunities.push({
          questionId: 'fp_recycling',
          gap: `Household recycling rate is currently ${footprintResult.recyclingRate.toFixed(0)}%, indicating unsegregated dry recyclables`,
          category: 'Waste Segregation',
        });
      }

      if (sdgId === 13) {
        if (footprintResult.totalMonthly > 150) {
          opportunities.push({
            questionId: 'fp_total_high',
            gap: `Overall estimated carbon footprint is ~${footprintResult.totalMonthly.toFixed(1)} kg CO₂/mo, leaving significant room for decarbonization`,
            category: 'Climate Action',
          });
        } else if (footprintResult.totalMonthly > 0 && footprintResult.totalMonthly <= 100) {
          supportedActions.push({
            questionId: 'fp_total_low',
            habit: `Maintains a modest personal carbon footprint (~${footprintResult.totalMonthly.toFixed(1)} kg CO₂/mo)`,
            category: 'Climate Action',
            level: 'Calculated metric',
          });
        }
      }

      if (sdgId === 2 && Number(footprintResult.inputs?.weeklyWaste) > 12) {
        opportunities.push({
          questionId: 'fp_food_waste',
          gap: `High weekly waste volume (~${footprintResult.inputs.weeklyWaste} kg/wk) suggests potential organic food scrap loss`,
          category: 'Food Conservation',
        });
      }
    }

    // ── Determine Status ───────────────────────────────────────────────────
    let status = 'Not Yet Assessed';

    if (answeredCount === 0 && supportedActions.length === 0 && opportunities.length === 0) {
      status = 'Not Yet Assessed';
    } else if (supportedActions.length > 0) {
      // User has reported supporting habits (even if there are room for improvement)
      status = 'Supporting';
    } else if (opportunities.length > 0) {
      // User answered questions but has not adopted supporting habits yet
      status = 'Opportunity to Improve';
    }

    resultsBySDG[sdgId] = {
      id: sdgId,
      sdgId,
      number: sdgId,
      title: meta.title,
      color: meta.color,
      icon: meta.icon,
      group: meta.group,
      description: meta.description,
      relevance: meta.relevance,
      status, // 'Supporting' | 'Opportunity to Improve' | 'Not Yet Assessed'
      positiveScore,
      answeredCount,
      totalQuestions: relatedQuestions.length,
      supportedActions,
      opportunities,
      recommendedActions,
    };
  });

  // Categorize for dashboard views
  const allEvaluatedList = ALL_SDG_IDS.map((id) => resultsBySDG[id]);

  const supportedSDGs = allEvaluatedList.filter((s) => s.status === 'Supporting');
  const opportunitySDGs = allEvaluatedList.filter((s) => s.status === 'Opportunity to Improve' || s.opportunities.length > 0);
  const unassessedSDGs = allEvaluatedList.filter((s) => s.status === 'Not Yet Assessed');

  const totalAnswered = Object.values(answers).filter(
    (v) => v === 'regularly' || v === 'sometimes' || v === 'not_currently' || v === 'yes' || v === 'no'
  ).length;

  return {
    resultsBySDG,
    allEvaluatedList,
    supportedSDGs,
    opportunitySDGs,
    unassessedSDGs,
    academicPipelines,
    stats: {
      totalSDGs: 17,
      supportingCount: supportedSDGs.length,
      opportunityCount: allEvaluatedList.filter((s) => s.status === 'Opportunity to Improve').length,
      unassessedCount: unassessedSDGs.length,
      activeOpportunitiesCount: opportunitySDGs.length,
      totalAnswered,
      totalQuestions: SDG_QUESTIONNAIRE.length,
      completionPercentage: Math.round((totalAnswered / SDG_QUESTIONNAIRE.length) * 100),
    },
    totalAnswered,
    totalQuestions: SDG_QUESTIONNAIRE.length,
  };
}
