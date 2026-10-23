/**
 * @fileoverview Pure calculation utilities for EcoTrack.
 *
 * All functions are side-effect-free and depend only on EMISSION_FACTORS.
 * CO₂ values are monthly totals (kg) unless otherwise noted.
 * No React imports — safe to use in any context including tests.
 */

import { EMISSION_FACTORS } from '../data/emissionFactors';

// ---------------------------------------------------------------------------
// Individual Category Calculators
// ---------------------------------------------------------------------------

/**
 * Calculate monthly CO₂ from electricity usage.
 *
 * @param {number} kWh - Monthly electricity consumption in kilowatt-hours.
 * @returns {number} CO₂ in kg for the month.
 */
export function calculateElectricityCO2(kWh) {
  return kWh * EMISSION_FACTORS.electricity.value;
}

/**
 * Calculate monthly CO₂ from car travel.
 *
 * @param {number} km - Monthly distance driven by car in kilometres.
 * @returns {number} CO₂ in kg for the month.
 */
export function calculateCarCO2(km) {
  return km * EMISSION_FACTORS.car.value;
}

/**
 * Calculate monthly CO₂ from petrol two-wheeler (bike) travel.
 *
 * @param {number} km - Monthly distance ridden by bike in kilometres.
 * @returns {number} CO₂ in kg for the month.
 */
export function calculateBikeCO2(km) {
  return km * EMISSION_FACTORS.bike.value;
}

/**
 * Calculate monthly CO₂ from public transport travel.
 *
 * @param {number} km - Monthly distance travelled by public transport in kilometres.
 * @returns {number} CO₂ in kg for the month.
 */
export function calculatePublicTransportCO2(km) {
  return km * EMISSION_FACTORS.publicTransport.value;
}

/**
 * Calculate monthly CO₂ from waste generation.
 * Converts weekly waste (kg) to a monthly total using a 4-week month,
 * then applies the waste emission factor.
 *
 * @param {number} weeklyKg - Weekly waste generated in kilograms.
 * @returns {number} CO₂ in kg for the month.
 */
export function calculateWasteCO2(weeklyKg) {
  const monthlyKg = weeklyKg * 4; // approximate 4 weeks per month
  return monthlyKg * EMISSION_FACTORS.waste.value;
}

// ---------------------------------------------------------------------------
// Derived Metrics
// ---------------------------------------------------------------------------

/**
 * Calculate the recycling rate as a percentage.
 * Clamps the result to [0, 100] to guard against bad inputs.
 *
 * @param {number} recycled - Amount recycled (same units as total).
 * @param {number} total    - Total waste generated.
 * @returns {number} Recycling rate in percent (0–100).
 */
export function calculateRecyclingRate(recycled, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, (recycled / total) * 100);
}

// ---------------------------------------------------------------------------
// Full Footprint Calculator
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} FootprintInputs
 * @property {number|string} electricity       - Monthly kWh usage.
 * @property {number|string} carKm             - Monthly km driven by car.
 * @property {number|string} bikeKm            - Monthly km ridden by petrol bike.
 * @property {number|string} publicTransportKm - Monthly km by public transport.
 * @property {number|string} weeklyWaste       - Weekly waste generated (kg).
 * @property {number|string} weeklyRecycled    - Weekly waste recycled (kg).
 */

/**
 * @typedef {Object} FootprintResult
 * @property {number} electricityCO2      - Monthly electricity CO₂ (kg).
 * @property {number} carCO2              - Monthly car CO₂ (kg).
 * @property {number} bikeCO2             - Monthly bike CO₂ (kg).
 * @property {number} publicTransportCO2  - Monthly public transport CO₂ (kg).
 * @property {number} wasteCO2            - Monthly waste CO₂ (kg).
 * @property {number} totalMonthly        - Total monthly CO₂ (kg).
 * @property {number} annualCO2           - Estimated annual CO₂ (kg, monthly × 12).
 * @property {number} recyclingRate       - Recycling rate as a percentage (0–100).
 * @property {string} largestCategory     - Name of the highest-emission category.
 * @property {FootprintInputs} inputs     - The original inputs (for reference/storage).
 */

/**
 * Calculate a complete carbon footprint from user inputs.
 * String inputs are safely coerced to numbers; invalid values default to 0.
 *
 * @param {FootprintInputs} inputs - User-provided activity data.
 * @returns {FootprintResult} Detailed breakdown of monthly and annual CO₂.
 */
export function calculateFootprint(inputs) {
  const {
    electricity,
    carKm,
    bikeKm,
    publicTransportKm,
    weeklyWaste,
    weeklyRecycled,
  } = inputs;

  const electricityCO2 = calculateElectricityCO2(Number(electricity) || 0);
  const carCO2 = calculateCarCO2(Number(carKm) || 0);
  const bikeCO2 = calculateBikeCO2(Number(bikeKm) || 0);
  const publicTransportCO2 = calculatePublicTransportCO2(Number(publicTransportKm) || 0);
  const wasteCO2 = calculateWasteCO2(Number(weeklyWaste) || 0);

  const totalMonthly = electricityCO2 + carCO2 + bikeCO2 + publicTransportCO2 + wasteCO2;
  const annualCO2 = totalMonthly * 12;

  const recyclingRate = calculateRecyclingRate(
    Number(weeklyRecycled) || 0,
    Number(weeklyWaste) || 0
  );

  // Determine which category contributes the most CO₂
  const categories = [
    { name: 'Electricity', value: electricityCO2 },
    { name: 'Car', value: carCO2 },
    { name: 'Bike', value: bikeCO2 },
    { name: 'Public Transport', value: publicTransportCO2 },
    { name: 'Waste', value: wasteCO2 },
  ];
  const largestCategory = categories.reduce((a, b) => (a.value > b.value ? a : b)).name;

  return {
    electricityCO2,
    carCO2,
    bikeCO2,
    publicTransportCO2,
    wasteCO2,
    totalMonthly,
    annualCO2,
    recyclingRate,
    largestCategory,
    inputs: { electricity, carKm, bikeKm, publicTransportKm, weeklyWaste, weeklyRecycled },
  };
}

// ---------------------------------------------------------------------------
// Formatting Helpers
// ---------------------------------------------------------------------------

/**
 * Format a CO₂ value for display.
 * Values ≥ 1000 kg are shown in tonnes to two decimal places;
 * smaller values are shown in kg to one decimal place.
 *
 * @param {number} kg - CO₂ mass in kilograms.
 * @returns {string} Human-readable string, e.g. "1.23 tonnes CO₂" or "456.7 kg CO₂".
 */
export function formatCO2(kg) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} tonnes CO₂`;
  return `${kg.toFixed(1)} kg CO₂`;
}

/**
 * Round a number to one decimal place.
 *
 * @param {number} n - The number to round.
 * @returns {number} Number rounded to one decimal place.
 */
export function round1(n) {
  return Math.round(n * 10) / 10;
}
