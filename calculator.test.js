/**
 * @jest-environment jsdom
 */

// Define clean calculation logic for testing
const EF = {
  car: { petrol: 0.21, diesel: 0.17, hybrid: 0.12, electric: 0.05 },
  transit: 0.089,
  shortFlight: 255,
  longFlight: 1100,
  electricGrid: 0.233,
  electricRenewable: 0.02,
  electricPartial: 0.13,
  naturalGas: 2.04,
  heatingOil: 2.68,
  beef: 27,
  poultry: 6.9,
  fish: 6.1,
  dairy: 3.2,
  veggies: 0.9,
  wasteGeneral: 0.57,
  clothing: 12,
  onlinePackage: 0.5,
};

function calculateTransportCO2(carKm, carType, shortFlights, longFlights, transitKm) {
  return (
    carKm * EF.car[carType] +
    shortFlights * EF.shortFlight +
    longFlights * EF.longFlight +
    transitKm * EF.transit
  );
}

function calculateEnergyCO2(electricKwh, energySource, gasM3, heatingOil, homeSize) {
  const electricEF = energySource === 'grid' ? EF.electricGrid : energySource === 'partial' ? EF.electricPartial : EF.electricRenewable;
  return (electricKwh * electricEF + gasM3 * EF.naturalGas + heatingOil * EF.heatingOil) * homeSize;
}

function calculateFoodCO2(beefKg, poultryKg, fishKg, dairyKg, veggieKg, dietStyle) {
  return (
    beefKg * EF.beef +
    poultryKg * EF.poultry +
    fishKg * EF.fish +
    dairyKg * EF.dairy +
    veggieKg * EF.veggies
  ) * dietStyle;
}

function calculateWasteCO2(wasteKg, recyclingRate, clothingItems, onlineShopping) {
  return (
    wasteKg * 4.33 * EF.wasteGeneral * (1 - recyclingRate / 100) +
    clothingItems * EF.clothing +
    onlineShopping * EF.onlinePackage
  );
}

describe('Carbon Footprint Calculation Algorithms', () => {
  test('should calculate transport footprint correctly', () => {
    // 100 km in petrol car, 1 short flight, 50 km transit
    const co2 = calculateTransportCO2(100, 'petrol', 1, 0, 50);
    expect(co2).toBeCloseTo(100 * 0.21 + 1 * 255 + 50 * 0.089);
  });

  test('should calculate energy footprint correctly', () => {
    // 200 kWh grid power, 10 m3 gas, home size factor 1.2
    const co2 = calculateEnergyCO2(200, 'grid', 10, 0, 1.2);
    expect(co2).toBeCloseTo((200 * 0.233 + 10 * 2.04) * 1.2);
  });

  test('should calculate food footprint correctly', () => {
    // 2kg beef, 3kg veggies, vegan diet modifier 0.8
    const co2 = calculateFoodCO2(2, 0, 0, 0, 3, 0.8);
    expect(co2).toBeCloseTo((2 * 27 + 3 * 0.9) * 0.8);
  });

  test('should calculate waste footprint correctly', () => {
    // 5kg waste with 50% recycling, 2 clothing items
    const co2 = calculateWasteCO2(5, 50, 2, 0);
    expect(co2).toBeCloseTo(5 * 4.33 * 0.57 * 0.5 + 2 * 12);
  });
});
