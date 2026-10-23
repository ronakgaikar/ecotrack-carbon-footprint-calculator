// src/pages/AboutPage.jsx
// About EcoTrack – Project background, methodology, FAQ, and tech stack

import {
  Leaf,
  Zap,
  Car,
  Recycle,
  BarChart3,
  Bot,
  CheckCircle2,
  Globe,
  Calculator,
  Code2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

// ─── How it works flow steps ──────────────────────────────────────────────────
const HOW_IT_WORKS_STEPS = [
  { icon: <Calculator size={18} />, label: 'Enter Activity' },
  { icon: <Zap size={18} />,        label: 'Apply Factor' },
  { icon: <BarChart3 size={18} />,  label: 'Calculate CO₂' },
  { icon: <BarChart3 size={18} />,  label: 'View Dashboard' },
  { icon: <Bot size={18} />,        label: 'AI Guidance' },
  { icon: <CheckCircle2 size={18} />, label: 'Take Action' },
  { icon: <Globe size={18} />,      label: 'SDG Mapping' },
];

// ─── FAQ accordion items ───────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'What is an emission factor?',
    a: 'An emission factor is a representative value that relates the quantity of an activity (such as kilowatt-hours of electricity used or kilometres driven) to the amount of greenhouse gas released into the atmosphere. For example, 1 kWh of electricity is estimated to produce 0.7 kg of CO₂ equivalent in our educational model.',
  },
  {
    q: 'Why are these results estimates?',
    a: 'Actual greenhouse gas emissions depend on numerous variable factors: your regional electricity grid mix (coal vs. solar vs. wind), the exact vehicle model, engine efficiency, fuel type, passenger occupancy, and local waste processing infrastructure. EcoTrack uses standard educational averages to give you a clear, relatable sense of scale rather than a certified carbon audit.',
  },
  {
    q: 'What does kg CO₂ equivalent mean?',
    a: 'Kilograms of carbon dioxide equivalent (kg CO₂e) is the standard metric used to measure greenhouse gas emissions. Different greenhouse gases (such as methane from landfills) have different global warming potentials. CO₂e expresses the total warming impact of all gases as if they were carbon dioxide, allowing diverse activities to be compared on a single scale.',
  },
  {
    q: 'How does reducing consumption help?',
    a: 'Every unit of electricity, fuel, or material product requires energy and raw resources to extract, manufacture, transport, and dispose of. When you reduce electricity demand or avoid unnecessary trips, you directly eliminate emissions at the source. Collective small reductions significantly ease grid load and resource depletion.',
  },
  {
    q: 'How is EcoTrack related to circular economy?',
    a: 'The circular economy model aims to keep resources and materials in use for as long as possible through reducing, reusing, repairing, and recycling. EcoTrack embodies this by highlighting waste diversion rates, encouraging composting, promoting reusable habits, and connecting individual choices to UN Sustainable Development Goals 12 and 13.',
  },
];

// ─── Project awareness topics ──────────────────────────────────────────────────
const AWARENESS_TOPICS = [
  { label: 'Responsible Consumption', icon: <Recycle size={15} /> },
  { label: 'Waste Reduction & Composting', icon: <Leaf size={15} /> },
  { label: 'Material Recycling & Reuse', icon: <Recycle size={15} /> },
  { label: 'Climate Action & Awareness', icon: <Globe size={15} /> },
  { label: 'Clean Energy & Efficiency', icon: <Zap size={15} /> },
  { label: 'Sustainable Cities & Transit', icon: <Car size={15} /> },
];

// ─── Tech stack items ──────────────────────────────────────────────────────────
const TECH_STACK = [
  { name: 'React 18', desc: 'Component architecture with Vite' },
  { name: 'Node.js + Express', desc: 'Backend server & API routing' },
  { name: 'Google Gemini AI', desc: 'Personalized sustainability recommendations' },
  { name: 'Recharts', desc: 'Responsive emission data charts' },
  { name: 'Lucide React', desc: 'Accessible iconography' },
  { name: 'LocalStorage', desc: 'Zero-database client-side persistence' },
];

// ─── Important disclaimers ────────────────────────────────────────────────────
const DISCLAIMERS = [
  'Results are educational estimates intended to raise awareness, not certified corporate greenhouse gas audits.',
  'Emission factors are simplified illustrative benchmarks based on global academic averages.',
  'AI recommendations from EcoBot are informational and educational.',
  'Recycling rates depend entirely on local municipal facility capabilities and acceptance guidelines.',
  'Completing eco-challenges represents personal behavioral commitment; no official carbon offsets are credited.',
];

// ─── Section title helper ─────────────────────────────────────────────────────
function SectionTitle({ icon, children }) {
  return (
    <h2 className="text-xl sm:text-2xl font-extrabold text-[#294B39] flex items-center gap-2.5 mb-4">
      <span className="text-[#294B39]">{icon}</span>
      {children}
    </h2>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#41404A]">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="bg-[#294B39] text-[#FAF9F6] py-14 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            About EcoTrack
          </h1>
          <p className="text-[#FAF9F6]/85 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-normal">
            An educational web platform developed as part of the{' '}
            <em>Circular Economy for Sustainable Development</em> course. EcoTrack translates daily activities into measurable carbon footprints, promotes circular habits, and provides AI-powered guidance for everyday action.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 space-y-10">

        {/* ── How It Works ─────────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-[#e3ded2] shadow-xs p-6 sm:p-8">
          <SectionTitle icon={<Zap size={22} />}>How It Works</SectionTitle>
          <p className="text-sm text-[#41404A]/80 mb-6 leading-relaxed">
            EcoTrack follows a transparent workflow from activity inputs to actionable environmental insights:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-[#FAF9F6] border border-[#e3ded2] text-[#294B39] p-2 text-center">
                  <span className="mb-1.5 text-[#294B39]">{step.icon}</span>
                  <span className="text-[11px] font-bold leading-tight">
                    {step.label}
                  </span>
                </div>
                {i < HOW_IT_WORKS_STEPS.length - 1 && (
                  <ArrowRight size={16} className="text-[#41404A]/30 shrink-0 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Calculation Example ───────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-[#e3ded2] shadow-xs p-6 sm:p-8">
          <SectionTitle icon={<Calculator size={22} />}>Calculation Example</SectionTitle>
          <p className="text-sm text-[#41404A]/80 mb-4 leading-relaxed">
            Here is how EcoTrack calculates electricity emissions for a typical month:
          </p>

          <div className="bg-[#294B39] rounded-2xl p-6 font-mono text-sm text-[#FAF9F6] space-y-2 mb-4 overflow-x-auto shadow-xs">
            <p className="text-[#A4C52A] font-sans text-xs uppercase tracking-wider"># Monthly electricity calculation</p>
            <p>Monthly electricity   =  <span className="text-white font-bold">300 kWh</span></p>
            <p>Emission factor       =  <span className="text-white font-bold">0.7 kg CO₂/kWh</span></p>
            <p className="border-t border-[#FAF9F6]/20 pt-2 mt-2">
              Electricity CO₂       =  <span>300 × 0.7</span>
              {'  '}= <span className="text-[#A4C52A] font-bold">210 kg CO₂</span>
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#41404A]/80 bg-[#FAF9F6] border border-[#e3ded2] rounded-2xl p-4 leading-relaxed">
            The same transparent formula applies to every category: multiply the <strong>activity volume</strong> by its <strong>emission factor</strong> to determine the estimated CO₂ contribution. EcoTrack aggregates these across electricity, mobility, and waste to compute your total monthly footprint.
          </p>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-[#e3ded2] shadow-xs p-6 sm:p-8">
          <SectionTitle icon={<HelpCircle size={22} />}>Understanding the Calculations</SectionTitle>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group border border-[#e3ded2] rounded-2xl overflow-hidden bg-[#FAF9F6]"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-[#f3ede1] transition-colors font-bold text-sm text-[#294B39]">
                  <span>{item.q}</span>
                  <ChevronRight
                    size={16}
                    className="text-[#41404A]/40 transition-transform group-open:rotate-90 shrink-0 ml-2"
                  />
                </summary>
                <div className="px-5 py-4 text-xs sm:text-sm text-[#41404A]/85 leading-relaxed border-t border-[#e3ded2] bg-white">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Project Awareness ─────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-[#e3ded2] shadow-xs p-6 sm:p-8">
          <SectionTitle icon={<Globe size={22} />}>Project Awareness Themes</SectionTitle>
          <p className="text-sm text-[#41404A]/80 mb-5 leading-relaxed">
            EcoTrack aligns with key concepts in sustainability, resource stewardship, and environmental science:
          </p>
          <div className="flex flex-wrap gap-2.5">
            {AWARENESS_TOPICS.map((topic) => (
              <span
                key={topic.label}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#e3ded2] bg-[#FAF9F6] text-xs font-semibold text-[#294B39]"
              >
                {topic.icon}
                {topic.label}
              </span>
            ))}
          </div>
        </section>

        {/* ── Technology Stack ──────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-[#e3ded2] shadow-xs p-6 sm:p-8">
          <SectionTitle icon={<Code2 size={22} />}>Technology Stack</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#e3ded2]"
              >
                <p className="font-bold text-sm text-[#294B39]">{tech.name}</p>
                <p className="text-xs text-[#41404A]/70 mt-1">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Disclaimers ───────────────────────────────────────────────── */}
        <section className="bg-[#FAF9F6] rounded-3xl border border-[#e3ded2] p-6 sm:p-8">
          <SectionTitle icon={<AlertTriangle size={22} />}>
            Important Disclaimers
          </SectionTitle>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#41404A]/80 leading-relaxed">
            {DISCLAIMERS.map((d) => (
              <li key={d} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#294B39] mt-2 shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
}
