/**
 * @jest-environment jsdom
 */

/**
 * Comprehensive unit tests for the EcoTrack Carbon Footprint Calculator.
 * Tests cover all calculation functions with multiple edge cases to ensure
 * scientific accuracy and robustness of the carbon footprint algorithms.
 *
 * @module calculator.test
 */

import {
  calculateTransportCO2,
  calculateEnergyCO2,
  calculateFoodCO2,
  calculateWasteCO2,
  EF,
} from './src/calculator.js';

// ─── Emission Factor Integrity Tests ──────────────────────────────────────────
describe('Emission Factors (EF) object', () => {
  test('EF should be a non-null object', () => {
    expect(EF).toBeDefined();
    expect(typeof EF).toBe('object');
  });

  test('EF.car should contain all 4 fuel types with positive values', () => {
    expect(EF.car.petrol).toBeGreaterThan(0);
    expect(EF.car.diesel).toBeGreaterThan(0);
    expect(EF.car.hybrid).toBeGreaterThan(0);
    expect(EF.car.electric).toBeGreaterThan(0);
  });

  test('Electric car should emit less than petrol car', () => {
    expect(EF.car.electric).toBeLessThan(EF.car.petrol);
  });

  test('Long-haul flight should emit more than short-haul flight', () => {
    expect(EF.longFlight).toBeGreaterThan(EF.shortFlight);
  });

  test('Beef should have highest food emission factor', () => {
    expect(EF.beef).toBeGreaterThan(EF.poultry);
    expect(EF.beef).toBeGreaterThan(EF.fish);
    expect(EF.beef).toBeGreaterThan(EF.dairy);
    expect(EF.beef).toBeGreaterThan(EF.veggies);
  });
});

// ─── Transport CO2 Tests ───────────────────────────────────────────────────────
describe('calculateTransportCO2()', () => {
  test('should return 0 for all zero inputs', () => {
    expect(calculateTransportCO2(0, 'petrol', 0, 0, 0)).toBe(0);
  });

  test('should calculate petrol car footprint correctly', () => {
    const result = calculateTransportCO2(100, 'petrol', 0, 0, 0);
    expect(result).toBeCloseTo(100 * EF.car.petrol);
  });

  test('should calculate diesel car footprint correctly', () => {
    const result = calculateTransportCO2(100, 'diesel', 0, 0, 0);
    expect(result).toBeCloseTo(100 * EF.car.diesel);
  });

  test('should calculate hybrid car footprint correctly', () => {
    const result = calculateTransportCO2(100, 'hybrid', 0, 0, 0);
    expect(result).toBeCloseTo(100 * EF.car.hybrid);
  });

  test('should calculate electric car footprint correctly', () => {
    const result = calculateTransportCO2(200, 'electric', 0, 0, 0);
    expect(result).toBeCloseTo(200 * EF.car.electric);
  });

  test('should calculate short-haul flights correctly', () => {
    const result = calculateTransportCO2(0, 'petrol', 3, 0, 0);
    expect(result).toBeCloseTo(3 * EF.shortFlight);
  });

  test('should calculate long-haul flights correctly', () => {
    const result = calculateTransportCO2(0, 'petrol', 0, 2, 0);
    expect(result).toBeCloseTo(2 * EF.longFlight);
  });

  test('should calculate public transit correctly', () => {
    const result = calculateTransportCO2(0, 'petrol', 0, 0, 200);
    expect(result).toBeCloseTo(200 * EF.transit);
  });

  test('should aggregate all transport sources correctly', () => {
    const result = calculateTransportCO2(100, 'petrol', 1, 0, 50);
    const expected = 100 * EF.car.petrol + 1 * EF.shortFlight + 50 * EF.transit;
    expect(result).toBeCloseTo(expected);
  });

  test('electric car should produce less CO2 than petrol for same distance', () => {
    const electric = calculateTransportCO2(500, 'electric', 0, 0, 0);
    const petrol = calculateTransportCO2(500, 'petrol', 0, 0, 0);
    expect(electric).toBeLessThan(petrol);
  });
});

// ─── Energy CO2 Tests ─────────────────────────────────────────────────────────
describe('calculateEnergyCO2()', () => {
  test('should return 0 for all zero inputs', () => {
    expect(calculateEnergyCO2(0, 'grid', 0, 0, 1)).toBe(0);
  });

  test('should calculate grid electricity correctly', () => {
    const result = calculateEnergyCO2(200, 'grid', 0, 0, 1);
    expect(result).toBeCloseTo(200 * EF.electricGrid);
  });

  test('should calculate renewable electricity correctly', () => {
    const result = calculateEnergyCO2(200, 'renewable', 0, 0, 1);
    expect(result).toBeCloseTo(200 * EF.electricRenewable);
  });

  test('should calculate partial renewable electricity correctly', () => {
    const result = calculateEnergyCO2(200, 'partial', 0, 0, 1);
    expect(result).toBeCloseTo(200 * EF.electricPartial);
  });

  test('renewable should emit less than grid for same usage', () => {
    const renewable = calculateEnergyCO2(300, 'renewable', 0, 0, 1);
    const grid = calculateEnergyCO2(300, 'grid', 0, 0, 1);
    expect(renewable).toBeLessThan(grid);
  });

  test('should scale with home size multiplier', () => {
    const small = calculateEnergyCO2(100, 'grid', 0, 0, 1.0);
    const large = calculateEnergyCO2(100, 'grid', 0, 0, 2.0);
    expect(large).toBeCloseTo(small * 2);
  });

  test('should calculate natural gas correctly', () => {
    const result = calculateEnergyCO2(0, 'grid', 10, 0, 1);
    expect(result).toBeCloseTo(10 * EF.naturalGas);
  });

  test('should calculate heating oil correctly', () => {
    const result = calculateEnergyCO2(0, 'grid', 0, 50, 1);
    expect(result).toBeCloseTo(50 * EF.heatingOil);
  });

  test('should aggregate all energy sources with home size', () => {
    const result = calculateEnergyCO2(200, 'grid', 10, 0, 1.2);
    const expected = (200 * EF.electricGrid + 10 * EF.naturalGas) * 1.2;
    expect(result).toBeCloseTo(expected);
  });
});

// ─── Food CO2 Tests ───────────────────────────────────────────────────────────
describe('calculateFoodCO2()', () => {
  test('should return 0 for all zero inputs', () => {
    expect(calculateFoodCO2(0, 0, 0, 0, 0, 1)).toBe(0);
  });

  test('should calculate beef footprint correctly', () => {
    const result = calculateFoodCO2(2, 0, 0, 0, 0, 1);
    expect(result).toBeCloseTo(2 * EF.beef);
  });

  test('should calculate vegan diet (veggies only) correctly', () => {
    const result = calculateFoodCO2(0, 0, 0, 0, 5, 1);
    expect(result).toBeCloseTo(5 * EF.veggies);
  });

  test('diet style multiplier should scale total correctly', () => {
    const base = calculateFoodCO2(2, 0, 0, 0, 0, 1.0);
    const scaled = calculateFoodCO2(2, 0, 0, 0, 0, 0.5);
    expect(scaled).toBeCloseTo(base * 0.5);
  });

  test('beef-heavy diet should produce more CO2 than veggie diet', () => {
    const beef = calculateFoodCO2(5, 0, 0, 0, 0, 1);
    const veggie = calculateFoodCO2(0, 0, 0, 0, 5, 1);
    expect(beef).toBeGreaterThan(veggie);
  });

  test('should aggregate all food categories', () => {
    const result = calculateFoodCO2(2, 1, 1, 2, 3, 0.8);
    const expected =
      (2 * EF.beef + 1 * EF.poultry + 1 * EF.fish + 2 * EF.dairy + 3 * EF.veggies) * 0.8;
    expect(result).toBeCloseTo(expected);
  });
});

// ─── Waste CO2 Tests ──────────────────────────────────────────────────────────
describe('calculateWasteCO2()', () => {
  test('should return 0 for all zero inputs', () => {
    expect(calculateWasteCO2(0, 0, 0, 0)).toBe(0);
  });

  test('should calculate general waste correctly with no recycling', () => {
    const result = calculateWasteCO2(5, 0, 0, 0);
    expect(result).toBeCloseTo(5 * 4.33 * EF.wasteGeneral * 1.0);
  });

  test('100% recycling should reduce waste CO2 to zero', () => {
    const result = calculateWasteCO2(10, 100, 0, 0);
    expect(result).toBeCloseTo(0);
  });

  test('50% recycling should halve waste CO2', () => {
    const noRecycling = calculateWasteCO2(5, 0, 0, 0);
    const halfRecycling = calculateWasteCO2(5, 50, 0, 0);
    expect(halfRecycling).toBeCloseTo(noRecycling * 0.5);
  });

  test('should calculate clothing items correctly', () => {
    const result = calculateWasteCO2(0, 0, 3, 0);
    expect(result).toBeCloseTo(3 * EF.clothing);
  });

  test('should calculate online shopping correctly', () => {
    const result = calculateWasteCO2(0, 0, 0, 10);
    expect(result).toBeCloseTo(10 * EF.onlinePackage);
  });

  test('should aggregate all waste sources correctly', () => {
    const result = calculateWasteCO2(5, 50, 2, 5);
    const expected = 5 * 4.33 * EF.wasteGeneral * 0.5 + 2 * EF.clothing + 5 * EF.onlinePackage;
    expect(result).toBeCloseTo(expected);
  });
});

// ─── Extra Calculation & UI Logic Edge Case Tests ──────────────────────────────
describe('Edge cases and boundary inputs', () => {
  test('calculateTransportCO2 with null/undefined values defaults gracefully', () => {
    // Note: JS allows undefined * number = NaN. Our test checks behavior.
    expect(isNaN(calculateTransportCO2(undefined, 'petrol', null, undefined, null))).toBe(true);
  });

  test('calculateTransportCO2 with negative inputs calculates raw value', () => {
    const val = calculateTransportCO2(-100, 'petrol', -5, -2, -50);
    expect(val).toBeLessThan(0);
  });

  test('calculateTransportCO2 unknown fuel type fallback to NaN or error', () => {
    expect(isNaN(calculateTransportCO2(100, 'invalid-fuel', 0, 0, 0))).toBe(true);
  });

  test('calculateEnergyCO2 handles negative or null values', () => {
    expect(isNaN(calculateEnergyCO2(null, 'grid', undefined, -10, -1))).toBe(true);
  });

  test('calculateEnergyCO2 handles zero size factor multiplier correctly', () => {
    expect(calculateEnergyCO2(100, 'grid', 20, 10, 0)).toBe(0);
  });

  test('calculateFoodCO2 handles negative and null inputs', () => {
    expect(isNaN(calculateFoodCO2(null, -10, undefined, -5, 0, 1))).toBe(true);
  });

  test('calculateFoodCO2 with negative multiplier scales appropriately', () => {
    expect(calculateFoodCO2(2, 2, 2, 2, 2, -0.5)).toBeLessThan(0);
  });

  test('calculateWasteCO2 with negative waste volume or items', () => {
    const val = calculateWasteCO2(-5, 0, -3, -1);
    expect(val).toBeLessThan(0);
  });

  test('calculateWasteCO2 recycling rate greater than 100 calculates percentage ratio', () => {
    const val = calculateWasteCO2(10, 150, 0, 0);
    expect(val).toBeCloseTo(10 * 4.33 * EF.wasteGeneral * -0.5);
  });

  test('calculateWasteCO2 negative recycling rate treats percentage accordingly', () => {
    const negativeRecycling = calculateWasteCO2(5, -20, 0, 0);
    expect(negativeRecycling).toBeCloseTo(5 * 4.33 * EF.wasteGeneral * 1.2);
  });

  test('calculateTransportCO2 very large inputs are calculated without overflow', () => {
    const largeResult = calculateTransportCO2(1e6, 'petrol', 100, 100, 1e6);
    expect(largeResult).toBe(1e6 * EF.car.petrol + 100 * EF.shortFlight + 100 * EF.longFlight + 1e6 * EF.transit);
  });

  test('calculateEnergyCO2 extremely high energy inputs calculation', () => {
    const largeResult = calculateEnergyCO2(1e6, 'grid', 1e6, 1e6, 3.0);
    const expected = (1e6 * EF.electricGrid + 1e6 * EF.naturalGas + 1e6 * EF.heatingOil) * 3.0;
    expect(largeResult).toBeCloseTo(expected);
  });

  test('calculateFoodCO2 high dietary intake volume calculation', () => {
    const largeResult = calculateFoodCO2(1000, 1000, 1000, 1000, 1000, 2.0);
    const expected = (1000 * EF.beef + 1000 * EF.poultry + 1000 * EF.fish + 1000 * EF.dairy + 1000 * EF.veggies) * 2.0;
    expect(largeResult).toBeCloseTo(expected);
  });

  test('calculateWasteCO2 very large waste volumes handles correctly', () => {
    const largeResult = calculateWasteCO2(1000, 50, 1000, 1000);
    const expected = 1000 * 4.33 * EF.wasteGeneral * 0.5 + 1000 * EF.clothing + 1000 * EF.onlinePackage;
    expect(largeResult).toBeCloseTo(expected);
  });

  test('Emission Factor object remains unchanged and matches standards', () => {
    expect(EF.transit).toBe(0.089);
    expect(EF.clothing).toBe(12.0);
    expect(EF.onlinePackage).toBe(0.5);
  });
});
