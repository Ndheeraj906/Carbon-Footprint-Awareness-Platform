export const EMISSION_FACTORS = {
  transport: 0.27, // kg CO2 per km
  energy: 0.45,    // kg CO2 per kWh
  diet: 3.2,       // kg CO2 per meal (meat heavy)
};

export function calculateCO2(type: 'transport' | 'energy' | 'diet', amount: number): number {
  if (amount < 0) throw new Error("Amount cannot be negative");
  const factor = EMISSION_FACTORS[type];
  if (!factor) throw new Error("Invalid activity type");
  
  return Number((amount * factor).toFixed(2));
}

export function calculateEcoScore(totalCO2: number): number {
  // Base score 100. Every 10kg of CO2 reduces score by 5. Floor is 0.
  const score = 100 - (totalCO2 / 10) * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}
