// ============================================================
//  EcoTrack – Gemini AI Service
//  Wraps the Google Generative AI SDK with two app-specific
//  helpers: generateRecommendations and chatWithEcoBot.
// ============================================================

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Read configuration from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

// Initialise the SDK client once and reuse it across calls.
function getClient() {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured.');
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * Enforces a timeout on async operations so external API delays don't freeze requests.
 */
function withTimeout(promise, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini API call timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Executes a prompt with automatic multi-model failover.
 * Tries the configured model first, then falls back to secondary supported models
 * if Google returns high-demand 503 errors.
 */
async function generateContentWithFallback(prompt, timeoutMs = 15000) {
  const client = getClient();
  const candidates = [
    GEMINI_MODEL,
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  let lastError = null;

  for (const modelName of candidates) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await withTimeout(model.generateContent(prompt), timeoutMs);
      const text = result?.response?.text();
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err) {
      console.warn(`[GeminiService] Model ${modelName} returned error: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to generate content.');
}

// ── 1. generateRecommendations ───────────────────────────────
/**
 * Calls Gemini to produce personalised sustainability recommendations
 * based on the user's calculated carbon footprint data.
 *
 * @param {Object} footprintData - Aggregated footprint metrics from the calculator:
 *   {
 *     totalMonthly        {number}  kg CO₂e per month (total)
 *     annualCO2           {number}  kg CO₂e per year
 *     electricityCO2      {number}  kg CO₂e/month from electricity
 *     carCO2              {number}  kg CO₂e/month from car travel
 *     bikeCO2             {number}  kg CO₂e/month from motorbike
 *     publicTransportCO2  {number}  kg CO₂e/month from public transport
 *     wasteCO2            {number}  kg CO₂e/month from waste
 *     recyclingRate       {number}  percentage of waste recycled (0-100)
 *     largestCategory     {string}  e.g. "Electricity", "Car Travel"
 *   }
 * @returns {Promise<string>} Gemini's plain-text response
 */
async function generateRecommendations(footprintData) {
  try {
    const client = getClient();
    const model  = client.getGenerativeModel({ model: GEMINI_MODEL });

    // Destructure the data for easier use in the prompt
    const {
      totalMonthly       = 0,
      annualCO2          = 0,
      electricityCO2     = 0,
      carCO2             = 0,
      bikeCO2            = 0,
      publicTransportCO2 = 0,
      wasteCO2           = 0,
      recyclingRate      = 0,
      largestCategory    = 'unknown',
    } = footprintData;

    // Build a detailed prompt that gives Gemini the context it needs
    // to produce relevant, personalised recommendations.
    const prompt = `
You are an environmental advisor helping a student understand and reduce their carbon footprint.

Here is the student's calculated carbon footprint data for this month:
- Total monthly footprint: ${totalMonthly.toFixed(2)} kg CO₂e
- Estimated annual footprint: ${annualCO2.toFixed(2)} kg CO₂e
- Electricity usage: ${electricityCO2.toFixed(2)} kg CO₂e/month
- Car travel: ${carCO2.toFixed(2)} kg CO₂e/month
- Motorbike travel: ${bikeCO2.toFixed(2)} kg CO₂e/month
- Public transport: ${publicTransportCO2.toFixed(2)} kg CO₂e/month
- Waste generated: ${wasteCO2.toFixed(2)} kg CO₂e/month
- Recycling rate: ${recyclingRate.toFixed(1)}%
- Largest contributing category: ${largestCategory}

Please provide a response structured as follows:

1. **Impact Summary** (2-3 sentences): Write a short, encouraging summary of the student's environmental impact based on the data above. Compare it to a meaningful real-world equivalent (e.g., driving km, tree-months to absorb it). Use simple, accessible language.

2. **Top 3 Recommendations**: List the 3 most useful, actionable sustainability improvements the student can make, prioritised by their likely impact based on the data above.

3. **Practical Steps**: For each recommendation, provide 2-3 specific, easy-to-follow steps the student can start this week.

4. **Waste & Recycling Tips**: Based on the recycling rate of ${recyclingRate.toFixed(1)}%, suggest concrete improvements the student can make to their waste management habits. Mention circular economy principles where relevant.

5. **Relevant SDGs**: Briefly connect the recommendations to at least two of the following UN Sustainable Development Goals: SDG 7 (Affordable & Clean Energy), SDG 11 (Sustainable Cities), SDG 12 (Responsible Consumption), SDG 13 (Climate Action).

Important guidelines:
- Use simple, friendly language suitable for students.
- Do NOT invent specific emissions savings numbers or modify the calculated values above.
- Keep the total response under 500 words.
- Focus on positive, achievable actions rather than guilt.
- Apply circular economy principles where relevant.
`;

    const text = await generateContentWithFallback(prompt);
    return text;
  } catch (err) {
    // Re-throw with a descriptive wrapper message so the route can log it
    throw new Error(`Gemini generateRecommendations failed: ${err.message}`);
  }
}

// ── 2. chatWithEcoBot ────────────────────────────────────────
/**
 * Sends a user message plus conversation history to Gemini and
 * returns EcoBot's reply as a plain string.
 *
 * @param {string} userMessage          - The student's latest question
 * @param {Array<{role:string, text:string}>} conversationHistory
 *   - Previous turns in the conversation, e.g.:
 *     [ { role: 'user', text: 'What is a carbon footprint?' },
 *       { role: 'assistant', text: 'A carbon footprint is ...' } ]
 * @returns {Promise<string>} EcoBot's plain-text reply
 */
async function chatWithEcoBot(userMessage, conversationHistory = []) {
  try {
    const client = getClient();
    const model  = client.getGenerativeModel({ model: GEMINI_MODEL });

    // System persona — injected at the start of every prompt
    const systemContext = `You are EcoBot, a friendly sustainability assistant for the EcoTrack app. \
You help students understand carbon footprints, waste management, recycling, circular economy principles, \
and the UN Sustainable Development Goals (SDGs). \
Use simple, clear language with practical, relatable examples. \
Keep answers concise — 3 to 5 sentences maximum — unless the question clearly requires more detail. \
Always be encouraging and solution-focused.`;

    // Build a structured conversation history section for context
    let historySection = '';
    if (conversationHistory.length > 0) {
      historySection = '\n\nPrevious conversation:\n';
      conversationHistory.forEach(({ role, text }) => {
        // Normalise role labels for readability in the prompt
        const label = role === 'assistant' ? 'EcoBot' : 'Student';
        historySection += `${label}: ${text}\n`;
      });
    }

    // Combine everything into a single prompt string
    const prompt = `${systemContext}${historySection}\n\nStudent: ${userMessage}\nEcoBot:`;

    const text = await generateContentWithFallback(prompt);
    return text;
  } catch (err) {
    throw new Error(`Gemini chatWithEcoBot failed: ${err.message}`);
  }
}

// ── 3. generateSDGRecommendations ────────────────────────────
/**
 * Generates personalized SDG recommendations based on questionnaire
 * answers and identified improvement opportunities.
 *
 * @param {Object} assessmentData
 *   {
 *     evaluatedSDGs: Array<{ sdgId, title, status, supportedActions, opportunities }>,
 *     footprintResult: Object|null
 *   }
 * @returns {Promise<Array<Object>>} Structured array of SDG recommendations
 */
async function generateSDGRecommendations(assessmentData) {
  try {
    const { evaluatedSDGs = [], footprintResult = null } = assessmentData;

    // Build context across all 17 SDGs in order
    const evalMap = new Map();
    for (const s of evaluatedSDGs) {
      const id = Number(s.sdgId || s.id);
      if (id) evalMap.set(id, s);
    }

    const all17Targets = [];
    for (let id = 1; id <= 17; id++) {
      const existing = evalMap.get(id);
      if (existing) {
        all17Targets.push(existing);
      } else {
        all17Targets.push({ id, sdgId: id, title: `SDG ${id}`, supportedActions: [], opportunities: [] });
      }
    }

    const sdgContextList = all17Targets.map((t) => {
      const doingItems = Array.isArray(t.supportedActions) ? t.supportedActions : [];
      const doing = doingItems
        .map((a) => (typeof a === 'string' ? a : a.habit || a.title || ''))
        .filter(Boolean)
        .join('; ') || 'None reported yet';

      const oppItems = Array.isArray(t.opportunities) ? t.opportunities : [];
      const improve = oppItems
        .map((o) => (typeof o === 'string' ? o : o.gap || o.title || ''))
        .filter(Boolean)
        .join('; ') || 'General everyday sustainability actions';

      return `SDG ${t.sdgId || t.id || ''} (${t.title || ''}):\n  - Reported current actions: ${doing}\n  - Identified gaps: ${improve}`;
    }).join('\n\n');

    let fpContext = 'No carbon footprint calculation recorded.';
    if (footprintResult) {
      fpContext = `Carbon Footprint context:
- Monthly Total: ${Number(footprintResult.totalMonthly || 0).toFixed(1)} kg CO2
- Electricity: ${Number(footprintResult.electricityCO2 || 0).toFixed(1)} kg CO2
- Car Travel: ${Number(footprintResult.carCO2 || 0).toFixed(1)} kg CO2
- Recycling Rate: ${Number(footprintResult.recyclingRate || 0).toFixed(0)}%`;
    }

    const prompt = `
You are a sustainability advisor for EcoTrack, an educational web app on Circular Economy & Sustainable Development.
Generate personalized, student-friendly recommendations for ALL 17 UN Sustainable Development Goals (SDG 1 through SDG 17), tailored to the student's reported lifestyle habits and carbon footprint data:

${sdgContextList}

${fpContext}

Requirements:
1. Provide an array of EXACTLY 17 objects in order (SDG 1 to SDG 17).
2. For each SDG:
   - "sdgNumber": (integer, 1 to 17)
   - "sdgName": (string, e.g. "SDG 1 – No Poverty")
   - "whyItMatters": (1-2 concise sentences on why this goal matters in everyday student life)
   - "whatYouAreDoing": (Acknowledge positive habits the student reported for this goal, or "Building foundational awareness" if none yet)
   - "whatYouCanImprove": (Directly state what habit can be improved based on reported gaps or practical everyday opportunities)
   - "actions": An array of EXACTLY 3 simple, practical, affordable actions to try. Each action must have "title" (string, max 10 words) and "description" (string, 1-2 practical sentences).

3. Important constraints:
   - Use simple language suitable for college students.
   - Do NOT invent user habits or claim scientifically verified savings.
   - Keep actions realistic, accessible, and low-cost.
   - Focus on circular economy principles (Reduce, Reuse, Repair, Recycle).

Return ONLY valid JSON (a single JSON array of 17 objects). Do NOT wrap in markdown code blocks or add any extra text outside the JSON array.
`;

    let text = (await generateContentWithFallback(prompt)).trim();

    // Clean up code fences if present
    if (text.startsWith('```json')) {
      text = text.slice(7);
    } else if (text.startsWith('```')) {
      text = text.slice(3);
    }
    if (text.endsWith('```')) {
      text = text.slice(0, -3);
    }
    text = text.trim();

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      throw new Error('Gemini response was not an array');
    }

    return parsed;
  } catch (err) {
    throw new Error(`Gemini generateSDGRecommendations failed: ${err.message}`);
  }
}

module.exports = { generateRecommendations, chatWithEcoBot, generateSDGRecommendations };
