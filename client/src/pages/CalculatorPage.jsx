/**
 * @fileoverview EcoTrack Calculator Page
 *
 * A fully-working multi-step carbon footprint calculator featuring:
 *  - Step 1: Electricity consumption
 *  - Step 2: Transportation (car, bike, public transport)
 *  - Step 3: Waste & recycling
 *  - Inline results card with full formula breakdown
 *  - What-If sliders for hypothetical habit changes
 *
 * Calculation logic delegates entirely to ../utils/calculations.js so all
 * math is centralized and testable. This file contains only UI concerns.
 *
 * @param {{
 *   setCurrentPage: (page: string) => void,
 *   setFootprintResult: (result: Object) => void
 * }} props
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Car,
  Bike,
  Bus,
  Trash2,
  Recycle,
  ChevronRight,
  ChevronLeft,
  Calculator,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Save,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';

import { calculateFootprint } from '../utils/calculations';
import { EMISSION_FACTORS } from '../data/emissionFactors';
import { saveAssessment } from '../utils/storage';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Total number of steps in the calculator wizard. */
const TOTAL_STEPS = 3;

/** Default empty input state. All values start as empty strings so the
 *  placeholder text shows and required-field validation is possible. */
const EMPTY_INPUTS = {
  electricity: '',
  carKm: '',
  bikeKm: '',
  publicTransportKm: '',
  weeklyWaste: '',
  weeklyRecycled: '',
};

// ---------------------------------------------------------------------------
// Small helper components
// ---------------------------------------------------------------------------

/**
 * A single labeled number input with optional hint, real-time preview,
 * and error message.
 *
 * @param {{
 *   label: string,
 *   value: string | number,
 *   onChange: (v: string) => void,
 *   placeholder?: string,
 *   hint?: string,
 *   icon?: JSX.Element,
 *   preview?: string,
 *   error?: string,
 *   min?: number,
 *   step?: number
 * }} props
 */
function NumberField({ label, value, onChange, placeholder, hint, icon, preview, error, min = 0, step = 1 }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
        {icon && <span className="text-emerald-600">{icon}</span>}
        {label}
      </label>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-emerald-300'}`}
      />
      {hint && !error && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Info size={11} />
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle size={11} />
          {error}
        </p>
      )}
      {preview && !error && (
        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
          <Calculator size={11} />
          {preview}
        </p>
      )}
    </div>
  );
}

/**
 * Progress bar with step indicators.
 *
 * @param {{ currentStep: number, totalSteps: number, stepLabels: string[] }} props
 */
function StepProgress({ currentStep, totalSteps, stepLabels }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {stepLabels.map((label, i) => {
          const step = i + 1;
          const isDone = step < currentStep;
          const isActive = step === currentStep;
          return (
            <div key={step} className="flex-1 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all
                  ${isDone ? 'bg-[#294B39] text-[#FAF9F6]' : isActive ? 'bg-white text-[#294B39] ring-2 ring-[#294B39]' : 'bg-[#e3ded2] text-[#41404A]/60'}`}
              >
                {isDone ? <CheckCircle size={14} /> : step}
              </div>
              <span className={`text-xs hidden sm:block ${isActive ? 'text-[#294B39] font-bold' : 'text-[#41404A]/60'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Progress bar track */}
      <div className="h-1.5 bg-[#e3ded2] rounded-full overflow-hidden mt-1">
        <div
          className="h-full bg-[#294B39] rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Emission factor badge — shows the factor used for a given category.
 *
 * @param {{ category: string }} props
 */
function FactorBadge({ category }) {
  const f = EMISSION_FACTORS[category];
  if (!f) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700">
      <Info size={10} />
      Factor: {f.value} {f.unit}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Result Card sub-components
// ---------------------------------------------------------------------------

/**
 * A formula row in the result breakdown:
 * e.g. "300 kWh × 0.7 kg CO₂/kWh = 210.0 kg CO₂"
 *
 * @param {{
 *   icon: JSX.Element,
 *   label: string,
 *   inputValue: number,
 *   inputUnit: string,
 *   factor: number,
 *   factorUnit: string,
 *   result: number,
 *   isLargest?: boolean
 * }} props
 */
function FormulaRow({ label, inputValue, inputUnit, factor, factorUnit, result, isLargest }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5 px-3 rounded-xl border border-[#e3ded2]/60 ${isLargest ? 'bg-[#294B39]/5' : 'bg-[#FAF9F6]'}`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${isLargest ? 'text-[#294B39]' : 'text-[#41404A]'}`}>
          {label}
          {isLargest && (
            <span className="ml-2 text-[11px] bg-[#294B39] text-[#FAF9F6] px-2 py-0.5 rounded-full font-bold">Largest</span>
          )}
        </span>
      </div>
      <div className="text-xs text-[#41404A]/80 font-mono">
        {inputValue.toFixed(1)} {inputUnit} × {factor} = {' '}
        <span className="font-bold text-[#294B39]">
          {result.toFixed(1)} kg CO₂
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// What-If Calculator
// ---------------------------------------------------------------------------

/**
 * What-If calculator panel. Shown only after main calculation is done.
 * Lets the user slide/input hypothetical values and see the delta immediately.
 *
 * @param {{ originalResult: Object, originalInputs: Object }} props
 */
function WhatIfCalculator({ originalResult, originalInputs }) {
  // Pre-fill whatIf inputs from original calculation values
  const [whatIf, setWhatIf] = useState({
    electricity: Number(originalInputs.electricity) || 0,
    carKm: Number(originalInputs.carKm) || 0,
    bikeKm: Number(originalInputs.bikeKm) || 0,
    publicTransportKm: Number(originalInputs.publicTransportKm) || 0,
    weeklyWaste: Number(originalInputs.weeklyWaste) || 0,
    weeklyRecycled: Number(originalInputs.weeklyRecycled) || 0,
  });

  // Recalculate whenever whatIf inputs change
  const modifiedResult = calculateFootprint(whatIf);

  /** Difference in total monthly CO₂ (negative = reduction) */
  const delta = modifiedResult.totalMonthly - originalResult.totalMonthly;
  const isReduction = delta <= 0;

  /**
   * Renders a delta badge for a per-category difference.
   * @param {number} orig - Original value
   * @param {number} modified - Modified value
   */
  const DeltaBadge = ({ orig, modified }) => {
    const diff = modified - orig;
    if (Math.abs(diff) < 0.05) return <span className="text-xs text-[#41404A]/60">No change</span>;
    return (
      <span className={`text-xs font-semibold ${diff < 0 ? 'text-[#294B39]' : 'text-red-500'}`}>
        {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg CO₂
      </span>
    );
  };

  /**
   * A single what-if slider row without boxed cards or decorative icons.
   */
  const SliderRow = ({ field, label, unit, max, origCO2, modCO2 }) => (
    <div className="py-3 border-b border-[#e3ded2]/60 last:border-b-0 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#41404A]">
          {label}
        </span>
        <DeltaBadge orig={origCO2} modified={modCO2} />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={max}
          step={1}
          value={whatIf[field]}
          onChange={(e) => setWhatIf((prev) => ({ ...prev, [field]: Number(e.target.value) }))}
          className="flex-1 accent-[#294B39] cursor-pointer"
        />
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            max={max}
            value={whatIf[field]}
            onChange={(e) => setWhatIf((prev) => ({ ...prev, [field]: Number(e.target.value) || 0 }))}
            className="w-20 text-xs border border-[#e3ded2] rounded-lg px-2 py-1 text-center font-bold text-[#294B39] focus:outline-none focus:border-[#294B39]"
          />
          <span className="text-xs text-[#41404A]/60 font-medium">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-10 bg-white border border-[#e3ded2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header */}
      <div>
        <h3 className="text-xl font-extrabold text-[#294B39]">
          What If I Change My Habits?
        </h3>
        <p className="text-xs sm:text-sm text-[#41404A]/75 mt-1 leading-relaxed">
          Adjust the sliders to simulate personal lifestyle changes. Calculations update in real time.
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#e3ded2]">
          <div className="text-[11px] font-semibold text-[#41404A]/60 mb-0.5">Original</div>
          <div className="text-base font-extrabold text-[#294B39]">{originalResult.totalMonthly.toFixed(1)} kg</div>
        </div>
        <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#e3ded2]">
          <div className="text-[11px] font-semibold text-[#41404A]/60 mb-0.5">Modified</div>
          <div className="text-base font-extrabold text-[#294B39]">{modifiedResult.totalMonthly.toFixed(1)} kg</div>
        </div>
        <div className={`rounded-2xl p-3.5 border ${isReduction ? 'bg-[#294B39]/10 border-[#294B39]/20' : 'bg-red-50 border-red-200'}`}>
          <div className="text-[11px] font-semibold text-[#41404A]/60 mb-0.5">Difference</div>
          <div className={`text-base font-extrabold ${isReduction ? 'text-[#294B39]' : 'text-red-600'}`}>
            {isReduction ? '' : '+'}{delta.toFixed(1)} kg
          </div>
        </div>
      </div>

      {/* Sliders in clean aligned rows */}
      <div className="divide-y divide-[#e3ded2]/60">
        <SliderRow
          field="electricity"
          label="Monthly Electricity"
          unit="kWh"
          max={Math.max(2000, (Number(originalInputs.electricity) || 0) * 3)}
          origCO2={originalResult.electricityCO2}
          modCO2={modifiedResult.electricityCO2}
        />
        <SliderRow
          field="carKm"
          label="Car Travel"
          unit="km/mo"
          max={Math.max(3000, (Number(originalInputs.carKm) || 0) * 3)}
          origCO2={originalResult.carCO2}
          modCO2={modifiedResult.carCO2}
        />
        <SliderRow
          field="bikeKm"
          label="Bike Travel"
          unit="km/mo"
          max={Math.max(1000, (Number(originalInputs.bikeKm) || 0) * 3)}
          origCO2={originalResult.bikeCO2}
          modCO2={modifiedResult.bikeCO2}
        />
        <SliderRow
          field="publicTransportKm"
          label="Public Transport"
          unit="km/mo"
          max={Math.max(2000, (Number(originalInputs.publicTransportKm) || 0) * 3)}
          origCO2={originalResult.publicTransportCO2}
          modCO2={modifiedResult.publicTransportCO2}
        />
        <SliderRow
          field="weeklyWaste"
          label="Weekly Waste"
          unit="kg/wk"
          max={Math.max(50, (Number(originalInputs.weeklyWaste) || 0) * 3)}
          origCO2={originalResult.wasteCO2}
          modCO2={modifiedResult.wasteCO2}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main CalculatorPage
// ---------------------------------------------------------------------------

export default function CalculatorPage({ setCurrentPage, setFootprintResult }) {
  // ── Wizard state ──────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [inputs, setInputs] = useState(EMPTY_INPUTS);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);   // FootprintResult | null
  const [saved, setSaved] = useState(false);

  // ── Update a single input field ───────────────────────────────────────────
  /**
   * Generic change handler. Clears the error for the field on every keystroke
   * so the UI stays responsive.
   *
   * @param {string} field - Key in the `inputs` object.
   * @param {string} value - Raw string value from the input element.
   */
  const handleChange = useCallback((field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  // ── Real-time preview helpers ──────────────────────────────────────────────

  /** @returns {string} Live electricity CO₂ preview string */
  const electricityPreview = () => {
    const kwh = Number(inputs.electricity);
    if (!kwh || kwh < 0) return '';
    const co2 = kwh * EMISSION_FACTORS.electricity.value;
    return `Estimated: ${co2.toFixed(1)} kg CO₂ (${kwh} kWh × ${EMISSION_FACTORS.electricity.value})`;
  };

  /** @returns {string} Live car CO₂ preview string */
  const carPreview = () => {
    const km = Number(inputs.carKm);
    if (!km || km < 0) return '';
    return `${(km * EMISSION_FACTORS.car.value).toFixed(1)} kg CO₂/month`;
  };

  /** @returns {string} Live bike CO₂ preview string */
  const bikePreview = () => {
    const km = Number(inputs.bikeKm);
    if (!km || km < 0) return '';
    return `${(km * EMISSION_FACTORS.bike.value).toFixed(1)} kg CO₂/month`;
  };

  /** @returns {string} Live public transport CO₂ preview string */
  const ptPreview = () => {
    const km = Number(inputs.publicTransportKm);
    if (!km || km < 0) return '';
    return `${(km * EMISSION_FACTORS.publicTransport.value).toFixed(1)} kg CO₂/month`;
  };

  /** @returns {string} Live recycling rate preview string */
  const recyclingPreview = () => {
    const total = Number(inputs.weeklyWaste);
    const recycled = Number(inputs.weeklyRecycled);
    if (!total || total <= 0) return '';
    const rate = Math.min(100, (recycled / total) * 100);
    return `Recycling rate: ${rate.toFixed(0)}%`;
  };

  // ── Step validation ────────────────────────────────────────────────────────

  /**
   * Validate the inputs for the current step.
   * Populates `errors` state and returns true if the step is valid.
   *
   * @returns {boolean} Whether all fields in the current step are valid.
   */
  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      const kwh = Number(inputs.electricity);
      if (inputs.electricity === '' || isNaN(kwh)) {
        newErrors.electricity = 'Please enter your monthly electricity usage.';
      } else if (kwh < 0) {
        newErrors.electricity = 'Electricity usage cannot be negative.';
      }
    }

    if (currentStep === 2) {
      const fields = [
        { key: 'carKm', label: 'Car km' },
        { key: 'bikeKm', label: 'Bike km' },
        { key: 'publicTransportKm', label: 'Public transport km' },
      ];
      fields.forEach(({ key, label }) => {
        const val = Number(inputs[key]);
        if (inputs[key] !== '' && (isNaN(val) || val < 0)) {
          newErrors[key] = `${label} cannot be negative.`;
        }
        // Allow empty (treated as 0) for optional transport fields
      });
    }

    if (currentStep === 3) {
      const waste = Number(inputs.weeklyWaste);
      const recycled = Number(inputs.weeklyRecycled);

      if (inputs.weeklyWaste === '' || isNaN(waste)) {
        newErrors.weeklyWaste = 'Please enter your weekly waste amount.';
      } else if (waste < 0) {
        newErrors.weeklyWaste = 'Waste cannot be negative.';
      }

      if (inputs.weeklyRecycled !== '' && !isNaN(recycled)) {
        if (recycled < 0) {
          newErrors.weeklyRecycled = 'Recycled amount cannot be negative.';
        } else if (recycled > waste && waste > 0) {
          newErrors.weeklyRecycled = `Recycled (${recycled} kg) cannot exceed total waste (${waste} kg).`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Navigation ─────────────────────────────────────────────────────────────

  /** Advance to the next step after validation. */
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
    }
  };

  /** Return to the previous step (no validation needed). */
  const handlePrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  // ── Final calculation ──────────────────────────────────────────────────────

  /**
   * Run on Step 3 "Calculate" click. Validates, then calls calculateFootprint()
   * and stores the result in local state + parent state.
   */
  const handleCalculate = () => {
    if (!validateStep()) return;

    // Normalise empty optional fields to '0' so calculations receive numbers
    const safeInputs = {
      electricity: inputs.electricity || '0',
      carKm: inputs.carKm || '0',
      bikeKm: inputs.bikeKm || '0',
      publicTransportKm: inputs.publicTransportKm || '0',
      weeklyWaste: inputs.weeklyWaste || '0',
      weeklyRecycled: inputs.weeklyRecycled || '0',
    };

    const footprint = calculateFootprint(safeInputs);

    setResult(footprint);
    setSaved(false);

    // Propagate result to App-level state so Dashboard etc. can use it
    if (typeof setFootprintResult === 'function') {
      setFootprintResult(footprint);
    }

    // Scroll to result card
    setTimeout(() => {
      document.getElementById('result-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ── Save assessment ────────────────────────────────────────────────────────

  /** Persist the current result to LocalStorage. */
  const handleSave = () => {
    if (!result) return;
    saveAssessment(result);
    setSaved(true);
  };

  // ── Reset ──────────────────────────────────────────────────────────────────

  /** Reset the entire wizard to its initial state. */
  const handleReset = () => {
    setInputs(EMPTY_INPUTS);
    setErrors({});
    setResult(null);
    setSaved(false);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#41404A] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        {/* ── Page header ── */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#294B39] tracking-tight">
            Carbon Footprint Calculator
          </h1>
        </div>

        {/* ── Progress indicator ── */}
        <StepProgress
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          stepLabels={['Electricity', 'Transport', 'Waste']}
        />

        {/* ── STEP CARD ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-xs border border-[#e3ded2] p-6 md:p-8">

          {/* ════════ STEP 1: Electricity ════════ */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="mb-2">
                <h2 className="text-lg font-bold text-[#294B39]">Step 1: Electricity Usage</h2>
                <p className="text-xs text-[#41404A]/70">Monthly residential grid consumption</p>
              </div>

              <NumberField
                label="Monthly Electricity Consumption (kWh)"
                value={inputs.electricity}
                onChange={(v) => handleChange('electricity', v)}
                placeholder="e.g. 250"
                preview={electricityPreview()}
                error={errors.electricity}
                step={10}
              />

              {/* Quick reference */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Small flat', kwh: 150 },
                  { label: 'Average home', kwh: 300 },
                  { label: 'Large home', kwh: 600 },
                ].map(({ label, kwh }) => (
                  <button
                    key={label}
                    onClick={() => handleChange('electricity', String(kwh))}
                    className="text-xs bg-[#FAF9F6] hover:bg-[#294B39]/5 border border-[#e3ded2] rounded-xl p-2.5 text-center transition-colors"
                  >
                    <div className="font-bold text-[#294B39]">{kwh} kWh</div>
                    <div className="text-xs text-[#41404A]/60">{label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════════ STEP 2: Transportation ════════ */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="mb-2">
                <h2 className="text-lg font-bold text-[#294B39]">Step 2: Transportation</h2>
              </div>

              {/* Car */}
              <NumberField
                label="Car — km per month"
                value={inputs.carKm}
                onChange={(v) => handleChange('carKm', v)}
                placeholder="e.g. 500"
                preview={carPreview()}
                error={errors.carKm}
              />

              {/* Bike */}
              <NumberField
                label="Petrol Bike / Two-Wheeler — km per month"
                value={inputs.bikeKm}
                onChange={(v) => handleChange('bikeKm', v)}
                placeholder="e.g. 200"
                preview={bikePreview()}
                error={errors.bikeKm}
              />

              {/* Public transport */}
              <NumberField
                label="Public Transport — km per month"
                value={inputs.publicTransportKm}
                onChange={(v) => handleChange('publicTransportKm', v)}
                placeholder="e.g. 300"
                preview={ptPreview()}
                error={errors.publicTransportKm}
              />

              {/* Clean Emission factors section */}
              <div className="pt-4 border-t border-[#e3ded2] space-y-2">
                <p className="text-sm font-bold text-[#294B39]">Emission factors used:</p>
                <div className="space-y-1.5 text-sm text-[#41404A]">
                  <div className="flex justify-between py-1.5 border-b border-[#e3ded2]/40">
                    <span className="font-medium">Car</span>
                    <span className="font-mono text-[#294B39] font-semibold">0.12 kg CO₂/km</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#e3ded2]/40">
                    <span className="font-medium">Bike</span>
                    <span className="font-mono text-[#294B39] font-semibold">0.05 kg CO₂/km</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#e3ded2]/40">
                    <span className="font-medium">Public Transport</span>
                    <span className="font-mono text-[#294B39] font-semibold">0.04 kg CO₂/passenger-km</span>
                  </div>
                </div>
                <p className="text-xs text-[#41404A]/60 pt-1">
                  Values vary by vehicle type and fuel — these are educational averages.
                </p>
              </div>
            </div>
          )}

          {/* ════════ STEP 3: Waste & Recycling ════════ */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="mb-2">
                <h2 className="text-lg font-bold text-[#294B39]">Step 3: Waste & Recycling</h2>
                <p className="text-xs text-[#41404A]/70">Weekly averages in kilograms</p>
              </div>

              {/* Total waste */}
              <NumberField
                label="Total Waste Generated per Week (kg)"
                value={inputs.weeklyWaste}
                onChange={(v) => handleChange('weeklyWaste', v)}
                placeholder="e.g. 5"
                preview={
                  inputs.weeklyWaste
                    ? `Monthly: ${(Number(inputs.weeklyWaste) * 4).toFixed(1)} kg → ` +
                      `${(Number(inputs.weeklyWaste) * 4 * EMISSION_FACTORS.waste.value).toFixed(1)} kg CO₂`
                    : ''
                }
                error={errors.weeklyWaste}
                step={0.5}
              />

              {/* Recycled */}
              <NumberField
                label="Waste Recycled per Week (kg)"
                value={inputs.weeklyRecycled}
                onChange={(v) => handleChange('weeklyRecycled', v)}
                placeholder="e.g. 2"
                preview={recyclingPreview()}
                error={errors.weeklyRecycled}
                step={0.5}
              />
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            {currentStep < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#294B39] hover:bg-[#1d3528] text-[#FAF9F6] font-bold text-sm shadow-xs transition-all"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleCalculate}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#294B39] hover:bg-[#1d3528] text-[#FAF9F6] font-bold text-sm shadow-xs transition-all"
              >
                Calculate My Footprint
              </button>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RESULTS CARD
            ════════════════════════════════════════════ */}
        {result && (
          <div id="result-card" className="mt-8 space-y-6">

            {/* ── Totals header ── */}
            <div className="bg-[#294B39] rounded-3xl p-6 sm:p-8 text-[#FAF9F6] shadow-xs space-y-5">
              <h2 className="text-xl font-extrabold tracking-tight text-[#FAF9F6]">
                Your Carbon Footprint Estimate
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAF9F6]/10 border border-[#FAF9F6]/15 rounded-2xl p-4 text-center">
                  <div className="text-xs text-[#FAF9F6]/75 mb-1 font-medium">Monthly CO₂</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#FAF9F6]">{result.totalMonthly.toFixed(1)}</div>
                  <div className="text-xs text-[#FAF9F6]/75">kg CO₂</div>
                </div>
                <div className="bg-[#FAF9F6]/10 border border-[#FAF9F6]/15 rounded-2xl p-4 text-center">
                  <div className="text-xs text-[#FAF9F6]/75 mb-1 font-medium">Annual CO₂ (×12)</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#FAF9F6]">
                    {result.annualCO2 >= 1000
                      ? `${(result.annualCO2 / 1000).toFixed(2)} t`
                      : result.annualCO2.toFixed(1)}
                  </div>
                  <div className="text-xs text-[#FAF9F6]/75">
                    {result.annualCO2 >= 1000 ? 'tonnes CO₂' : 'kg CO₂'}
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-6 text-xs text-[#FAF9F6]/85 pt-3 border-t border-[#FAF9F6]/15">
                <span className="font-medium">
                  Recycling rate: <strong className="text-white">{result.recyclingRate.toFixed(0)}%</strong>
                </span>
                <span className="font-medium">
                  Largest source: <strong className="text-white">{result.largestCategory}</strong>
                </span>
              </div>
            </div>

            {/* ── Formula breakdown ── */}
            <div className="bg-white rounded-3xl border border-[#e3ded2] shadow-xs p-6 sm:p-8">
              <h3 className="font-extrabold text-[#294B39] mb-4 text-lg">Calculation Breakdown</h3>
              <div className="space-y-2.5">
                {/* Electricity row */}
                <FormulaRow
                  label="Electricity"
                  inputValue={Number(result.inputs.electricity) || 0}
                  inputUnit="kWh"
                  factor={EMISSION_FACTORS.electricity.value}
                  factorUnit={EMISSION_FACTORS.electricity.unit}
                  result={result.electricityCO2}
                  isLargest={result.largestCategory === 'Electricity'}
                />
                {/* Car row */}
                <FormulaRow
                  label="Car"
                  inputValue={Number(result.inputs.carKm) || 0}
                  inputUnit="km"
                  factor={EMISSION_FACTORS.car.value}
                  factorUnit={EMISSION_FACTORS.car.unit}
                  result={result.carCO2}
                  isLargest={result.largestCategory === 'Car'}
                />
                {/* Bike row */}
                <FormulaRow
                  label="Petrol Bike"
                  inputValue={Number(result.inputs.bikeKm) || 0}
                  inputUnit="km"
                  factor={EMISSION_FACTORS.bike.value}
                  factorUnit={EMISSION_FACTORS.bike.unit}
                  result={result.bikeCO2}
                  isLargest={result.largestCategory === 'Bike'}
                />
                {/* Public transport row */}
                <FormulaRow
                  label="Public Transport"
                  inputValue={Number(result.inputs.publicTransportKm) || 0}
                  inputUnit="km"
                  factor={EMISSION_FACTORS.publicTransport.value}
                  factorUnit={EMISSION_FACTORS.publicTransport.unit}
                  result={result.publicTransportCO2}
                  isLargest={result.largestCategory === 'Public Transport'}
                />
                {/* Waste row — uses monthly kg (weekly × 4) */}
                <FormulaRow
                  label={`Waste (${(Number(result.inputs.weeklyWaste) || 0).toFixed(1)} kg/wk × 4 wks)`}
                  inputValue={(Number(result.inputs.weeklyWaste) || 0) * 4}
                  inputUnit="kg/mo"
                  factor={EMISSION_FACTORS.waste.value}
                  factorUnit={EMISSION_FACTORS.waste.unit}
                  result={result.wasteCO2}
                  isLargest={result.largestCategory === 'Waste'}
                />
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#294B39] hover:bg-[#1d3528] text-[#FAF9F6] font-bold text-sm transition-all shadow-xs"
              >
                <LayoutDashboard size={16} />
                View Full Dashboard
              </button>

              <button
                onClick={handleSave}
                disabled={saved}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border font-bold text-sm transition-all
                  ${saved
                    ? 'border-[#294B39]/20 bg-[#294B39]/10 text-[#294B39] cursor-default'
                    : 'border-[#e3ded2] text-[#294B39] hover:bg-[#FAF9F6]'}`}
              >
                {saved ? <CheckCircle size={16} /> : <Save size={16} />}
                {saved ? 'Saved!' : 'Save This Assessment'}
              </button>

              <button
                onClick={handleReset}
                className="sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#e3ded2] text-[#41404A]/70 font-semibold text-sm hover:bg-[#FAF9F6] transition-all"
              >
                Recalculate
              </button>
            </div>

            {/* ════════ WHAT-IF CALCULATOR ════════ */}
            <WhatIfCalculator
              originalResult={result}
              originalInputs={result.inputs}
            />
          </div>
        )}
      </div>
    </div>
  );
}
