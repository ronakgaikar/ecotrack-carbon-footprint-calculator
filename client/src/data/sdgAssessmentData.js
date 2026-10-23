/**
 * @fileoverview Comprehensive 17 UN Sustainable Development Goals Questionnaire.
 *
 * Covers ALL 17 SDGs structured according to the official UN 5 Ps:
 *  - People: SDGs 1-5
 *  - Planet: SDGs 6, 12, 13, 14, 15
 *  - Prosperity: SDGs 7-11
 *  - Peace: SDG 16
 *  - Partnerships: SDG 17
 *
 * Each question has:
 *  - id: Unique identifier
 *  - sdg: Primary SDG number
 *  - sdgs: Array of all linked SDGs
 *  - group: 'People' | 'Planet' | 'Prosperity' | 'Peace' | 'Partnerships'
 *  - category: Human-readable topic label
 *  - question: User-facing prompt
 *  - positiveActionText: What the user is doing when answering Yes
 *  - opportunityText: The gap/opportunity identified when answering No
 *  - defaultAction: A practical, low-cost recommended action for the Action Plan
 */

export const SDG_5PS = [
  { id: 'All', label: 'All Goals (1–17)', count: 38 },
  { id: 'People', label: 'People (SDGs 1–5)', sdgs: [1, 2, 3, 4, 5], count: 10, color: '#E5243B' },
  { id: 'Planet', label: 'Planet (SDGs 6, 12–15)', sdgs: [6, 12, 13, 14, 15], count: 13, color: '#26BDE2' },
  { id: 'Prosperity', label: 'Prosperity (SDGs 7–11)', sdgs: [7, 8, 9, 10, 11], count: 11, color: '#FCC30B' },
  { id: 'Peace', label: 'Peace (SDG 16)', sdgs: [16], count: 2, color: '#00689D' },
  { id: 'Partnerships', label: 'Partnerships (SDG 17)', sdgs: [17], count: 2, color: '#19486A' },
];

export const ANSWER_OPTIONS = [
  { value: 'regularly', label: 'Yes, regularly', weight: 1, tone: 'positive' },
  { value: 'sometimes', label: 'Sometimes', weight: 0.5, tone: 'moderate' },
  { value: 'not_currently', label: 'Not currently', weight: 0, tone: 'opportunity' },
  { value: 'na', label: 'Not applicable', weight: null, tone: 'neutral' },
  { value: 'skip', label: 'Prefer not to say', weight: null, tone: 'neutral' },
];

export const SDG_QUESTIONNAIRE = [
  // =========================================================================
  // PEOPLE (SDGs 1–5)
  // =========================================================================

  // ── SDG 1: No Poverty ───────────────────────────────────────────────────
  {
    id: 'sdg1_donations',
    sdg: 1,
    sdgs: [1, 12],
    group: 'People',
    category: 'Poverty Relief & Donation',
    question: 'Do you donate usable clothing, books, or household goods to local relief drives or community charities?',
    positiveActionText: 'Donates usable goods to community relief organizations to support vulnerable households',
    opportunityText: 'Usable items often sit idle or get discarded rather than reaching individuals in economic need',
    defaultAction: {
      id: 'act_sdg1_donate',
      title: 'Organize a seasonal donation of wearable clothes and study books',
      sdg: 1,
      category: 'Poverty Relief',
      impact: 'Directly supports low-income families and prevents usable materials from entering landfills',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg1_fairtrade',
    sdg: 1,
    sdgs: [1, 8],
    group: 'People',
    category: 'Fair Livelihoods',
    question: 'Do you make a conscious effort to buy fair-trade or social-enterprise products that pay living wages?',
    positiveActionText: 'Supports fair-trade brands and enterprises that guarantee equitable living wages',
    opportunityText: 'Conventional cheap consumer goods frequently rely on underpaid supply-chain labor',
    defaultAction: {
      id: 'act_sdg1_fairtrade',
      title: 'Choose at least one certified fair-trade or artisan-made product each month',
      sdg: 1,
      category: 'Fair Livelihoods',
      impact: 'Diverts purchasing power towards living wages and ethical working conditions',
      difficulty: 'Medium',
    },
  },

  // ── SDG 2: Zero Hunger ──────────────────────────────────────────────────
  {
    id: 'sdg2_food_waste',
    sdg: 2,
    sdgs: [2, 12, 13],
    group: 'People',
    category: 'Food Conservation',
    question: 'Do you actively minimize household food waste by planning meals and eating leftovers?',
    positiveActionText: 'Prevents edible food waste through mindful meal portions and leftover utilization',
    opportunityText: 'Uneaten food wastes agricultural land, freshwater, and releases potent methane in landfills',
    defaultAction: {
      id: 'act_sdg2_plan',
      title: 'Practice a "use-first" refrigerator shelf for perishables and leftovers',
      sdg: 2,
      category: 'Food Conservation',
      impact: 'Cuts household food disposal by up to 25% and saves grocery expenditure',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg2_share_food',
    sdg: 2,
    sdgs: [2],
    group: 'People',
    category: 'Community Food Sharing',
    question: 'Do you share surplus edible food with neighbours or support local community food redistribution banks?',
    positiveActionText: 'Channels edible surplus food to community members or local hunger relief programs',
    opportunityText: 'Large volumes of safe, prepared surplus food are discarded after events and gatherings',
    defaultAction: {
      id: 'act_sdg2_redistribute',
      title: 'Connect campus or family event surplus food to a registered food rescue network',
      sdg: 2,
      category: 'Community Food Sharing',
      impact: 'Provides wholesome meals to food-insecure individuals with zero incremental production',
      difficulty: 'Medium',
    },
  },

  // ── SDG 3: Good Health and Well-being ───────────────────────────────────
  {
    id: 'sdg3_active_commute',
    sdg: 3,
    sdgs: [3, 11, 13],
    group: 'People',
    category: 'Active Mobility & Wellness',
    question: 'Do you walk or bicycle regularly for daily errands, campus commutes, or recreational fitness?',
    positiveActionText: 'Integrates active zero-emission mobility (walking/cycling) into daily routines',
    opportunityText: 'Sedentary motorized transit increases urban air pollution and reduces cardiovascular fitness',
    defaultAction: {
      id: 'act_sdg3_walk',
      title: 'Walk or cycle for trips under 2 km instead of taking a motorized vehicle',
      sdg: 3,
      category: 'Active Mobility',
      impact: 'Improves personal fitness while cutting localized tailpipe emissions to zero',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg3_healthy_diet',
    sdg: 3,
    sdgs: [3, 12],
    group: 'People',
    category: 'Nutritional Well-being',
    question: 'Do you include balanced, nutrient-dense, plant-rich foods in your regular diet?',
    positiveActionText: 'Prioritizes wholesome, plant-forward nutrition with proven health and environmental benefits',
    opportunityText: 'Heavily processed and ultra-resource-intensive diets increase health risks and carbon load',
    defaultAction: {
      id: 'act_sdg3_diet',
      title: 'Incorporate at least two plant-powered meal days per week',
      sdg: 3,
      category: 'Nutritional Well-being',
      impact: 'Reduces dietary carbon intensity by ~20% while enhancing cardiovascular wellness',
      difficulty: 'Easy',
    },
  },

  // ── SDG 4: Quality Education ────────────────────────────────────────────
  {
    id: 'sdg4_share_knowledge',
    sdg: 4,
    sdgs: [4, 17],
    group: 'People',
    category: 'Knowledge Sharing',
    question: 'Do you share study materials, textbooks, or sustainability insights (such as EcoTrack) with classmates?',
    positiveActionText: 'Facilitates circular learning by sharing educational resources and sustainability insights',
    opportunityText: 'Valuable learning resources are frequently underutilized or discarded after academic terms',
    defaultAction: {
      id: 'act_sdg4_share',
      title: 'Pass down semester course notes and reference books to incoming junior students',
      sdg: 4,
      category: 'Knowledge Sharing',
      impact: 'Saves financial costs for peers and reduces paper/printing resource demand',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg4_peer_mentoring',
    sdg: 4,
    sdgs: [4, 10],
    group: 'People',
    category: 'Inclusive Skill Building',
    question: 'Do you mentor, tutor, or assist peers or younger students who need academic or digital support?',
    positiveActionText: 'Volunteers time to tutor or empower peers with academic guidance and digital literacy',
    opportunityText: 'Educational disparities widen when students lack access to supportive peer tutoring networks',
    defaultAction: {
      id: 'act_sdg4_mentor',
      title: 'Dedicate one hour per week to peer tutoring or helping someone master a challenging subject',
      sdg: 4,
      category: 'Inclusive Skill Building',
      impact: 'Bridges learning gaps and builds collaborative academic confidence',
      difficulty: 'Medium',
    },
  },

  // ── SDG 5: Gender Equality ──────────────────────────────────────────────
  {
    id: 'sdg5_equal_teamwork',
    sdg: 5,
    sdgs: [5, 10],
    group: 'People',
    category: 'Equal Opportunity',
    question: 'Do you ensure equal voice, balanced leadership roles, and respectful collaboration across genders in academic project teams?',
    positiveActionText: 'Actively promotes equal representation, balanced leadership, and fair project roles for all genders',
    opportunityText: 'Unconscious bias can skew technical or leadership roles away from diverse team members',
    defaultAction: {
      id: 'act_sdg5_team',
      title: 'Promote equitable rotation of leadership and presentation roles in group assignments',
      sdg: 5,
      category: 'Equal Opportunity',
      impact: 'Builds inclusive team environments and empowers diverse student leadership',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg5_challenge_bias',
    sdg: 5,
    sdgs: [5],
    group: 'People',
    category: 'Fair Treatment',
    question: 'Do you actively challenge sexist remarks, gender stereotypes, or discriminatory practices when you encounter them?',
    positiveActionText: 'Constructively stands up against gender-based stereotyping and promotes respectful environments',
    opportunityText: 'Casual stereotypes and silence normalize inequity in everyday educational and social spaces',
    defaultAction: {
      id: 'act_sdg5_ally',
      title: 'Speak up or offer support when witnessing gender-based exclusion or unfair stereotypes',
      sdg: 5,
      category: 'Fair Treatment',
      impact: 'Creates psychologically safe, respectful, and dignified spaces for everyone',
      difficulty: 'Medium',
    },
  },

  // =========================================================================
  // PLANET (SDGs 6, 12, 13, 14, 15)
  // =========================================================================

  // ── SDG 6: Clean Water and Sanitation ───────────────────────────────────
  {
    id: 'sdg6_tap_habits',
    sdg: 6,
    sdgs: [6],
    group: 'Planet',
    category: 'Water Conservation',
    question: 'Do you turn off running taps while brushing your teeth, soaping, or washing dishes?',
    positiveActionText: 'Turns off running water during brushing and lathering to avoid freshwater wastage',
    opportunityText: 'A continuously running tap wastes 6 to 10 litres of treated potable water every single minute',
    defaultAction: {
      id: 'act_sdg6_tap',
      title: 'Keep taps firmly shut whenever water is not actively rinsing',
      sdg: 6,
      category: 'Water Conservation',
      impact: 'Saves up to 300 litres of clean municipal water per person each month',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg6_fixtures_leaks',
    sdg: 6,
    sdgs: [6],
    group: 'Planet',
    category: 'Leak Prevention & Fixtures',
    question: 'Do you promptly report or fix plumbing leaks and consider using water-saving aerators or bucket bathing?',
    positiveActionText: 'Practices leak mitigation and adopts water-efficient fixtures or mindful bathing habits',
    opportunityText: 'A slow pipe or faucet drip silently squanders 30 to 50 litres of clean water each day',
    defaultAction: {
      id: 'act_sdg6_leak',
      title: 'Install screw-on faucet aerators and report dripping hostel or home faucets immediately',
      sdg: 6,
      category: 'Water Conservation',
      impact: 'Cuts volumetric tap flow by 40-50% without diminishing perceived pressure',
      difficulty: 'Easy',
    },
  },

  // ── SDG 12: Responsible Consumption and Production ─────────────────────
  {
    id: 'sdg12_waste_segregation',
    sdg: 12,
    sdgs: [12, 15],
    group: 'Planet',
    category: 'Waste Segregation',
    question: 'Do you consistently segregate household waste into wet (organic) and dry (recyclable) fractions?',
    positiveActionText: 'Separates household waste at source into distinct organic and recyclable bins',
    opportunityText: 'Mixed unsegregated waste contaminates recyclable paper and plastics, forcing them into landfills',
    defaultAction: {
      id: 'act_sdg12_segregate',
      title: 'Establish a dual-bin system at home: one for wet food scraps, one for clean recyclables',
      sdg: 12,
      category: 'Waste Management',
      impact: 'Enables genuine material recovery and keeps dry recyclables clean and market-ready',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg12_reusable_containers',
    sdg: 12,
    sdgs: [12, 14],
    group: 'Planet',
    category: 'Single-Use Plastic Avoidance',
    question: 'Do you routinely carry reusable cloth bags, refillable water bottles, or reusable containers?',
    positiveActionText: 'Carries reusable shopping bags and refillable bottles, eliminating disposable packaging',
    opportunityText: 'Single-use plastic bags and PET bottles take centuries to decompose and pollute ecosystems',
    defaultAction: {
      id: 'act_sdg12_reusable',
      title: 'Keep a folded compact cloth bag and durable steel water bottle in your daily backpack',
      sdg: 12,
      category: 'Responsible Consumption',
      impact: 'Prevents 15-20 single-use plastic bags and bottles per month from entering waste streams',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg12_repair_culture',
    sdg: 12,
    sdgs: [12, 8],
    group: 'Planet',
    category: 'Repair & Product Longevity',
    question: 'Do you attempt to mend, repair, or refurbish broken items before buying new replacements?',
    positiveActionText: 'Embraces the circular economy repair principle to extend physical product longevity',
    opportunityText: 'A throwaway culture accelerates resource extraction, manufacturing emissions, and e-waste',
    defaultAction: {
      id: 'act_sdg12_repair',
      title: 'Visit a local cobbler, tailor, or repair technician before discarding damaged items',
      sdg: 12,
      category: 'Circular Economy',
      impact: 'Directly supports the circular hierarchy (Reduce → Reuse → Repair → Recycle)',
      difficulty: 'Medium',
    },
  },

  // ── SDG 13: Climate Action ──────────────────────────────────────────────
  {
    id: 'sdg13_carbon_tracking',
    sdg: 13,
    sdgs: [13, 7, 11],
    group: 'Planet',
    category: 'Emission Awareness',
    question: 'Do you regularly assess and monitor your carbon footprint to identify high-emission lifestyle areas?',
    positiveActionText: 'Tracks carbon emissions across electricity, transport, and waste to guide decarbonization',
    opportunityText: 'Unmeasured carbon emissions remain invisible, preventing informed sustainable choices',
    defaultAction: {
      id: 'act_sdg13_track',
      title: 'Calculate your carbon footprint monthly on EcoTrack and review your largest emission driver',
      sdg: 13,
      category: 'Climate Action',
      impact: 'Builds continuous behavioral accountability and guides targeted emission reductions',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg13_climate_habits',
    sdg: 13,
    sdgs: [13, 7],
    group: 'Planet',
    category: 'Low-Carbon Habits',
    question: 'Do you make deliberate choices to lower your carbon footprint (e.g. limiting AC usage, choosing trains over flights)?',
    positiveActionText: 'Makes conscious climate-friendly choices in cooling, heating, and inter-city transportation',
    opportunityText: 'High fossil fuel power consumption and high-emission transport accelerate global climate destabilization',
    defaultAction: {
      id: 'act_sdg13_habits',
      title: 'Set air conditioner thermostats to 24-25°C and utilize ceiling fans for circulation',
      sdg: 13,
      category: 'Climate Action',
      impact: 'Reduces cooling electricity load by 15-20% and lowers grid coal/gas combustion',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg13_climate_advocacy',
    sdg: 13,
    sdgs: [13, 17],
    group: 'Planet',
    category: 'Climate Engagement',
    question: 'Do you participate in, discuss, or advocate for environmental sustainability policies in your community or campus?',
    positiveActionText: 'Engages in climate advocacy, campus environmental discussions, and peer education',
    opportunityText: 'Individual actions gain systemic momentum only when combined with collective civic advocacy',
    defaultAction: {
      id: 'act_sdg13_advocate',
      title: 'Introduce one sustainability idea or project to your college club or neighbourhood society',
      sdg: 13,
      category: 'Climate Advocacy',
      impact: 'Multiplies environmental impact through peer influence and institutional initiatives',
      difficulty: 'Medium',
    },
  },

  // ── SDG 14: Life Below Water ────────────────────────────────────────────
  {
    id: 'sdg14_plastic_ocean',
    sdg: 14,
    sdgs: [14, 12],
    group: 'Planet',
    category: 'Marine Plastic Prevention',
    question: 'Do you refuse single-use plastic straws, takeaway cutlery, and microbead cosmetics that wash into aquatic habitats?',
    positiveActionText: 'Refuses single-use plastic items that frequently fragment into marine microplastics',
    opportunityText: 'Plastic fragments washed down stormwater drains choke marine animals and degrade coastal waters',
    defaultAction: {
      id: 'act_sdg14_plastics',
      title: 'Say no to plastic straws and disposable forks when ordering takeout meals',
      sdg: 14,
      category: 'Marine Conservation',
      impact: 'Directly cuts the volume of light disposable plastics entering waterways and oceans',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg14_chemical_disposal',
    sdg: 14,
    sdgs: [14, 6],
    group: 'Planet',
    category: 'Waterway Protection',
    question: 'Do you avoid pouring used cooking oil, solvent chemicals, paints, or pharmaceuticals down the sink?',
    positiveActionText: 'Disposes of hazardous liquids, oil, and chemicals safely without contaminating water bodies',
    opportunityText: 'Pouring oil and toxins down drains clogs sewers, poisons aquatic flora, and starves water of oxygen',
    defaultAction: {
      id: 'act_sdg14_drain',
      title: 'Collect used cooking oil in a sealed jar for municipal recycling rather than pouring down the drain',
      sdg: 14,
      category: 'Water Protection',
      impact: 'Protects urban sewage treatment from fat-bergs and shields natural lakes from eutrophication',
      difficulty: 'Easy',
    },
  },

  // ── SDG 15: Life on Land ────────────────────────────────────────────────
  {
    id: 'sdg15_trees_greenery',
    sdg: 15,
    sdgs: [15, 13],
    group: 'Planet',
    category: 'Terrestrial Biodiversity',
    question: 'Do you plant native trees, care for balcony greenery, or participate in campus afforestation drives?',
    positiveActionText: 'Actively nurtures native plant species and supports urban biodiversity and tree cover',
    opportunityText: 'Urban deforestation reduces carbon sequestration, increases local heat islands, and harms pollinators',
    defaultAction: {
      id: 'act_sdg15_plant',
      title: 'Plant a native potted plant or participate in a campus or local tree-planting drive',
      sdg: 15,
      category: 'Biodiversity',
      impact: 'Creates urban micro-habitats for birds and pollinators while enhancing local air quality',
      difficulty: 'Medium',
    },
  },
  {
    id: 'sdg15_composting_soil',
    sdg: 15,
    sdgs: [15, 12],
    group: 'Planet',
    category: 'Soil Health & Composting',
    question: 'Do you compost fruit and vegetable peels or support organic waste recovery to regenerate healthy soil?',
    positiveActionText: 'Converts organic food scraps into nutrient-rich compost, rejuvenating soil ecosystems',
    opportunityText: 'Landfilled organic matter rots anaerobically, whereas compost restores soil microbial life',
    defaultAction: {
      id: 'act_sdg15_compost',
      title: 'Start an indoor terracotta pot compost unit for daily kitchen vegetable scraps',
      sdg: 15,
      category: 'Soil Health',
      impact: 'Replaces chemical fertilizers with rich organic humus and diverts waste from landfills',
      difficulty: 'Medium',
    },
  },
  {
    id: 'sdg15_nature_leave_no_trace',
    sdg: 15,
    sdgs: [15],
    group: 'Planet',
    category: 'Wilderness Conservation',
    question: 'Do you strictly follow "Leave No Trace" principles (never littering) when trekking or visiting nature parks?',
    positiveActionText: 'Strictly preserves natural habitats by carrying back all litter during outdoor visits',
    opportunityText: 'Litter in forests and nature reserves endangers wildlife through ingestion and habitat degradation',
    defaultAction: {
      id: 'act_sdg15_litter',
      title: 'Carry a dedicated trash pouch on outdoor trails to pack out all waste, including snack wrappers',
      sdg: 15,
      category: 'Conservation',
      impact: 'Preserves pristine wilderness habitats and protects terrestrial animals from plastic ingestion',
      difficulty: 'Easy',
    },
  },

  // =========================================================================
  // PROSPERITY (SDGs 7–11)
  // =========================================================================

  // ── SDG 7: Affordable and Clean Energy ──────────────────────────────────
  {
    id: 'sdg7_led_lighting',
    sdg: 7,
    sdgs: [7, 13],
    group: 'Prosperity',
    category: 'Energy Efficiency',
    question: 'Do you use energy-efficient LED bulbs for domestic lighting instead of incandescent bulbs?',
    positiveActionText: 'Uses energy-efficient LED lighting, drastically reducing household lighting wattage',
    opportunityText: 'Conventional incandescent and halogen lamps waste up to 80% of electricity as heat',
    defaultAction: {
      id: 'act_sdg7_led',
      title: 'Replace the three most frequently used bulbs in your home or hostel room with modern LEDs',
      sdg: 7,
      category: 'Energy Efficiency',
      impact: 'Cuts lighting power consumption by 75-80% and lasts up to 15,000 hours',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg7_standby_power',
    sdg: 7,
    sdgs: [7, 13],
    group: 'Prosperity',
    category: 'Phantom Load Reduction',
    question: 'Do you turn off wall switch sockets when chargers, laptops, and televisions are not in active use?',
    positiveActionText: 'Eliminates phantom standby power draw by switching off wall outlets for idle appliances',
    opportunityText: 'Standby vampire loads quietly draw 5 to 10% of total residential electrical power',
    defaultAction: {
      id: 'act_sdg7_standby',
      title: 'Use power strips with switches to easily cut power to chargers, monitors, and entertainment units',
      sdg: 7,
      category: 'Energy Conservation',
      impact: 'Saves 5-10% on monthly electric bills at zero financial cost',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg7_clean_power',
    sdg: 7,
    sdgs: [7, 13],
    group: 'Prosperity',
    category: 'Renewable Energy',
    question: 'Do you use or support renewable energy sources (such as rooftop solar heaters, solar lanterns, or green grid tariffs)?',
    positiveActionText: 'Utilizes or advocates for clean solar, wind, or zero-emission renewable energy sources',
    opportunityText: 'Fossil fuel-dominated grid power produces heavy carbon dioxide and particulate pollution',
    defaultAction: {
      id: 'act_sdg7_solar',
      title: 'Advocate for solar water heating or solar study lamps in campus dormitories or residential homes',
      sdg: 7,
      category: 'Renewable Energy',
      impact: 'Substitutes thermal fossil power with direct zero-emission solar energy',
      difficulty: 'Medium',
    },
  },

  // ── SDG 8: Decent Work and Economic Growth ──────────────────────────────
  {
    id: 'sdg8_local_repair',
    sdg: 8,
    sdgs: [8, 12],
    group: 'Prosperity',
    category: 'Fair Local Economy',
    question: 'Do you patronize neighborhood repair artisans, local repair services, and independent micro-businesses?',
    positiveActionText: 'Channels economic support directly to skilled local repair technicians and artisan shops',
    opportunityText: 'Relying exclusively on multinational fast-replacement products undermines local trade livelihoods',
    defaultAction: {
      id: 'act_sdg8_repair',
      title: 'Support neighborhood tailors, cobblers, and hardware fixers for regular maintenance',
      sdg: 8,
      category: 'Local Economy',
      impact: 'Fosters decentralized circular employment while avoiding factory emissions',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg8_ethical_conditions',
    sdg: 8,
    sdgs: [8, 1],
    group: 'Prosperity',
    category: 'Ethical Employment',
    question: 'Do you avoid purchasing ultra-fast fashion or goods known for exploiting unfair labor practices?',
    positiveActionText: 'Boycotts exploitative ultra-fast fashion and demands fair working conditions in supply chains',
    opportunityText: 'Ultra-fast fashion drives sweatshop working conditions, extreme water pollution, and massive textile waste',
    defaultAction: {
      id: 'act_sdg8_slowfashion',
      title: 'Commit to wearing clothes longer and buying second-hand or certified ethical garments',
      sdg: 8,
      category: 'Ethical Economy',
      impact: 'Reduces demand for rapid exploitation fashion and saves significant water and dye pollution',
      difficulty: 'Medium',
    },
  },

  // ── SDG 9: Industry, Innovation and Infrastructure ──────────────────────
  {
    id: 'sdg9_digital_workflows',
    sdg: 9,
    sdgs: [9, 12],
    group: 'Prosperity',
    category: 'Sustainable Digital Innovation',
    question: 'Do you utilize paperless digital workflows, digital notes, and electronic documentation to avoid paper waste?',
    positiveActionText: 'Adopts paperless digital workflows and cloud collaboration to eliminate paper consumption',
    opportunityText: 'Massive paper printing consumes trees, chemicals, and water for temporary reading needs',
    defaultAction: {
      id: 'act_sdg9_paperless',
      title: 'Switch completely to digital PDF markups, electronic assignments, and e-signatures',
      sdg: 9,
      category: 'Digital Innovation',
      impact: 'Saves reams of paper, printing toner cartridges, and physical storage footprints',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg9_hardware_longevity',
    sdg: 9,
    sdgs: [9, 12],
    group: 'Prosperity',
    category: 'Resource-Efficient Tech',
    question: 'Do you maintain and upgrade electronics (e.g. replacing batteries or adding SSDs) instead of buying new devices early?',
    positiveActionText: 'Maximizes electronic device operational lifespans through maintenance and component upgrades',
    opportunityText: 'Premature smartphone and laptop replacements generate hazardous toxic electronic waste',
    defaultAction: {
      id: 'act_sdg9_hardware',
      title: 'Perform battery replacements or memory upgrades on older devices rather than replacing them',
      sdg: 9,
      category: 'Tech Infrastructure',
      impact: 'Cuts high upstream mining and fabrication emissions embedded in microchips and hardware',
      difficulty: 'Medium',
    },
  },

  // ── SDG 10: Reduced Inequalities ────────────────────────────────────────
  {
    id: 'sdg10_inclusive_spaces',
    sdg: 10,
    sdgs: [10, 5],
    group: 'Prosperity',
    category: 'Social Accessibility & Inclusion',
    question: 'Do you advocate for physical and digital accessibility and welcoming environments for people of all backgrounds and abilities?',
    positiveActionText: 'Advocates for accessibility, equal respect, and supportive environments for marginalized groups',
    opportunityText: 'Inaccessible campus or public infrastructure excludes persons with disabilities and marginalized individuals',
    defaultAction: {
      id: 'act_sdg10_inclusion',
      title: 'Ensure student events, digital presentations, and spaces provide accessible options for all peers',
      sdg: 10,
      category: 'Accessibility & Inclusion',
      impact: 'Builds an inclusive, equitable culture where every student can fully participate',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg10_fair_treatment',
    sdg: 10,
    sdgs: [10, 1],
    group: 'Prosperity',
    category: 'Dignified Engagement',
    question: 'Do you treat campus custodial, security, and service workers with dignity, fair appreciation, and respect?',
    positiveActionText: 'Consistently extends respect, gratitude, and dignified treatment to support and sanitation staff',
    opportunityText: 'Essential service and cleaning workers frequently face social invisibility and disrespectful conditions',
    defaultAction: {
      id: 'act_sdg10_dignity',
      title: 'Offer daily appreciation, clean up your own mess, and support campus worker welfare initiatives',
      sdg: 10,
      category: 'Equal Respect',
      impact: 'Reinforces fundamental human dignity and bridges socio-economic divides in the community',
      difficulty: 'Easy',
    },
  },

  // ── SDG 11: Sustainable Cities and Communities ──────────────────────────
  {
    id: 'sdg11_public_transit',
    sdg: 11,
    sdgs: [11, 13],
    group: 'Prosperity',
    category: 'Urban Mobility',
    question: 'Do you prioritize public transit (buses, metro, suburban trains) or carpooling over solo motor vehicle travel?',
    positiveActionText: 'Chooses collective public transit and carpooling, easing urban congestion and particulate smog',
    opportunityText: 'Single-occupancy cars clog urban road networks and generate high emissions per passenger-km',
    defaultAction: {
      id: 'act_sdg11_transit',
      title: 'Replace at least two private vehicle commute trips per week with bus or metro transit',
      sdg: 11,
      category: 'Urban Mobility',
      impact: 'Cuts per-capita transit carbon footprint by up to 65% and alleviates city traffic congestion',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg11_community_cleanliness',
    sdg: 11,
    sdgs: [11, 12],
    group: 'Prosperity',
    category: 'Urban Hygiene & Spaces',
    question: 'Do you participate in keeping your neighbourhood and public parks clean, beautiful, and free of illegal littering?',
    positiveActionText: 'Takes civic responsibility for keeping neighbourhood public spaces clean and litter-free',
    opportunityText: 'Indiscriminate littering clogs urban stormwater drains, causing localized street flooding',
    defaultAction: {
      id: 'act_sdg11_clean',
      title: 'Participate in a monthly campus or neighborhood cleanup and report overflowing public dumpsters',
      sdg: 11,
      category: 'Urban Communities',
      impact: 'Prevents storm drain blockages, enhances public hygiene, and restores civic pride in shared spaces',
      difficulty: 'Easy',
    },
  },

  // =========================================================================
  // PEACE (SDG 16)
  // =========================================================================

  // ── SDG 16: Peace, Justice and Strong Institutions ──────────────────────
  {
    id: 'sdg16_civic_integrity',
    sdg: 16,
    sdgs: [16],
    group: 'Peace',
    category: 'Ethical Conduct & Transparency',
    question: 'Do you uphold integrity, academic honesty, and transparent truthfulness in your studies and civic duties?',
    positiveActionText: 'Upholds unwavering honesty, fair ethics, and transparency in academic and civic conduct',
    opportunityText: 'Academic dishonesty and lack of transparency erode social trust and corrupt institutional standards',
    defaultAction: {
      id: 'act_sdg16_integrity',
      title: 'Always cite sources accurately and foster an academic culture of authenticity and zero cheating',
      sdg: 16,
      category: 'Ethics & Integrity',
      impact: 'Strengthens trustworthy institutions and sets personal standards for ethical professional life',
      difficulty: 'Easy',
    },
  },
  {
    id: 'sdg16_peaceful_dialogue',
    sdg: 16,
    sdgs: [16, 10],
    group: 'Peace',
    category: 'Conflict Resolution',
    question: 'Do you resolve conflicts through calm dialogue, respectful listening, and objective fact-based communication?',
    positiveActionText: 'Practices peaceful de-escalation, empathetic listening, and non-violent conflict resolution',
    opportunityText: 'Polarized, hostile communication undermines democratic dialogue and tears community cohesion apart',
    defaultAction: {
      id: 'act_sdg16_dialogue',
      title: 'Practice constructive listening and de-escalate heated arguments with calm, respectful questioning',
      sdg: 16,
      category: 'Peaceful Resolution',
      impact: 'Fosters peaceful peer relationships and builds emotional intelligence for community leadership',
      difficulty: 'Medium',
    },
  },

  // =========================================================================
  // PARTNERSHIPS (SDG 17)
  // =========================================================================

  // ── SDG 17: Partnerships for the Goals ──────────────────────────────────
  {
    id: 'sdg17_collaborative_projects',
    sdg: 17,
    sdgs: [17, 13],
    group: 'Partnerships',
    category: 'Collaborative Action',
    question: 'Do you collaborate with student clubs, community NGOs, or multidisciplinary teams on sustainability goals?',
    positiveActionText: 'Actively builds cross-disciplinary partnerships with peer clubs and NGOs for sustainability impact',
    opportunityText: 'Isolated individual efforts struggle to achieve the scale required for genuine systemic change',
    defaultAction: {
      id: 'act_sdg17_partner',
      title: 'Join or partner with a campus environmental club or community sustainability group on a project',
      sdg: 17,
      category: 'Partnerships',
      impact: 'Combines diverse student talents (engineering, design, management) for holistic community solutions',
      difficulty: 'Medium',
    },
  },
  {
    id: 'sdg17_knowledge_exchange',
    sdg: 17,
    sdgs: [17, 4],
    group: 'Partnerships',
    category: 'Open Knowledge Exchange',
    question: 'Do you actively share eco-tools, research data, and sustainable best practices across your social and digital networks?',
    positiveActionText: 'Shares open sustainability tools, data, and actionable habits across peer networks',
    opportunityText: 'Valuable sustainability knowledge remains in silos unless intentionally communicated outward',
    defaultAction: {
      id: 'act_sdg17_share',
      title: 'Demonstrate EcoTrack to at least three classmates or family members and discuss habit changes',
      sdg: 17,
      category: 'Knowledge Sharing',
      impact: 'Amplifies collective climate literacy and expands grass-roots sustainable development networks',
      difficulty: 'Easy',
    },
  },
];
