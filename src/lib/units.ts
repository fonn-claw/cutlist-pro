import type { UnitSystem } from '@/lib/types';

const MM_PER_INCH = 25.4;

/**
 * Convert a display value to internal mm storage.
 * Imperial: inches -> mm. Metric: passthrough.
 */
export function toInternal(value: number, units: UnitSystem): number {
  return units === 'imperial' ? value * MM_PER_INCH : value;
}

/**
 * Convert an internal mm value to display units.
 * Imperial: mm -> inches. Metric: passthrough.
 */
export function toDisplay(valueMm: number, units: UnitSystem): number {
  return units === 'imperial' ? valueMm / MM_PER_INCH : valueMm;
}

/**
 * Format decimal inches as a proper fraction string at given precision.
 * Examples: 15.75 -> '15-3/4"', 24.0 -> '24"', 0.5 -> '1/2"'
 */
export function formatFraction(decimalInches: number, precision: number = 16): string {
  let wholeInches = Math.floor(decimalInches);
  const remainder = decimalInches - wholeInches;
  let sixteenths = Math.round(remainder * precision);

  // Edge case: rounding pushed us to the next whole inch
  if (sixteenths === precision) {
    wholeInches += 1;
    sixteenths = 0;
  }

  if (sixteenths === 0) {
    return `${wholeInches}"`;
  }

  // Simplify fraction using GCD
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(sixteenths, precision);
  const numerator = sixteenths / divisor;
  const denominator = precision / divisor;

  if (wholeInches > 0) {
    return `${wholeInches}-${numerator}/${denominator}"`;
  }
  return `${numerator}/${denominator}"`;
}

/**
 * Format an internal mm value for display in the given unit system.
 * Imperial: proper fraction string. Metric: mm with one decimal.
 */
export function formatDimension(valueMm: number, units: UnitSystem): string {
  if (units === 'metric') {
    return `${Math.round(valueMm * 10) / 10}mm`;
  }
  return formatFraction(valueMm / MM_PER_INCH);
}
