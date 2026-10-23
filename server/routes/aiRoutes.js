// ============================================================
//  EcoTrack – AI Routes
//  POST /api/ai/recommendations  – personalised sustainability tips
//  POST /api/ai/chat             – EcoBot conversational assistant
// ============================================================

const express = require('express');
const router  = express.Router();
const { generateRecommendations, chatWithEcoBot, generateSDGRecommendations } = require('../services/geminiService');

// ── Helper: check if Gemini is configured ───────────────────
/**
 * Returns true when the API key is present and not the placeholder value.
 * Both routes use this to decide whether to call Gemini or return a fallback.
 */
function isGeminiConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return key && key !== 'your_gemini_api_key_here';
}

// ── Fallback content ─────────────────────────────────────────
// Shown when the Gemini API key is not configured, so the app
// is still useful for students even without a live AI connection.

const FALLBACK_RECOMMENDATIONS = `
## 🌿 Your Sustainability Recommendations

**Impact Summary**
Your carbon footprint calculation is complete! Every action you take to reduce your emissions makes a real difference. Here are some practical steps based on common footprint patterns to help you live more sustainably.

---

### ⚡ 1. Reduce Your Energy Use (SDG 7 – Affordable & Clean Energy)
Electricity generation is often the biggest source of household emissions.
- Switch to LED light bulbs — they use up to 80% less energy than traditional bulbs.
- Unplug chargers, TVs, and appliances when not in use (standby power adds up!).
- Set your thermostat or air-conditioner 1–2°C closer to the outdoor temperature.
- Consider switching to a renewable energy plan with your electricity provider.

---

### 🚗 2. Rethink How You Travel (SDG 11 – Sustainable Cities & Communities)
Transportation is a major contributor to personal carbon footprints.
- Walk or cycle for journeys under 3 km whenever possible.
- Use public transport (bus, train, metro) instead of driving alone.
- If you must drive, carpool with friends or colleagues.
- Combine multiple errands into a single trip to reduce total distance.

---

### ♻️ 3. Reduce Waste & Recycle Smarter (SDG 12 – Responsible Consumption; SDG 13 – Climate Action)
Waste that ends up in landfill produces methane — a potent greenhouse gas.
- Follow the **5 R's**: Refuse, Reduce, Reuse, Repurpose, Recycle (in that order).
- Set up separate bins for recyclables (paper, plastic, glass, metal) and organics.
- Start composting food scraps — compost diverts waste from landfill and enriches soil.
- Buy products with minimal packaging and choose items made from recycled materials.
- Apply **circular economy** principles: repair broken items before replacing them, and donate or sell things you no longer need instead of throwing them away.

---

### 🌍 Connected UN Sustainable Development Goals
| SDG | Goal | How Your Actions Help |
|-----|------|-----------------------|
| SDG 7  | Affordable & Clean Energy       | Using less electricity reduces fossil fuel demand |
| SDG 11 | Sustainable Cities & Communities | Active and public transport builds greener cities |
| SDG 12 | Responsible Consumption          | Buying less and recycling more closes resource loops |
| SDG 13 | Climate Action                   | Every kg of CO₂ avoided slows global warming |

---

> 💡 **Tip:** Add your real Gemini API key in \`server/.env\` to receive personalised AI recommendations based on your exact footprint data!
`.trim();

/**
 * Generates a fallback chat response when Gemini is not available.
 * Tries to give a relevant general answer based on keywords in the question.
 *
 * @param {string} question - The user's message
 * @returns {string} A helpful fallback response
 */
function getFallbackChatResponse(question) {
  const q = question.toLowerCase();

  let answer = '';

  if (q.includes('carbon footprint') || q.includes('co2') || q.includes('emissions')) {
    answer = 'A carbon footprint measures the total greenhouse gas emissions caused by an individual, event, or product — expressed in kg of CO₂ equivalent (CO₂e). Common sources include electricity use, transportation, food, and waste. Reducing your footprint starts with knowing where your biggest emissions come from, then taking targeted action in those areas.';
  } else if (q.includes('recycle') || q.includes('recycling') || q.includes('waste')) {
    answer = 'Recycling turns used materials (paper, glass, plastic, metal) back into new products, saving energy and raw materials. To recycle effectively: clean your recyclables before putting them in the bin, check your local council\'s accepted materials list, and prioritise reducing and reusing before recycling. Composting food scraps is another great way to divert waste from landfill.';
  } else if (q.includes('circular economy')) {
    answer = 'The circular economy is a model where products and materials are kept in use for as long as possible — through reuse, repair, remanufacturing, and recycling — rather than being thrown away. It contrasts with the traditional "take-make-dispose" linear economy. Everyday circular actions include buying second-hand, repairing broken items, and choosing products made from recycled content.';
  } else if (q.includes('sdg') || q.includes('sustainable development')) {
    answer = 'The UN\'s 17 Sustainable Development Goals (SDGs) are a global blueprint for a better, more sustainable future by 2030. For environmental action, key goals include SDG 7 (Clean Energy), SDG 11 (Sustainable Cities), SDG 12 (Responsible Consumption & Production), and SDG 13 (Climate Action). Small daily choices — like saving energy or reducing waste — contribute directly to these global goals.';
  } else if (q.includes('transport') || q.includes('travel') || q.includes('car') || q.includes('bus') || q.includes('train')) {
    answer = 'Transportation is one of the largest sources of personal carbon emissions. The most impactful switches are: walk or cycle for short trips, use public transport instead of driving alone, and avoid flying where possible. If you must drive, carpooling or choosing an electric vehicle significantly reduces emissions per kilometre.';
  } else if (q.includes('energy') || q.includes('electricity') || q.includes('power')) {
    answer = 'Electricity generation (often from coal or gas) is a leading cause of carbon emissions. You can reduce your energy footprint by using LED lighting, switching off appliances at the wall, improving home insulation, and choosing a renewable energy provider. Renewable sources like solar and wind produce electricity with near-zero emissions.';
  } else {
    answer = 'Great question! Sustainability is about meeting today\'s needs without compromising future generations\' ability to meet theirs. Small everyday actions — like reducing energy use, choosing public transport, eating less meat, and recycling — all add up to significant impact. Would you like to know more about a specific topic like carbon footprints, recycling, or the circular economy?';
  }

  return `🤖 **EcoBot (Offline Mode)**\n\n${answer}\n\n> 💡 *For personalised AI responses, add your Gemini API key to \`server/.env\`. Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey).*`;
}

// ── POST /api/ai/recommendations ─────────────────────────────
/**
 * Accepts the user's footprint metrics and returns sustainability
 * recommendations — either from Gemini or from the hardcoded fallback.
 *
 * Request body: { footprintData: { totalMonthly, annualCO2, ... } }
 * Response:     { success: true, recommendations: string }
 */
router.post('/recommendations', async (req, res) => {
  const { footprintData } = req.body;

  // ── Fallback: Gemini not configured ──────────────────────
  if (!isGeminiConfigured()) {
    console.warn('[/recommendations] Gemini API key not configured — returning fallback.');
    return res.json({
      success: true,
      recommendations: FALLBACK_RECOMMENDATIONS,
    });
  }

  try {
    // Call the Gemini service with the user's footprint data
    const recommendations = await generateRecommendations(footprintData || {});
    return res.json({ success: true, recommendations });
  } catch (err) {
    console.error('[/recommendations] Gemini error:', err.message);
    // Graceful fallback to verified rule-based sustainability recommendations
    return res.json({
      success: true,
      recommendations: FALLBACK_RECOMMENDATIONS,
      isFallback: true,
    });
  }
});

// ── POST /api/ai/chat ─────────────────────────────────────────
/**
 * Handles a single EcoBot chat turn.
 *
 * Request body:
 *   {
 *     message:             string   (required, max 500 chars)
 *     conversationHistory: Array<{role: string, text: string}>  (optional)
 *   }
 * Response: { success: true, response: string }
 */
router.post('/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  // ── Input validation ──────────────────────────────────────
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'A non-empty message string is required.',
    });
  }

  if (message.length > 500) {
    return res.status(400).json({
      success: false,
      error: 'Message must be 500 characters or fewer.',
    });
  }

  // ── Fallback: Gemini not configured ──────────────────────
  if (!isGeminiConfigured()) {
    console.warn('[/chat] Gemini API key not configured — returning fallback response.');
    return res.json({
      success: true,
      response: getFallbackChatResponse(message.trim()),
    });
  }

  try {
    // Call the Gemini service with the validated message and history
    const response = await chatWithEcoBot(message.trim(), conversationHistory);
    return res.json({ success: true, response });
  } catch (err) {
    console.error('[/chat] Gemini error:', err.message);
    // Graceful fallback to verified offline answers
    return res.json({
      success: true,
      response: getFallbackChatResponse(message.trim()),
      isFallback: true,
    });
  }
});

// ── 3. Fallback SDG recommendations (Complete 17 UN SDGs) ───
const FALLBACK_SDG_RECOMMENDATIONS = [
  {
    sdgNumber: 1,
    sdgName: 'SDG 1 – No Poverty',
    whyItMatters: 'Poverty limits resilience to environmental hazards and climate disruptions. Supporting ethical livelihoods and sharing usable resources reduces vulnerability.',
    whatYouAreDoing: 'Engaging with community resource sharing and ethical consumption.',
    whatYouCanImprove: 'Donate surplus goods regularly and support local circular enterprises that pay fair wages.',
    actions: [
      { title: 'Donate wearable clothes and study books', description: 'Organize semester donations through accredited community relief programs rather than discarding items.' },
      { title: 'Support fair-trade certified products', description: 'Choose products guaranteed to provide equitable living wages to primary agricultural and craft workers.' },
      { title: 'Volunteer in campus essentials drives', description: 'Assist student relief collections and support food and stationery redistribution drives.' },
    ],
  },
  {
    sdgNumber: 2,
    sdgName: 'SDG 2 – Zero Hunger',
    whyItMatters: 'Food production accounts for one-third of global greenhouse gases while 800 million suffer from hunger. Eliminating food waste protects soil, water, and food security.',
    whatYouAreDoing: 'Examining household meal planning and food conservation habits.',
    whatYouCanImprove: 'Minimize edible leftovers, store perishables smartly, and share surplus event food.',
    actions: [
      { title: 'Implement a "Use-First" fridge shelf', description: 'Group leftovers and ripe vegetables together so they are cooked before spoiling.' },
      { title: 'Portion meals realistically before serving', description: 'Taking moderate plate servings prevents edible food from being tossed in trash bins.' },
      { title: 'Connect surplus event food with food banks', description: 'Coordinate with student associations to route untouched catered food to community shelters.' },
    ],
  },
  {
    sdgNumber: 3,
    sdgName: 'SDG 3 – Good Health and Well-being',
    whyItMatters: 'Active mobility cuts urban tailpipe exhaust while boosting cardiovascular fitness. Sustainable diets and clean air directly protect human vitality.',
    whatYouAreDoing: 'Incorporating active transit and conscious wellness choices into your daily routine.',
    whatYouCanImprove: 'Replace short vehicular commutes with walking or cycling and eat more nutrient-dense whole foods.',
    actions: [
      { title: 'Walk or bicycle for trips under 2 km', description: 'Combines zero-emission transit with refreshing daily cardiovascular exercise.' },
      { title: 'Adopt two plant-forward meal days per week', description: 'Nutrient-rich pulses and vegetables improve digestive health while shrinking your dietary carbon footprint.' },
      { title: 'Spend 20 minutes daily in natural green spaces', description: 'Walking in parks lowers cortisol stress levels and strengthens your connection with nature.' },
    ],
  },
  {
    sdgNumber: 4,
    sdgName: 'SDG 4 – Quality Education',
    whyItMatters: 'Education empowers communities to solve complex sustainability and climate challenges. Open knowledge sharing democratizes green skills.',
    whatYouAreDoing: 'Learning through EcoTrack and developing circular economy literacy.',
    whatYouCanImprove: 'Pass forward educational resources and mentor peers on practical environmental actions.',
    actions: [
      { title: 'Share textbooks and study guides with juniors', description: 'Pass down reference books and digital materials to save printing paper and peer costs.' },
      { title: 'Mentor a peer in sustainability concepts', description: 'Explain carbon footprint calculation and circular economy principles to classmates.' },
      { title: 'Attend or organize a campus eco-workshop', description: 'Engage with guest speakers and interdisciplinary seminars on renewable technologies.' },
    ],
  },
  {
    sdgNumber: 5,
    sdgName: 'SDG 5 – Gender Equality',
    whyItMatters: 'Gender diversity fosters innovative problem-solving and stronger community climate resilience. Equal rights accelerate sustainable development.',
    whatYouAreDoing: 'Reflecting on equitable participation and mutual respect in student teams.',
    whatYouCanImprove: 'Promote balanced project leadership and challenge casual stereotypes in daily conversations.',
    actions: [
      { title: 'Rotate team leadership roles equitably', description: 'Ensure presentation and technical lead duties in group work are shared equally across all genders.' },
      { title: 'Support women-led circular and green ventures', description: 'Actively patronize female-founded sustainable startups, craft initiatives, and research projects.' },
      { title: 'Constructively challenge biased stereotyping', description: 'Create a dignified and inclusive atmosphere in project group chats and social gatherings.' },
    ],
  },
  {
    sdgNumber: 6,
    sdgName: 'SDG 6 – Clean Water and Sanitation',
    whyItMatters: 'Freshwater is a finite resource under climate stress. Conservation reduces the energy needed to pump, treat, and heat municipal water.',
    whatYouAreDoing: 'Assessing your domestic water conservation habits.',
    whatYouCanImprove: 'Reduce running tap time and consider aerators or bucket bathing.',
    actions: [
      { title: 'Turn off running taps while brushing or soaping', description: 'Prevents 6-10 litres of treated water from pouring down the drain every minute.' },
      { title: 'Install inexpensive screw-on faucet aerators', description: 'Reduces tap water flow volume by up to 50% without reducing perceived pressure.' },
      { title: 'Promptly report and fix leaking pipes or taps', description: 'A slow drip can silently waste upwards of 30-50 litres of clean water per day.' },
    ],
  },
  {
    sdgNumber: 7,
    sdgName: 'SDG 7 – Affordable and Clean Energy',
    whyItMatters: 'Electricity generation from fossil fuels remains the primary driver of global carbon emissions. Improving energy efficiency eases grid load.',
    whatYouAreDoing: 'Evaluating household electrical power demand.',
    whatYouCanImprove: 'Upgrade high-usage lighting to LEDs and eliminate standby vampire power.',
    actions: [
      { title: 'Replace frequently used bulbs with LEDs', description: 'LEDs consume up to 80% less electricity and have a lifespan 15-25 times longer than incandescent bulbs.' },
      { title: 'Switch off wall sockets for idle devices', description: 'Eliminating phantom standby draw saves 5-10% on monthly electric bills effortlessly.' },
      { title: 'Maintain optimal cooling temperatures (24-25°C)', description: 'Setting ACs to moderate temperatures significantly reduces compressor work cycles.' },
    ],
  },
  {
    sdgNumber: 8,
    sdgName: 'SDG 8 – Decent Work and Economic Growth',
    whyItMatters: 'Circular businesses and repair economies generate high-quality local jobs. Sustained progress requires safe, equitable labor practices.',
    whatYouAreDoing: 'Recognizing the link between everyday consumer spending and labor ethics.',
    whatYouCanImprove: 'Support local repair artisans and avoid patronizing exploitative ultra-fast fashion.',
    actions: [
      { title: 'Use neighborhood repair workshops', description: 'Hire local cobblers, tailors, and electronics fixers to repair goods rather than discarding them.' },
      { title: 'Avoid throwaway ultra-fast fashion apparel', description: 'Invest in durable garments made by brands adhering to transparent labor standards.' },
      { title: 'Learn emerging circular economy skills', description: 'Gain knowledge in lifecycle assessment, sustainable design, and renewable energy systems.' },
    ],
  },
  {
    sdgNumber: 9,
    sdgName: 'SDG 9 – Industry, Innovation and Infrastructure',
    whyItMatters: 'Digital innovation and resilient infrastructure enable low-carbon operations. Prolonging hardware life saves rare earths and heavy metals.',
    whatYouAreDoing: 'Utilizing modern digital tools and calculating your environmental impact.',
    whatYouCanImprove: 'Adopt completely paperless workflows and maximize device operational lifespans.',
    actions: [
      { title: 'Transition to paperless cloud assignments', description: 'Use digital annotations, cloud documents, and digital receipts to reduce paper mill demand.' },
      { title: 'Extend electronic device lifespans', description: 'Replace phone batteries or clean laptops to gain 2-3 extra years before replacing hardware.' },
      { title: 'Advocate for smart campus resource meters', description: 'Support student IoT projects that track water, solar, and power usage in real time.' },
    ],
  },
  {
    sdgNumber: 10,
    sdgName: 'SDG 10 – Reduced Inequalities',
    whyItMatters: 'Vulnerable communities bear the worst brunt of pollution and climate change. True sustainability must be accessible and fair for all.',
    whatYouAreDoing: 'Considering the social dimensions of environmental and campus equity.',
    whatYouCanImprove: 'Champion accessibility, support disadvantaged students, and treat service staff with dignity.',
    actions: [
      { title: 'Ensure project files are accessible to all', description: 'Include alt-text, readable contrast, and captions in shared presentations and notes.' },
      { title: 'Show respect and dignity to campus staff', description: 'Acknowledge cleaning, security, and dining staff with courtesy and maintain clean communal areas.' },
      { title: 'Advocate for affordable transit passes', description: 'Support campus petitions for subsidized bus and metro passes for lower-income students.' },
    ],
  },
  {
    sdgNumber: 11,
    sdgName: 'SDG 11 – Sustainable Cities and Communities',
    whyItMatters: 'Urban transport emissions cause severe local air pollution and urban heat island effects. Shared and active transit make cities safer and cleaner.',
    whatYouAreDoing: 'Reflecting on your daily commuting choices.',
    whatYouCanImprove: 'Replace short single-occupancy motor trips with active mobility or public transit.',
    actions: [
      { title: 'Choose bus or metro for regular travel', description: 'Carrying dozens of commuters in one vehicle cuts per-capita emissions dramatically.' },
      { title: 'Walk or cycle for trips under 2 km', description: 'Zero tailpipe emissions, zero fuel expenditure, and invigorating daily physical exercise.' },
      { title: 'Carpool with classmates or colleagues', description: 'Doubling vehicle occupancy cuts per-person travel fuel consumption in half.' },
    ],
  },
  {
    sdgNumber: 12,
    sdgName: 'SDG 12 – Responsible Consumption and Production',
    whyItMatters: 'Linear resource consumption overburdens landfills and accelerates resource depletion. Circular habits close material loops.',
    whatYouAreDoing: 'Examining waste segregation, reuse, and disposal patterns.',
    whatYouCanImprove: 'Segregate wet and dry waste, carry reusable containers, and repair items before replacing them.',
    actions: [
      { title: 'Segregate household waste into wet and dry bins', description: 'Prevents organic food waste from contaminating dry paper, glass, metal, and plastics.' },
      { title: 'Carry a reusable cloth bag and water bottle', description: 'Eliminates dozens of single-use polythene bags and PET bottles each month.' },
      { title: 'Repair, mend, or repurpose before discarding', description: 'Directly supports the circular economy hierarchy: Reduce → Reuse → Repair → Recycle.' },
    ],
  },
  {
    sdgNumber: 13,
    sdgName: 'SDG 13 – Climate Action',
    whyItMatters: 'Greenhouse gas accumulation drives global temperature increases. Daily sustainable habits cumulatively lower emissions.',
    whatYouAreDoing: 'Connecting individual lifestyle actions to broader climate mitigation.',
    whatYouCanImprove: 'Adopt small daily changes across energy, transit, and consumption to lower your total carbon footprint.',
    actions: [
      { title: 'Track your carbon footprint monthly', description: 'Regular assessments build awareness and show the measurable impact of habit changes.' },
      { title: 'Complete weekly EcoTrack sustainability challenges', description: 'Turns sustainable knowledge into consistent, rewarding daily routines.' },
      { title: 'Share sustainability tips with friends and family', description: 'Peer advocacy multiplies your personal environmental impact across your community.' },
    ],
  },
  {
    sdgNumber: 14,
    sdgName: 'SDG 14 – Life Below Water',
    whyItMatters: 'Oceans and inland waterways absorb over 90% of excess heat and provide 50% of the Earth\'s oxygen. Plastic and chemical runoff devastate marine biomes.',
    whatYouAreDoing: 'Avoiding unnecessary disposable items and tracking waste.',
    whatYouCanImprove: 'Eliminate single-use plastics and safely dispose of household oils and chemicals.',
    actions: [
      { title: 'Refuse single-use plastic straws and cutlery', description: 'Prevents lightweight, non-recyclable plastics from washing into stormwater canals and rivers.' },
      { title: 'Never pour grease or harsh solvents down sinks', description: 'Dispose of cooking oil in closed jars and take household paints to specialized disposal points.' },
      { title: 'Participate in lake or riverbank cleanups', description: 'Join local volunteer drives to intercept plastic packaging along waterfront banks.' },
    ],
  },
  {
    sdgNumber: 15,
    sdgName: 'SDG 15 – Life on Land',
    whyItMatters: 'Forests and healthy soils store immense carbon and support 80% of terrestrial biodiversity. Protecting greenery stops land degradation.',
    whatYouAreDoing: 'Respecting natural habitats and observing consumption impacts.',
    whatYouCanImprove: 'Plant native flora, compost food waste for soil replenishment, and leave zero litter in nature.',
    actions: [
      { title: 'Plant native saplings or potted balcony herbs', description: 'Provides urban micro-habitats for birds, butterflies, and pollinators while cooling air.' },
      { title: 'Compost organic scraps for soil health', description: 'Replaces chemical fertilizers with nutrient-rich organic humus that restores microbial soil life.' },
      { title: 'Follow "Leave No Trace" outdoors', description: 'Carry a bag on outdoor trips to bring back all snack wrappers, bottles, and fruit peels.' },
    ],
  },
  {
    sdgNumber: 16,
    sdgName: 'SDG 16 – Peace, Justice and Strong Institutions',
    whyItMatters: 'Transparent governance, civic responsibility, and social trust are necessary foundations for enacting environmental laws and fair resource distribution.',
    whatYouAreDoing: 'Practicing ethical civic engagement and objective assessment.',
    whatYouCanImprove: 'Promote academic honesty, transparent student club governance, and peaceful dialogue.',
    actions: [
      { title: 'Uphold strict academic and personal honesty', description: 'Always cite research honestly, reject exam cheating, and build a reputation for reliability.' },
      { title: 'Practice constructive conflict resolution', description: 'Listen with empathy during heated group project discussions and de-escalate tensions.' },
      { title: 'Participate responsibly in campus elections', description: 'Votefully and hold student leaders accountable for transparent sustainability programs.' },
    ],
  },
  {
    sdgNumber: 17,
    sdgName: 'SDG 17 – Partnerships for the Goals',
    whyItMatters: 'Complex global challenges cannot be solved in isolation. Cross-disciplinary collaboration between students, colleges, and communities drives scalable change.',
    whatYouAreDoing: 'Exploring interconnected goals through EcoTrack.',
    whatYouCanImprove: 'Collaborate with campus clubs, share open-source green tools, and build sustainability alliances.',
    actions: [
      { title: 'Form a cross-departmental green study group', description: 'Bring together engineering, business, and arts students to work on campus sustainability ideas.' },
      { title: 'Introduce EcoTrack to three peers or groups', description: 'Spread awareness of carbon accounting and circular economy practices across campus.' },
      { title: 'Partner with local environmental NGOs', description: 'Volunteer engineering skills (websites, IoT, audits) for grassroots environmental organizations.' },
    ],
  },
];

// ── POST /api/ai/sdg-recommendations ──────────────────────────
/**
 * Accepts assessed SDG data and generates personalized recommendations for ALL 17 SDGs.
 */
router.post('/sdg-recommendations', async (req, res) => {
  const { evaluatedSDGs, footprintResult } = req.body;

  if (!isGeminiConfigured()) {
    console.warn('[/sdg-recommendations] Gemini API key not configured — returning all 17 fallback SDG recommendations.');
    return res.json({
      success: true,
      recommendations: FALLBACK_SDG_RECOMMENDATIONS,
      isFallback: true,
    });
  }

  try {
    const recommendations = await generateSDGRecommendations({
      evaluatedSDGs: evaluatedSDGs || [],
      footprintResult: footprintResult || null,
    });

    // Ensure all 17 SDGs are represented (backfill any missing goals from fallback)
    const returnedMap = new Map();
    if (Array.isArray(recommendations)) {
      for (const rec of recommendations) {
        if (rec && rec.sdgNumber) {
          returnedMap.set(Number(rec.sdgNumber), rec);
        }
      }
    }

    const full17Recommendations = [];
    for (let id = 1; id <= 17; id++) {
      if (returnedMap.has(id)) {
        full17Recommendations.push(returnedMap.get(id));
      } else {
        const fallbackGoal = FALLBACK_SDG_RECOMMENDATIONS.find((f) => f.sdgNumber === id);
        if (fallbackGoal) full17Recommendations.push(fallbackGoal);
      }
    }

    return res.json({ success: true, recommendations: full17Recommendations, isFallback: false });
  } catch (err) {
    console.error('[/sdg-recommendations] Gemini error:', err.message);
    // Return all 17 fallback recommendations gracefully on Gemini API failure
    return res.json({
      success: true,
      recommendations: FALLBACK_SDG_RECOMMENDATIONS,
      isFallback: true,
      errorNotice: 'Live AI temporarily unavailable; using rule-based sustainability recommendations for all 17 SDGs.',
    });
  }
});

module.exports = router;
