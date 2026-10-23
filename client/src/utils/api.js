/**
 * @fileoverview API client utilities for EcoTrack.
 *
 * All functions communicate with the Express backend via the /api prefix,
 * which Vite proxies to http://localhost:5000 during development.
 *
 * Return shape (success):  { success: true,  data: <responseBody> }
 * Return shape (failure):  { success: false, error: <string> }
 *
 * Functions never throw — all errors are caught and returned as structured
 * failure objects so UI components can handle them gracefully.
 */

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Perform a JSON POST request and return a normalised result object.
 *
 * @param {string} endpoint - API path, e.g. '/api/ai/recommendations'.
 * @param {Object} body     - Request payload (will be JSON-serialised).
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
async function postJSON(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Parse response body (attempt JSON regardless of status code so we
    // can surface structured error messages from the server).
    let responseData;
    try {
      responseData = await response.json();
    } catch {
      // Response body is not valid JSON — use status text as error message.
      responseData = { message: response.statusText || 'Unknown server error' };
    }

    if (!response.ok) {
      // Surface the server's error message if available
      const errorMsg =
        responseData?.message ||
        responseData?.error ||
        `Request failed with status ${response.status}`;
      return { success: false, error: errorMsg };
    }

    return { success: true, data: responseData };
  } catch (networkError) {
    // Network failure (offline, CORS, DNS, etc.)
    const message =
      networkError instanceof Error
        ? networkError.message
        : 'Network error — please check your connection.';
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// AI Endpoints
// ---------------------------------------------------------------------------

/**
 * Request AI-generated sustainability recommendations based on a user's
 * calculated carbon footprint data.
 *
 * Sends the footprint breakdown to the backend, which queries the AI model
 * and returns personalised, actionable recommendations.
 *
 * @param {Object} footprintData - A FootprintResult object from calculateFootprint().
 *   Expected fields: electricityCO2, carCO2, bikeCO2, publicTransportCO2,
 *   wasteCO2, totalMonthly, annualCO2, recyclingRate, largestCategory, inputs.
 * @returns {Promise<{ success: boolean, data?: { recommendations: string }, error?: string }>}
 *
 * @example
 * const result = await generateRecommendations(footprint);
 * if (result.success) {
 *   console.log(result.data.recommendations);
 * } else {
 *   console.error(result.error);
 * }
 */
export async function generateRecommendations(footprintData) {
  return postJSON('/api/ai/recommendations', { footprintData });
}

/**
 * Send a user message to the EcoBot AI assistant along with the current
 * conversation history for context-aware replies.
 *
 * @param {string} message - The latest message from the user.
 * @param {Array.<{ role: 'user'|'assistant', content: string }>} conversationHistory
 *   Prior messages in the conversation, ordered oldest → newest.
 *   Pass an empty array to start a fresh conversation.
 * @returns {Promise<{ success: boolean, data?: { reply: string }, error?: string }>}
 *
 * @example
 * const result = await chatWithEcoBot('How can I reduce my car emissions?', history);
 * if (result.success) {
 *   console.log(result.data.reply);
 * } else {
 *   console.error(result.error);
 * }
 */
function getClientFallbackAnswer(message) {
  const q = (message || '').toLowerCase();
  if (q.includes('carbon footprint') || q.includes('co2') || q.includes('emissions')) {
    return 'A carbon footprint measures total greenhouse gas emissions caused by an individual or activity, expressed in kg of CO₂ equivalent. Major sources include electricity use, personal transport, and solid waste. Reducing your footprint starts with measuring these activities and taking targeted conservation steps.';
  }
  if (q.includes('recycle') || q.includes('recycling') || q.includes('waste')) {
    return 'Recycling turns sorted waste materials (plastics, paper, glass, metals) into secondary raw materials, reducing landfill burden. Always rinse containers, keep dry paper separate from wet food waste, and follow the 4R hierarchy: Reduce → Reuse → Repair → Recycle.';
  }
  if (q.includes('circular economy')) {
    return 'The circular economy replaces the linear "take-make-dispose" throughput with restorative cycles. By reusing containers, repairing broken items, and designing for durability, materials stay in productive loops and avoid becoming landfill waste.';
  }
  if (q.includes('sdg') || q.includes('sustainable development')) {
    return "The UN's 17 Sustainable Development Goals provide a global roadmap for peace and prosperity by 2030. Key environmental goals include SDG 6 (Clean Water), SDG 7 (Clean Energy), SDG 11 (Sustainable Cities), SDG 12 (Responsible Consumption), and SDG 13 (Climate Action).";
  }
  if (q.includes('energy') || q.includes('electricity') || q.includes('power')) {
    return 'Electricity generation from fossil fuels is a major contributor to greenhouse gases. You can easily cut energy use by switching to LED bulbs, turning off devices at the wall to eliminate standby power, and setting air conditioners to 24-25°C.';
  }
  if (q.includes('transport') || q.includes('car') || q.includes('bike') || q.includes('travel')) {
    return 'Transportation is often the largest single source of personal emissions. Choosing public transport, cycling or walking for trips under 2 km, and carpooling drastically lowers per-passenger emissions and urban traffic.';
  }
  return 'Sustainability is about meeting present needs without compromising the ability of future generations to meet theirs. Small daily habits — saving electricity, conserving water, reducing single-use plastics, and recycling — cumulatively create meaningful positive impact.';
}

export async function chatWithEcoBot(message, conversationHistory = []) {
  const result = await postJSON('/api/ai/chat', { message, conversationHistory });
  if (result.success) {
    return result.data?.response || result.data?.reply || 'No response from EcoBot.';
  }
  // If backend was unreachable or returned error, provide instant fallback answer
  return getClientFallbackAnswer(message);
}

/**
 * Generate AI-powered SDG recommendations based on evaluated questionnaire
 * results and optional carbon footprint metrics.
 *
 * @param {Object} payload - { evaluatedSDGs: Array, footprintResult: Object|null }
 * @returns {Promise<{ success: boolean, data?: { recommendations: Array, isFallback: boolean }, error?: string }>}
 */
export async function generateSDGRecommendations(payload) {
  return postJSON('/api/ai/sdg-recommendations', payload);
}

