/**
 * @fileoverview LocalStorage helpers for EcoTrack.
 *
 * Data is namespaced under the prefix "ecotrack_" to avoid collisions
 * with other apps on the same origin.
 *
 * Keys used:
 *  - ecotrack_assessments   → Array of FootprintResult snapshots (max 20)
 *  - ecotrack_challenges    → Object mapping challenge ID → boolean (completed)
 */

// ---------------------------------------------------------------------------
// Storage key constants
// ---------------------------------------------------------------------------

const KEYS = {
  ASSESSMENTS: 'ecotrack_assessments',
  CHALLENGES: 'ecotrack_challenges',
  SDG_ASSESSMENT: 'ecotrack_sdg_assessment',
  SDG_ACTIONS: 'ecotrack_sdg_actions',
};

/** Maximum number of assessment snapshots to retain. */
const MAX_ASSESSMENTS = 20;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Read and parse a JSON value from LocalStorage.
 * Returns `fallback` if the key is missing or the value is malformed.
 *
 * @template T
 * @param {string} key      - LocalStorage key.
 * @param {T}      fallback - Default value when nothing is stored.
 * @returns {T}
 */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Serialize a value to JSON and write it to LocalStorage.
 * Silently no-ops if storage is unavailable (e.g. private browsing quotas).
 *
 * @param {string} key   - LocalStorage key.
 * @param {*}      value - Value to persist.
 */
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or unavailable — fail silently.
  }
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

/**
 * Retrieve all stored footprint assessment snapshots.
 *
 * @returns {Array.<Object>} Chronological list of saved assessments.
 *   Each entry is a FootprintResult extended with `id` and `savedAt` fields.
 */
export function getAssessments() {
  return readJSON(KEYS.ASSESSMENTS, []);
}

/**
 * Save a new footprint result snapshot.
 * Appends the result to the stored array, tagging it with a unique `id`
 * and an ISO-8601 `savedAt` timestamp. Trims the list to MAX_ASSESSMENTS
 * by discarding the oldest entries first.
 *
 * @param {Object} footprintResult - A FootprintResult object from calculateFootprint().
 * @returns {Object} The saved entry (with `id` and `savedAt` fields added).
 */
export function saveAssessment(footprintResult) {
  const existing = getAssessments();

  const entry = {
    ...footprintResult,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
  };

  // Append and enforce maximum length (keep the most recent entries)
  const updated = [...existing, entry].slice(-MAX_ASSESSMENTS);
  writeJSON(KEYS.ASSESSMENTS, updated);

  return entry;
}

/**
 * Delete a stored assessment by its `id`.
 *
 * @param {string} id - The unique ID of the assessment to remove.
 * @returns {boolean} `true` if an entry was found and removed, `false` otherwise.
 */
export function deleteAssessment(id) {
  const existing = getAssessments();
  const filtered = existing.filter((a) => a.id !== id);

  if (filtered.length === existing.length) return false; // nothing removed

  writeJSON(KEYS.ASSESSMENTS, filtered);
  return true;
}

// ---------------------------------------------------------------------------
// Eco Challenge Progress
// ---------------------------------------------------------------------------

/**
 * Retrieve the current state of all eco challenge completions.
 *
 * @returns {Object.<number, boolean>} Map of challenge ID → completed flag.
 */
export function getChallengeProgress() {
  return readJSON(KEYS.CHALLENGES, {});
}

/**
 * Toggle the completion state of a specific eco challenge.
 * If the challenge is currently incomplete it will be marked complete, and vice versa.
 *
 * @param {number|string} id - The challenge ID to toggle.
 * @returns {boolean} The new completion state after toggling.
 */
export function toggleChallenge(id) {
  const progress = getChallengeProgress();
  const newState = !progress[id];
  const updated = { ...progress, [id]: newState };
  writeJSON(KEYS.CHALLENGES, updated);
  return newState;
}

// ---------------------------------------------------------------------------
// SDG Impact Assessment & Action Plan
// ---------------------------------------------------------------------------

/**
 * Retrieve saved SDG questionnaire answers.
 * @returns {Object.<string, 'yes'|'no'|'skip'>}
 */
export function getSDGAnswers() {
  return readJSON(KEYS.SDG_ASSESSMENT, {});
}

/**
 * Save SDG questionnaire answers to LocalStorage.
 * @param {Object.<string, 'yes'|'no'|'skip'>} answers
 */
export function saveSDGAnswers(answers) {
  writeJSON(KEYS.SDG_ASSESSMENT, answers);
}

/**
 * Retrieve user's selected SDG Action Plan items.
 * Each action item: { id, title, sdg, category, completed, addedAt }
 * @returns {Array.<Object>}
 */
export function getSDGActions() {
  return readJSON(KEYS.SDG_ACTIONS, []);
}

/**
 * Add a recommended action to the user's SDG Action Plan.
 * Avoids duplicate actions by ID.
 * @param {Object} action - Action object { id, title, sdg, category, impact }
 * @returns {Array.<Object>} The updated action plan list.
 */
export function addSDGAction(action) {
  const actions = getSDGActions();
  if (actions.some((a) => a.id === action.id)) {
    return actions; // already added
  }
  const updated = [
    ...actions,
    {
      ...action,
      completed: false,
      addedAt: new Date().toISOString(),
    },
  ];
  writeJSON(KEYS.SDG_ACTIONS, updated);
  return updated;
}

/**
 * Toggle the completion status of an action in the SDG Action Plan.
 * @param {string} actionId
 * @returns {Array.<Object>} Updated list of actions.
 */
export function toggleSDGAction(actionId) {
  const actions = getSDGActions();
  const updated = actions.map((a) =>
    a.id === actionId ? { ...a, completed: !a.completed } : a
  );
  writeJSON(KEYS.SDG_ACTIONS, updated);
  return updated;
}

/**
 * Remove an action from the user's SDG Action Plan.
 * @param {string} actionId
 * @returns {Array.<Object>} Updated list of actions.
 */
export function removeSDGAction(actionId) {
  const actions = getSDGActions();
  const updated = actions.filter((a) => a.id !== actionId);
  writeJSON(KEYS.SDG_ACTIONS, updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Data Management
// ---------------------------------------------------------------------------

/**
 * Erase all EcoTrack data from LocalStorage.
 * Useful for a "reset" / "clear my data" feature.
 */
export function clearAllData() {
  Object.values(KEYS).forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors — storage may already be cleared.
    }
  });
}
