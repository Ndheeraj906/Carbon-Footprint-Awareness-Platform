/**
 * @jest-environment jsdom
 */

import {
  calculateTransportCO2,
  calculateEnergyCO2,
  calculateFoodCO2,
  calculateWasteCO2,
  EF
} from './src/calculator.js';

describe('Carbon Footprint Calculation Algorithms', () => {
  test('should calculate transport footprint correctly', () => {
    const co2 = calculateTransportCO2(100, 'petrol', 1, 0, 50);
    expect(co2).toBeCloseTo(100 * 0.21 + 1 * 255 + 50 * 0.089);
  });

  test('should calculate transport footprint correctly with electric vehicle', () => {
    const co2 = calculateTransportCO2(200, 'electric', 0, 2, 0);
    expect(co2).toBeCloseTo(200 * 0.05 + 2 * 1100);
  });

  test('should calculate energy footprint correctly with grid', () => {
    const co2 = calculateEnergyCO2(200, 'grid', 10, 0, 1.2);
    expect(co2).toBeCloseTo((200 * 0.233 + 10 * 2.04) * 1.2);
  });

  test('should calculate energy footprint correctly with renewable', () => {
    const co2 = calculateEnergyCO2(150, 'renewable', 0, 50, 1.0);
    expect(co2).toBeCloseTo((150 * 0.02 + 50 * 2.68) * 1.0);
  });

  test('should calculate food footprint correctly', () => {
    const co2 = calculateFoodCO2(2, 0, 0, 0, 3, 0.8);
    expect(co2).toBeCloseTo((2 * 27 + 3 * 0.9) * 0.8);
  });

  test('should calculate food footprint correctly with zero meat', () => {
    const co2 = calculateFoodCO2(0, 0, 0, 2, 5, 0.7);
    expect(co2).toBeCloseTo((2 * 3.2 + 5 * 0.9) * 0.7);
  });

  test('should calculate waste footprint correctly', () => {
    const co2 = calculateWasteCO2(5, 50, 2, 0);
    expect(co2).toBeCloseTo(5 * 4.33 * 0.57 * 0.5 + 2 * 12);
  });

  test('should calculate waste footprint correctly with online shopping', () => {
    const co2 = calculateWasteCO2(10, 20, 0, 5);
    expect(co2).toBeCloseTo(10 * 4.33 * 0.57 * 0.8 + 5 * 0.5);
  });
});
