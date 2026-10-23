/**
 * @fileoverview EcoTrack Homepage — Editorial Hero with 3D Environmental Landscape Video
 * 
 * Features:
 * - Real 3D environmental landscape video background (bg_video.mp4) with poster fallback
 * - Autoplay, muted, loop, playsInline, object-fit: cover, and responsive positioning
 * - Left-aligned real HTML editorial typography layered over video with readable scrim
 * - Large headline: "Understand your carbon footprint."
 * - Prominent "Calculate My Footprint" CTA button
 * - Integrated small row of environmental statistics
 * - Off-white (#FAF9F6), pastel peach (#F2CDC4), lavender (#9387AB), and green (#294B39, #A4C52A) palette
 * - Prefers-reduced-motion fallback
 * - Preserves all routes, navigation, calculations, and downstream sections
 */

import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

/* ==========================================================================
   SUPPORTING SVG VIGNETTES & TRANSITIONS
   ========================================================================== */

/**
 * Organic Section Transition Curve (Flowing Wave SVG)
 */
function OrganicWaveDivider({ fillColor = '#FAF9F6', height = 48, flip = false }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`} style={{ height, marginBottom: -1 }}>
      <svg
        viewBox="0 0 1440 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative block w-full h-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,0 C320,60 640,90 960,40 C1200,5 1360,45 1440,70 L1440,96 L0,96 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
}

/**
 * Circular Habit / Waste Loop SVG Vignette
 */
function CircularVignette() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-40">
      <circle cx="110" cy="110" r="90" fill="#F2CDC4" fillOpacity="0.4" />
      <circle cx="110" cy="110" r="68" stroke="#294B39" strokeWidth="2" strokeDasharray="6 6" />
      <path d="M110 32C153 32 188 67 188 110" stroke="#A4C52A" strokeWidth="6" strokeLinecap="round" />
      <path d="M188 110C188 153 153 188 110 188" stroke="#294B39" strokeWidth="6" strokeLinecap="round" />
      <path d="M110 188C67 188 32 153 32 110" stroke="#9387AB" strokeWidth="6" strokeLinecap="round" />
      {/* Center sprout */}
      <path d="M110 140V90C110 90 90 85 85 105C80 125 110 135 110 140Z" fill="#294B39" />
      <path d="M110 105C110 105 125 95 135 108C145 121 118 132 110 135" fill="#A4C52A" />
    </svg>
  );
}

/**
 * AI Guidance Botanical Tree SVG Vignette
 */
function AIGuidanceVignette({ className = "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32" }) {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="110" cy="110" r="90" fill="#9387AB" fillOpacity="0.25" />
      <line x1="110" y1="180" x2="110" y2="105" stroke="#294B39" strokeWidth="4" strokeLinecap="round" />
      <path d="M110 140L75 110L55 120" stroke="#294B39" strokeWidth="3" strokeLinecap="round" />
      <path d="M110 125L145 95L170 105" stroke="#294B39" strokeWidth="3" strokeLinecap="round" />
      <path d="M110 105L90 70L95 45" stroke="#294B39" strokeWidth="3" strokeLinecap="round" />
      <path d="M110 105L130 68L125 45" stroke="#294B39" strokeWidth="3" strokeLinecap="round" />
      <circle cx="55" cy="120" r="9" fill="#A4C52A" />
      <circle cx="170" cy="105" r="9" fill="#F2CDC4" />
      <circle cx="95" cy="45" r="9" fill="#294B39" />
      <circle cx="125" cy="45" r="9" fill="#A4C52A" />
      <circle cx="75" cy="110" r="6" fill="#9387AB" />
      <circle cx="145" cy="95" r="6" fill="#9387AB" />
    </svg>
  );
}

/**
 * UN Sustainable Development Goals Radial Orbit SVG Vignette
 */
function SDGAlignmentVignette({ className = "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32" }) {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Soft lavender background circle matching AIGuidanceVignette */}
      <circle cx="110" cy="110" r="90" fill="#9387AB" fillOpacity="0.25" />

      {/* Dashed circular orbit */}
      <circle cx="110" cy="110" r="70" stroke="#294B39" strokeWidth="1.5" strokeDasharray="5 5" strokeOpacity="0.4" />

      {/* Segmented perimeter arcs representing SDGs and sustainability cycle */}
      <path d="M70 48 A 70 70 0 0 1 150 48" stroke="#294B39" strokeWidth="5" strokeLinecap="round" />
      <path d="M172 70 A 70 70 0 0 1 172 150" stroke="#A4C52A" strokeWidth="5" strokeLinecap="round" />
      <path d="M150 172 A 70 70 0 0 1 70 172" stroke="#9387AB" strokeWidth="5" strokeLinecap="round" />
      <path d="M48 150 A 70 70 0 0 1 48 70" stroke="#294B39" strokeWidth="5" strokeLinecap="round" />

      {/* Central stylized globe and meridians */}
      <circle cx="110" cy="110" r="40" stroke="#294B39" strokeWidth="2.5" />
      <ellipse cx="110" cy="110" rx="19" ry="40" stroke="#294B39" strokeWidth="2" />
      <line x1="70" y1="110" x2="150" y2="110" stroke="#294B39" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="110" y1="70" x2="110" y2="150" stroke="#294B39" strokeWidth="2" />

      {/* SDG nodes / pins around orbit in brand palette */}
      <circle cx="110" cy="40" r="7" fill="#A4C52A" />
      <circle cx="180" cy="110" r="7" fill="#294B39" />
      <circle cx="110" cy="180" r="7" fill="#9387AB" />
      <circle cx="40" cy="110" r="7" fill="#A4C52A" />
      <circle cx="110" cy="110" r="6" fill="#294B39" />
      <circle cx="110" cy="70" r="4.5" fill="#FAF9F6" stroke="#294B39" strokeWidth="1.5" />
      <circle cx="110" cy="150" r="4.5" fill="#FAF9F6" stroke="#294B39" strokeWidth="1.5" />
    </svg>
  );
}

/* ==========================================================================
   HOMEPAGE COMPONENT
   ========================================================================== */

export default function HomePage({ setCurrentPage }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  /** Navigate and scroll to top smoothly */
  function navigate(page) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Detect reduced motion preference on mount
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handler);
    } else {
      motionQuery.addListener(handler);
    }

    return () => {
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handler);
      } else {
        motionQuery.removeListener(handler);
      }
    };
  }, []);

  return (
    <div className="w-full bg-[#FAF9F6] text-[#41404A] selection:bg-[#F2CDC4] selection:text-[#294B39]">

      {/* ════════════════════════════════════════════════════════════════════
          HERO SECTION — 3D ENVIRONMENTAL LANDSCAPE VIDEO BACKGROUND
          ════════════════════════════════════════════════════════════════════ */}
      <section className="hero-video-container border-b border-[#e5e1d5]">

        {/* ── 1. Video Element Background ── */}
        {!prefersReducedMotion ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/bg_poster.jpg"
            className="hero-video-element"
            aria-label="3D animated environmental landscape with lavender mountains and rolling green hills"
          >
            <source src="/bg_video.mp4" type="video/mp4" />
            {/* Fallback image if video cannot be played */}
            <img
              src="/bg_poster.jpg"
              alt="3D environmental landscape"
              className="hero-poster-fallback"
            />
          </video>
        ) : (
          /* Static fallback for reduced-motion preferences */
          <img
            src="/bg_poster.jpg"
            alt="3D environmental landscape"
            className="hero-poster-fallback"
          />
        )}

        {/* ── 2. Editorial Scrim Overlay ── */}
        <div className="hero-scrim-overlay" />

        {/* ── 3. Real HTML Content Layered Over Video ── */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            
            {/* Large Left-Aligned Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#294B39] tracking-tight leading-[1.08] mb-6">
              Understand your <br />
              <span className="relative inline-block mt-1">
                carbon footprint.
                <svg
                  className="absolute -bottom-2.5 left-0 w-full h-3 text-[#A4C52A]"
                  viewBox="0 0 320 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6C60 1 120 11 180 6C240 1 300 11 318 6"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Supporting Text Explaining the Website */}
            <p className="text-base sm:text-lg text-[#41404A]/90 leading-relaxed max-w-xl mb-8 font-normal">
              Every kilowatt-hour and daily commute shapes our living planet. EcoTrack translates your household energy, transit, and material consumption into measurable carbon metrics, backed by climate science and AI guidance.
            </p>

            {/* Prominent "Calculate My Footprint" CTA Button & Secondary Link */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
              <button
                onClick={() => navigate('calculator')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#294B39] text-[#FAF9F6] font-bold text-base tracking-wide hover:bg-[#1d3528] active:translate-y-0.5 transition-all shadow-md group"
              >
                <span>Calculate My Footprint</span>
                <ArrowRight size={18} className="text-[#A4C52A] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  document.getElementById('environmental-pillars')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-[#294B39]/25 text-[#294B39] font-semibold text-base hover:bg-[#FAF9F6] transition-all bg-[#FAF9F6]/75 backdrop-blur-sm"
              >
                <span>Explore Methodology</span>
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Environmental Statistics (Clean, Open Typography System) */}
            <div className="grid grid-cols-3 gap-6 max-w-lg pt-8 border-t border-[#41404A]/15">
              
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#294B39] tracking-tight">
                  4.7 <span className="text-xs sm:text-sm font-semibold text-[#41404A]/70">t CO₂e</span>
                </div>
                <div className="text-xs text-[#41404A]/75 mt-1 leading-snug font-medium">
                  Global annual avg per person
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#294B39] tracking-tight">
                  2.0 <span className="text-xs sm:text-sm font-semibold text-[#41404A]/70">t CO₂e</span>
                </div>
                <div className="text-xs text-[#294B39] mt-1 leading-snug font-semibold">
                  Paris 1.5°C target by 2030
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#294B39] tracking-tight">
                  -38%
                </div>
                <div className="text-xs text-[#41404A]/75 mt-1 leading-snug font-medium">
                  Potential habit reduction
                </div>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2: EDITORIAL METHODOLOGY & ACTION PILLARS
          ════════════════════════════════════════════════════════════════════ */}
      <section id="environmental-pillars" className="py-20 md:py-28 px-5 sm:px-8 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#294B39] tracking-tight leading-tight">
            A cohesive system designed for tangible climate progress.
          </h2>
        </div>

        {/* Asymmetrical Narrative Layout */}
        <div className="space-y-12">
          
          {/* ── Pillar 01: Carbon Footprint Engine ── */}
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FAF9F6] border border-[#e3ded2] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#294B39]/70 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#294B39] text-[#FAF9F6] flex items-center justify-center text-xs font-bold">1</span>
                Precision Accounting
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#294B39] mb-6">
                Calculate emissions across electricity, transit, and household fuel.
              </h3>
              <button
                onClick={() => navigate('calculator')}
                className="inline-flex items-center gap-2 font-bold text-sm text-[#294B39] hover:text-[#A4C52A] transition-colors"
              >
                Launch Carbon Calculator
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="p-6 rounded-2xl bg-[#F2CDC4]/40 border border-[#F2CDC4] w-full max-w-xs text-center">
                <div className="text-4xl font-extrabold text-[#294B39] mb-1">0.82 kg</div>
                <div className="text-xs uppercase font-bold tracking-wider text-[#41404A]/70">CO₂e per kWh of Grid Power</div>
              </div>
            </div>
          </div>

          {/* ── Pillar 02: Waste & Circular Resource Stewardship ── */}
          <div className="p-8 sm:p-12 rounded-3xl bg-[#FAF9F6] border border-[#e3ded2] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 order-2 lg:order-1 flex justify-center">
              <CircularVignette />
            </div>

            <div className="lg:col-span-8 order-1 lg:order-2">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#294B39]/70 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#294B39] text-[#FAF9F6] flex items-center justify-center text-xs font-bold">2</span>
                Circular Economy
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#294B39] mb-6">
                Close the loop on organic and municipal discards.
              </h3>
              <button
                onClick={() => navigate('waste')}
                className="inline-flex items-center gap-2 font-bold text-sm text-[#294B39] hover:text-[#A4C52A] transition-colors"
              >
                Open Waste & Recycling Tracker
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* ── Pillar 03: AI Sustainability Assistant & UN SDGs ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* AI Assistant Card (Card 03) */}
            <div className="p-8 rounded-3xl bg-[#FAF9F6] border border-[#e3ded2] flex items-center justify-between gap-6 h-full">
              <div className="flex-1 flex flex-col justify-center gap-3 min-w-0">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#294B39]/70">
                  <span className="w-6 h-6 rounded-full bg-[#294B39] text-[#FAF9F6] flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <span>Intelligent Advisory</span>
                </div>
                <h3 className="text-2xl font-extrabold text-[#294B39] leading-tight min-h-[3.75rem]">
                  AI-Powered EcoBot Guidance
                </h3>
                <div>
                  <button
                    onClick={() => navigate('ai-chat')}
                    className="inline-flex items-center gap-2 font-bold text-sm text-[#294B39] hover:text-[#A4C52A] transition-colors"
                  >
                    Consult EcoBot Assistant
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-center">
                <AIGuidanceVignette className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32" />
              </div>
            </div>

            {/* UN SDGs Alignment (Card 04) */}
            <div className="p-8 rounded-3xl bg-[#FAF9F6] border border-[#e3ded2] flex items-center justify-between gap-6 h-full">
              <div className="flex-1 flex flex-col justify-center gap-3 min-w-0">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#294B39]/70">
                  <span className="w-6 h-6 rounded-full bg-[#294B39] text-[#FAF9F6] flex items-center justify-center text-xs font-bold shrink-0">
                    4
                  </span>
                  <span>Global Alignment</span>
                </div>
                <h3 className="text-2xl font-extrabold text-[#294B39] leading-tight min-h-[3.75rem]">
                  UN Sustainable Development Goals
                </h3>
                <div>
                  <button
                    onClick={() => navigate('sdg')}
                    className="inline-flex items-center gap-2 font-bold text-sm text-[#294B39] hover:text-[#A4C52A] transition-colors"
                  >
                    Explore SDG Impact Matrix
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-center">
                <SDGAlignmentVignette className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32" />
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3: EDITORIAL INFOGRAPHIC — WHERE PERSONAL CARBON HIDES
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#F2CDC4]/25 border-y border-[#e2dad0]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-5">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#294B39] tracking-tight leading-tight mb-5">
                Where does personal carbon accumulate?
              </h2>
              <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#e5e1d5]">
                <div className="text-sm text-[#41404A]/80 leading-relaxed">
                  Eliminating food waste in a standard 3-person household saves roughly <strong>320 kg of CO₂e</strong> annually—the equivalent of planting 15 mature trees.
                </div>
              </div>
            </div>

            {/* Right Expressive Data Bars */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Item 1: Transport */}
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#e3ded2]">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-bold text-base text-[#294B39]">Daily Mobility & Regional Flights</span>
                  <span className="text-xl font-extrabold text-[#294B39]">42%</span>
                </div>
                <div className="w-full h-3 bg-[#e8e4d8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#294B39] rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              {/* Item 2: Household Energy */}
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#e3ded2]">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-bold text-base text-[#294B39]">Home Heating, Cooling & Grid Power</span>
                  <span className="text-xl font-extrabold text-[#294B39]">31%</span>
                </div>
                <div className="w-full h-3 bg-[#e8e4d8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#A4C52A] rounded-full" style={{ width: '31%' }} />
                </div>
              </div>

              {/* Item 3: Food Systems */}
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#e3ded2]">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-bold text-base text-[#294B39]">Nutrition & Supply Chain Intensity</span>
                  <span className="text-xl font-extrabold text-[#294B39]">18%</span>
                </div>
                <div className="w-full h-3 bg-[#e8e4d8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#9387AB] rounded-full" style={{ width: '18%' }} />
                </div>
              </div>

              {/* Item 4: Packaging & Discards */}
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#e3ded2]">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-bold text-base text-[#294B39]">Municipal Solid Waste & Packaging</span>
                  <span className="text-xl font-extrabold text-[#294B39]">9%</span>
                </div>
                <div className="w-full h-3 bg-[#e8e4d8] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F2CDC4] rounded-full" style={{ width: '9%' }} />
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4: THE 4-STEP ENVIRONMENTAL JOURNEY
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 max-w-7xl mx-auto px-5 sm:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#294B39] tracking-tight">
            How EcoTrack works
          </h2>
        </div>

        {/* Step Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#e3ded2]">
            <div className="w-12 h-12 rounded-2xl bg-[#294B39] text-[#FAF9F6] flex items-center justify-center font-extrabold text-lg mb-4">
              01
            </div>
            <h4 className="text-lg font-bold text-[#294B39]">Input Consumption</h4>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#e3ded2]">
            <div className="w-12 h-12 rounded-2xl bg-[#294B39] text-[#FAF9F6] flex items-center justify-center font-extrabold text-lg mb-4">
              02
            </div>
            <h4 className="text-lg font-bold text-[#294B39]">Compute Footprint</h4>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#e3ded2]">
            <div className="w-12 h-12 rounded-2xl bg-[#294B39] text-[#FAF9F6] flex items-center justify-center font-extrabold text-lg mb-4">
              03
            </div>
            <h4 className="text-lg font-bold text-[#294B39]">Synthesize Advice</h4>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#e3ded2]">
            <div className="w-12 h-12 rounded-2xl bg-[#294B39] text-[#FAF9F6] flex items-center justify-center font-extrabold text-lg mb-4">
              04
            </div>
            <h4 className="text-lg font-bold text-[#294B39]">Pledge &amp; Track</h4>
          </div>

        </div>

      </section>

      {/* Top Organic Contour Transition into Forest Green Section */}
      <div className="w-full overflow-hidden leading-none" style={{ height: 48, marginBottom: -2 }}>
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative block w-full h-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,30 C360,75 720,10 1080,55 C1260,75 1380,40 1440,20 L1440,80 L0,80 Z"
            fill="#294B39"
          />
        </svg>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5: "WHAT IF WE SHIFT?" SCENARIO MODELING
          (Rich Solid Forest Green Section with Lime & Peach Accents)
          ════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#294B39] text-[#FAF9F6] py-16 md:py-24 relative overflow-hidden">
        
        {/* Decorative subtle organic shape in background */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#A4C52A]/10 pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#F2CDC4]/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
          
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#FAF9F6] tracking-tight leading-tight mb-6">
              What happens when small habits scale?
            </h2>
            <p className="text-base sm:text-lg text-[#FAF9F6]/80 leading-relaxed font-normal">
              Explore the real-time mathematics of collective change. Even modest lifestyle adjustments compound into major atmospheric relief.
            </p>
          </div>

          {/* Three Concrete Ecological Shifts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            
            <div className="p-8 rounded-2xl bg-[#FAF9F6]/5 border border-[#FAF9F6]/15 text-left flex flex-col justify-between">
              <div className="text-[#A4C52A] text-sm sm:text-base font-bold uppercase tracking-wider mb-2">Transit Shift</div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#FAF9F6] tracking-tight mb-2">-480 kg</div>
              <div className="text-sm sm:text-base font-semibold text-[#F2CDC4]">CO₂e eliminated per year</div>
            </div>

            <div className="p-8 rounded-2xl bg-[#FAF9F6]/5 border border-[#FAF9F6]/15 text-left flex flex-col justify-between">
              <div className="text-[#A4C52A] text-sm sm:text-base font-bold uppercase tracking-wider mb-2">Zero Food Waste</div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#FAF9F6] tracking-tight mb-2">-320 kg</div>
              <div className="text-sm sm:text-base font-semibold text-[#F2CDC4]">CO₂e eliminated per year</div>
            </div>

            <div className="p-8 rounded-2xl bg-[#FAF9F6]/5 border border-[#FAF9F6]/15 text-left flex flex-col justify-between">
              <div className="text-[#A4C52A] text-sm sm:text-base font-bold uppercase tracking-wider mb-2">Thermal Efficiency</div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#FAF9F6] tracking-tight mb-2">-190 kg</div>
              <div className="text-sm sm:text-base font-semibold text-[#F2CDC4]">CO₂e eliminated per year</div>
            </div>

          </div>

          {/* Action CTA */}
          <div className="text-center">
            <button
              onClick={() => navigate('calculator')}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#A4C52A] text-[#294B39] font-extrabold text-base tracking-wide hover:bg-[#b5d836] active:translate-y-0.5 transition-all shadow-md"
            >
              Test Scenarios in Calculator
              <ArrowRight size={18} />
            </button>
          </div>

        </div>

      </section>

      {/* Bottom Organic Contour Transition from Forest Green into Off-White */}
      <div className="w-full overflow-hidden leading-none bg-[#294B39]" style={{ height: 48 }}>
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative block w-full h-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,0 C320,60 640,75 960,30 C1200,5 1360,40 1440,55 L1440,80 L0,80 Z"
            fill="#FAF9F6"
          />
        </svg>
      </div>

    </div>
  );
}
