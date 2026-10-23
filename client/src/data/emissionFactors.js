/**
 * @fileoverview Emission factors and static reference data for EcoTrack.
 *
 * All CO₂ values are educational approximations intended to raise awareness.
 * Actual emission factors vary by geography, energy source, and methodology.
 */

// ---------------------------------------------------------------------------
// Emission Factors
// ---------------------------------------------------------------------------

/**
 * CO₂ emission factors per activity category.
 * Each entry contains the numeric factor, its unit, a short description,
 * and a caveat note for transparency.
 *
 * @type {Object.<string, { value: number, unit: string, description: string, note: string }>}
 */
export const EMISSION_FACTORS = {
  electricity: {
    value: 0.7,
    unit: 'kg CO₂/kWh',
    description: 'Simplified educational electricity emission factor',
    note: 'Actual factors vary by country and energy mix',
  },
  car: {
    value: 0.12,
    unit: 'kg CO₂/km',
    description: 'Average petrol/diesel car emission factor',
    note: 'Varies by vehicle type and fuel',
  },
  bike: {
    value: 0.05,
    unit: 'kg CO₂/km',
    description: 'Two-wheeler (petrol) emission factor',
    note: 'Electric bikes/cycles have near-zero operational emissions',
  },
  publicTransport: {
    value: 0.04,
    unit: 'kg CO₂/passenger-km',
    description: 'Average public transport emission factor',
    note: 'Varies by transport mode and occupancy',
  },
  waste: {
    value: 0.5,
    unit: 'kg CO₂/kg waste/month',
    description: 'Simplified educational waste emission factor',
    note: 'This is a rough educational approximation. Actual emissions depend on waste composition and treatment method.',
  },
};

// ---------------------------------------------------------------------------
// UN Sustainable Development Goals (SDGs) — relevant to EcoTrack
// ---------------------------------------------------------------------------

/**
 * SDG data for goals linked to carbon footprint categories.
 * Each entry maps to one or more emission categories and provides
 * actionable suggestions aligned with the SDG.
 *
 * @type {Array.<{
 *   id: number,
 *   title: string,
 *   color: string,
 *   icon: string,
 *   description: string,
 *   relevance: string,
 *   linkedCategories: string[],
 *   actions: string[]
 * }>}
 */
export const SDG_DATA = [
  {
    id: 1,
    title: 'No Poverty',
    color: '#E5243B',
    icon: 'HeartHandshake',
    group: 'People',
    description: 'End poverty in all its forms everywhere.',
    relevance: 'Responsible donation of usable goods, supporting ethical community initiatives, and preventing waste direct resources to those in need.',
    linkedCategories: [],
    actions: [
      'Donate usable clothes, books, and household goods to local relief programs',
      'Support fair-trade and social enterprise products that pay living wages',
      'Volunteer or contribute to community food and essentials drives',
    ],
  },
  {
    id: 2,
    title: 'Zero Hunger',
    color: '#DDA63A',
    icon: 'Utensils',
    group: 'People',
    description: 'End hunger, achieve food security and improved nutrition and promote sustainable agriculture.',
    relevance: 'Reducing food waste and planning meals reduces emissions and preserves agricultural resources.',
    linkedCategories: ['waste'],
    actions: [
      'Plan weekly meals and buy only perishable quantities you will consume',
      'Store food properly to prevent spoilage and use leftovers creatively',
      'Share surplus edible food with community fridges or neighbours',
    ],
  },
  {
    id: 3,
    title: 'Good Health and Well-being',
    color: '#4C9F38',
    icon: 'Activity',
    group: 'People',
    description: 'Ensure healthy lives and promote well-being for all at all ages.',
    relevance: 'Active mobility (walking, cycling) cuts transport pollution while improving physical and cardiovascular wellness.',
    linkedCategories: ['car', 'bike', 'publicTransport'],
    actions: [
      'Walk or bicycle for short trips instead of taking motorized transport',
      'Choose plant-rich whole foods with a lower environmental footprint',
      'Maintain good indoor air quality and spend time in natural green spaces',
    ],
  },
  {
    id: 4,
    title: 'Quality Education',
    color: '#C5192D',
    icon: 'GraduationCap',
    group: 'People',
    description: 'Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.',
    relevance: 'Sharing knowledge on circular economy, carbon reduction, and climate science empowers collective action.',
    linkedCategories: [],
    actions: [
      'Share sustainability learning and EcoTrack insights with classmates and family',
      'Donate textbook editions and learning supplies to junior students',
      'Participate in campus environmental seminars and student research workshops',
    ],
  },
  {
    id: 5,
    title: 'Gender Equality',
    color: '#FF3A21',
    icon: 'Scale',
    group: 'People',
    description: 'Achieve gender equality and empower all women and girls.',
    relevance: 'Diverse and equitable participation strengthens community resilience and sustainable leadership.',
    linkedCategories: [],
    actions: [
      'Advocate for equal representation and respect in academic and project teams',
      'Support women-led eco-enterprises and circular businesses',
      'Actively challenge gender stereotypes in everyday conversations and campus forums',
    ],
  },
  {
    id: 6,
    title: 'Clean Water and Sanitation',
    color: '#26BDE2',
    icon: 'Droplets',
    group: 'Planet',
    description: 'Ensure availability and sustainable management of water and sanitation for all.',
    relevance: 'Water conservation, avoiding waste, and protecting watersheds ensure freshwater security.',
    linkedCategories: ['waste'],
    actions: [
      'Turn off running taps while brushing, soaping, or scrubbing dishes',
      'Install water-saving aerators on household faucets',
      'Promptly fix plumbing leaks and report community pipe bursts',
    ],
  },
  {
    id: 7,
    title: 'Affordable and Clean Energy',
    color: '#FCC30B',
    icon: 'Zap',
    group: 'Prosperity',
    description: 'Ensure access to affordable, reliable, sustainable and modern energy.',
    relevance: 'Reducing electricity consumption and adopting efficiency directly cuts fossil fuel power demand.',
    linkedCategories: ['electricity'],
    actions: [
      'Switch domestic lighting to high-efficiency LED bulbs',
      'Unplug chargers and appliances when idle to stop standby phantom power',
      'Explore solar study lamps or rooftop solar energy options',
    ],
  },
  {
    id: 8,
    title: 'Decent Work and Economic Growth',
    color: '#A21942',
    icon: 'TrendingUp',
    group: 'Prosperity',
    description: 'Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all.',
    relevance: 'Supporting repair artisans, ethical manufacturers, and local green services boosts fair circular economies.',
    linkedCategories: [],
    actions: [
      'Patronize local repair shops (cobblers, tailors, electronic repairers)',
      'Choose products from brands with fair wages and worker safety standards',
      'Build green and digital skills relevant to the sustainable economy',
    ],
  },
  {
    id: 9,
    title: 'Industry, Innovation and Infrastructure',
    color: '#FD6925',
    icon: 'Lightbulb',
    group: 'Prosperity',
    description: 'Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation.',
    relevance: 'Adopting digital tools and durable hardware reduces material consumption and spurs sustainable design.',
    linkedCategories: ['electricity'],
    actions: [
      'Use paperless digital workflows and cloud collaboration tools',
      'Maintain electronics to maximize device lifespan before upgrading',
      'Support open-source and sustainable tech innovations on campus',
    ],
  },
  {
    id: 10,
    title: 'Reduced Inequalities',
    color: '#DD1367',
    icon: 'Equal',
    group: 'Prosperity',
    description: 'Reduce inequality within and among countries.',
    relevance: 'Inclusive sustainability ensures that green solutions and clean environments are accessible to everyone, not just a privileged few.',
    linkedCategories: [],
    actions: [
      'Support accessible public transport and clean community spaces for all groups',
      'Engage respectfully with diverse campus peers and community service workers',
      'Advocate for environmental justice in underprivileged neighborhoods',
    ],
  },
  {
    id: 11,
    title: 'Sustainable Cities and Communities',
    color: '#FD9D24',
    icon: 'Building2',
    group: 'Prosperity',
    description: 'Make cities and human settlements inclusive, safe, resilient and sustainable.',
    relevance: 'Sustainable transport and community hygiene reduce urban air pollution and congestion.',
    linkedCategories: ['car', 'bike', 'publicTransport'],
    actions: [
      'Choose public transit (bus, metro) or carpooling for regular commutes',
      'Participate in local neighbourhood clean-ups and waste segregation',
      'Support pedestrian-friendly pathways and urban green zones',
    ],
  },
  {
    id: 12,
    title: 'Responsible Consumption and Production',
    color: '#BF8B2E',
    icon: 'Recycle',
    group: 'Planet',
    description: 'Ensure sustainable consumption and production patterns.',
    relevance: 'Reducing waste, reusing items, and recycling form the bedrock of the 4R circular economy hierarchy.',
    linkedCategories: ['waste'],
    actions: [
      'Segregate waste into wet organic and dry recyclable fractions at home',
      'Carry reusable shopping bags, water bottles, and containers daily',
      'Repair, mend, or repurpose goods instead of discarding them',
    ],
  },
  {
    id: 13,
    title: 'Climate Action',
    color: '#3F7E44',
    icon: 'Globe',
    group: 'Planet',
    description: 'Take urgent action to combat climate change and its impacts.',
    relevance: 'Tracking carbon emissions and adopting low-carbon lifestyle choices contributes to global climate mitigation.',
    linkedCategories: ['electricity', 'car', 'bike', 'publicTransport', 'waste'],
    actions: [
      'Calculate and track your monthly carbon footprint on EcoTrack',
      'Lower energy consumption through conscious temperature and appliance controls',
      'Advocate for proactive climate education and action in your institution',
    ],
  },
  {
    id: 14,
    title: 'Life Below Water',
    color: '#0A97D9',
    icon: 'Fish',
    group: 'Planet',
    description: 'Conserve and sustainably use the oceans, seas and marine resources for sustainable development.',
    relevance: 'Preventing plastic litter and chemical runoff protects lakes, rivers, and coastal aquatic ecosystems.',
    linkedCategories: ['waste'],
    actions: [
      'Refuse single-use plastics and packaging that wash into storm drains and rivers',
      'Dispose of chemicals, motor oil, and paints responsibly (never down the sink)',
      'Participate in lake or riverbank litter clean-up initiatives',
    ],
  },
  {
    id: 15,
    title: 'Life on Land',
    color: '#56C02B',
    icon: 'Trees',
    group: 'Planet',
    description: 'Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt biodiversity loss.',
    relevance: 'Planting trees, composting organic waste, and protecting natural green spaces restore soil and terrestrial life.',
    linkedCategories: ['waste'],
    actions: [
      'Plant native trees or maintain a balcony greenery garden',
      'Compost food waste to nourish urban soil instead of burdening landfills',
      'Avoid littering in parks, trails, and forests during travels',
    ],
  },
  {
    id: 16,
    title: 'Peace, Justice and Strong Institutions',
    color: '#00689D',
    icon: 'ShieldCheck',
    group: 'Peace',
    description: 'Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels.',
    relevance: 'Fairness, civic responsibility, and transparent cooperation create the social trust needed for environmental policy.',
    linkedCategories: [],
    actions: [
      'Practice respectful, factual, and constructive communication on civic issues',
      'Participate responsibly in student council, clubs, and campus governance',
      'Champion transparency, honesty, and anti-corruption in everyday activities',
    ],
  },
  {
    id: 17,
    title: 'Partnerships for the Goals',
    color: '#19486A',
    icon: 'Handshake',
    group: 'Partnerships',
    description: 'Strengthen the means of implementation and revitalize the Global Partnership for Sustainable Development.',
    relevance: 'Achieving sustainability requires cross-disciplinary cooperation between students, colleges, businesses, and communities.',
    linkedCategories: [],
    actions: [
      'Collaborate with campus eco-clubs, NGOs, or sustainability groups on projects',
      'Share sustainability resources and open-source tools with peer networks',
      'Participate in cross-departmental sustainability challenges and events',
    ],
  },
];

// ---------------------------------------------------------------------------
// Eco Challenges
// ---------------------------------------------------------------------------

/**
 * A list of small, achievable eco-friendly challenges for users.
 * Each challenge has a Lucide icon name, category label, and description.
 *
 * @type {Array.<{
 *   id: number,
 *   title: string,
 *   description: string,
 *   icon: string,
 *   category: string
 * }>}
 */
export const ECO_CHALLENGES = [
  {
    id: 1,
    title: 'Carry a reusable water bottle',
    description: 'Avoid buying single-use plastic water bottles for a week.',
    icon: 'Droplets',
    category: 'Waste',
  },
  {
    id: 2,
    title: 'Avoid single-use plastic for a day',
    description: 'Say no to plastic bags, straws, and disposable cutlery.',
    icon: 'Ban',
    category: 'Waste',
  },
  {
    id: 3,
    title: 'Switch off unused appliances',
    description: 'Turn off lights and electronics when not in use for a week.',
    icon: 'Power',
    category: 'Energy',
  },
  {
    id: 4,
    title: 'Segregate wet and dry waste',
    description:
      'Separate your household waste into wet (organic) and dry (recyclable) categories.',
    icon: 'SeparatorHorizontal',
    category: 'Waste',
  },
  {
    id: 5,
    title: 'Walk or cycle for short trips',
    description: 'Choose walking or cycling for trips under 2 km this week.',
    icon: 'Bike',
    category: 'Transport',
  },
  {
    id: 6,
    title: 'Reuse paper before recycling',
    description: 'Use both sides of paper before discarding it.',
    icon: 'FileText',
    category: 'Waste',
  },
  {
    id: 7,
    title: 'Repair instead of replace',
    description: 'Fix a broken item instead of throwing it away and buying a new one.',
    icon: 'Wrench',
    category: 'Consumption',
  },
];

// ---------------------------------------------------------------------------
// Waste Categories
// ---------------------------------------------------------------------------

/**
 * Waste categories with recycling guidance.
 * Used in the waste section to help users understand how to dispose
 * of different materials.
 *
 * @type {Array.<{
 *   id: string,
 *   label: string,
 *   color: string,
 *   icon: string,
 *   recyclable: boolean,
 *   guidance: string
 * }>}
 */
export const WASTE_CATEGORIES = [
  {
    id: 'plastic',
    label: 'Plastic',
    color: '#3B82F6',
    icon: 'Package',
    recyclable: true,
    guidance:
      'Rinse containers before recycling. Separate accepted plastics (PET, HDPE). Avoid contamination.',
  },
  {
    id: 'paper',
    label: 'Paper & Cardboard',
    color: '#10B981',
    icon: 'FileText',
    recyclable: true,
    guidance:
      'Keep paper clean and dry. Remove food residue from cardboard. Flatten boxes to save space.',
  },
  {
    id: 'organic',
    label: 'Organic / Food Waste',
    color: '#84CC16',
    icon: 'Leaf',
    recyclable: false,
    guidance:
      'Consider composting food scraps and garden waste. Composting is organic recovery, not material recycling.',
  },
  {
    id: 'glass',
    label: 'Glass',
    color: '#06B6D4',
    icon: 'Wine',
    recyclable: true,
    guidance:
      'Rinse glass containers. Separate by color if required. Do not include broken glass in general recycling.',
  },
  {
    id: 'metal',
    label: 'Metal / Cans',
    color: '#8B5CF6',
    icon: 'Layers',
    recyclable: true,
    guidance:
      'Rinse cans. Crush if allowed. Scrap metal and aluminum are highly recyclable.',
  },
  {
    id: 'ewaste',
    label: 'E-Waste / Electronics',
    color: '#EF4444',
    icon: 'Monitor',
    recyclable: false,
    guidance:
      'Never put e-waste in regular bins. Use authorized e-waste collection centers or manufacturer take-back programs.',
  },
  {
    id: 'other',
    label: 'Other / Mixed',
    color: '#6B7280',
    icon: 'Box',
    recyclable: false,
    guidance:
      'Mixed or contaminated waste typically goes to landfill. Try to minimize this category.',
  },
];
