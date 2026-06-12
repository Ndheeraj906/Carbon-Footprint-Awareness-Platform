/**
 * Emission Factors (kg CO2e)
 * @type {Object}
 */
export const EF = {
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

/**
 * Calculates transportation CO2 footprint.
 * @param {number} carKm - Kilometers driven.
 * @param {string} carType - Type of car (petrol, diesel, hybrid, electric).
 * @param {number} shortFlights - Number of short flights.
 * @param {number} longFlights - Number of long flights.
 * @param {number} transitKm - Kilometers on public transit.
 * @returns {number} Transport CO2 footprint in kg.
 */
export function calculateTransportCO2(carKm, carType, shortFlights, longFlights, transitKm) {
  return (
    carKm * EF.car[carType] +
    shortFlights * EF.shortFlight +
    longFlights * EF.longFlight +
    transitKm * EF.transit
  );
}

/**
 * Calculates home energy CO2 footprint.
 * @param {number} electricKwh - Electricity usage in kWh.
 * @param {string} energySource - Grid, partial, or renewable.
 * @param {number} gasM3 - Natural gas usage in cubic meters.
 * @param {number} heatingOil - Heating oil usage in liters.
 * @param {number} homeSize - Home size multiplier.
 * @returns {number} Energy CO2 footprint in kg.
 */
export function calculateEnergyCO2(electricKwh, energySource, gasM3, heatingOil, homeSize) {
  const electricEF =
    energySource === 'grid'
      ? EF.electricGrid
      : energySource === 'partial'
        ? EF.electricPartial
        : EF.electricRenewable;
  return (electricKwh * electricEF + gasM3 * EF.naturalGas + heatingOil * EF.heatingOil) * homeSize;
}

/**
 * Calculates food CO2 footprint.
 * @param {number} beefKg - Beef consumption in kg.
 * @param {number} poultryKg - Poultry consumption in kg.
 * @param {number} fishKg - Fish consumption in kg.
 * @param {number} dairyKg - Dairy consumption in kg.
 * @param {number} veggieKg - Vegetable consumption in kg.
 * @param {number} dietStyle - Diet style multiplier.
 * @returns {number} Food CO2 footprint in kg.
 */
export function calculateFoodCO2(beefKg, poultryKg, fishKg, dairyKg, veggieKg, dietStyle) {
  return (
    (beefKg * EF.beef +
      poultryKg * EF.poultry +
      fishKg * EF.fish +
      dairyKg * EF.dairy +
      veggieKg * EF.veggies) *
    dietStyle
  );
}

/**
 * Calculates waste and shopping CO2 footprint.
 * @param {number} wasteKg - Weekly waste in kg.
 * @param {number} recyclingRate - Percentage of waste recycled.
 * @param {number} clothingItems - New clothing items bought.
 * @param {number} onlineShopping - Online packages received.
 * @returns {number} Waste CO2 footprint in kg.
 */
export function calculateWasteCO2(wasteKg, recyclingRate, clothingItems, onlineShopping) {
  return (
    wasteKg * 4.33 * EF.wasteGeneral * (1 - recyclingRate / 100) +
    clothingItems * EF.clothing +
    onlineShopping * EF.onlinePackage
  );
}
