import { describe, it, expect } from 'vitest';
import { calculateCO2, calculateEcoScore } from './calculations';

describe('Carbon Footprint Calculations', () => {
  it('correctly calculates transport emissions', () => {
    // 10 km * 0.27 factor = 2.7 kg
    expect(calculateCO2('transport', 10)).toBe(2.7);
  });

  it('correctly calculates energy emissions', () => {
    // 50 kWh * 0.45 factor = 22.5 kg
    expect(calculateCO2('energy', 50)).toBe(22.5);
  });

  it('correctly calculates diet emissions', () => {
    // 3 meals * 3.2 factor = 9.6 kg
    expect(calculateCO2('diet', 3)).toBe(9.6);
  });

  it('throws error for negative amounts', () => {
    expect(() => calculateCO2('transport', -5)).toThrow("Amount cannot be negative");
  });
});

describe('Sustainability EcoScore Logic', () => {
  it('awards 100 for zero emissions', () => {
    expect(calculateEcoScore(0)).toBe(100);
  });

  it('deducts points correctly based on emissions', () => {
    // 20 kg CO2 / 10 * 5 = 10 point deduction = 90 score
    expect(calculateEcoScore(20)).toBe(90);
  });

  it('floors score at 0 for massive emissions', () => {
    expect(calculateEcoScore(5000)).toBe(0);
  });
});
