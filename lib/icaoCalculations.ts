// icaoCalculations.ts
import { Airport } from "./types";

const CALIBRATED_EMISSIONS_FACTOR = 0.0291; // tons CO2 per km (round trip)

// Flight type thresholds
const FLIGHT_DISTANCE_THRESHOLDS = {
derby: 50,      // Below this is considered a derby match (ground transport)
  short: 800,     // Below this is a short flight
  medium: 4800    // Below this is a medium flight, above is long-haul
};

// Distance correction for flight routing inefficiencies
const ROUTE_INEFFICIENCY = {
  derby: 1.0,     // No correction for ground transport
  short: 1.13,    // 13% extra for short flights
  medium: 1.08,   // 8% extra for medium flights
  long: 1.05      // 5% extra for long flights
};

// CO2 emission adjustment based on flight length
// Shorter flights have higher emissions per km due to takeoff/landing
const DISTANCE_EMISSIONS_ADJUSTMENT = {
  derby: 0.5,     // Ground transport is more efficient
  short: 1.3,     // Short flights have higher per-km emissions
  medium: 1.0,    // Medium flights are our baseline
  long: 0.9       // Long flights have lower per-km emissions
};

export interface EmissionsResult {
  totalEmissions: number;      // Total CO2 emissions in metric tons
  distanceKm: number;          // Original distance in km
  adjustedDistance: number;    // Distance after corrections in km
  flightType: string;          // Flight category
  emissionsPerKm: number;      // Tons CO2 per km
  isRoundTrip: boolean;        // Whether this is round trip
}

/**
 * Determine flight type based on distance
 */
export function determineFlightType(distanceKm: number): string {
  if (distanceKm < FLIGHT_DISTANCE_THRESHOLDS.derby) {
    return "Derby Match";
  } else if (distanceKm < FLIGHT_DISTANCE_THRESHOLDS.short) {
    return "Short Flight";
  } else if (distanceKm < FLIGHT_DISTANCE_THRESHOLDS.medium) {
    return "Medium Flight";
  } else {
    return "Long Flight";
  }
}

/**
 * Apply route inefficiency correction based on flight type
 */
function applyRouteCorrection(distance: number, flightType: string): number {
  if (flightType === "Derby Match") {
    return distance * ROUTE_INEFFICIENCY.derby;
  } else if (flightType === "Short Flight") {
    return distance * ROUTE_INEFFICIENCY.short;
  } else if (flightType === "Medium Flight") {
    return distance * ROUTE_INEFFICIENCY.medium;
  } else {
    return distance * ROUTE_INEFFICIENCY.long;
  }
}

/**
 * Get emissions factor adjustment based on flight type
 */
function getEmissionsAdjustment(flightType: string): number {
  if (flightType === "Derby Match") {
    return DISTANCE_EMISSIONS_ADJUSTMENT.derby;
  } else if (flightType === "Short Flight") {
    return DISTANCE_EMISSIONS_ADJUSTMENT.short;
  } else if (flightType === "Medium Flight") {
    return DISTANCE_EMISSIONS_ADJUSTMENT.medium;
  } else {
    return DISTANCE_EMISSIONS_ADJUSTMENT.long;
  }
}

/**
 * Calculate emissions for sports team travel
 *
 * This function is specifically calibrated for professional sports teams,
 * accounting for the unique characteristics of charter flights and sports equipment.
 */
export function calculateSportsEmissions(
  distance: number,
  isRoundTrip: boolean = true
): EmissionsResult {
  // Determine flight type
  const flightType = determineFlightType(distance);

  // Apply route correction based on flight type
  const adjustedDistance = applyRouteCorrection(distance, flightType);

  // Get emissions adjustment factor for this flight type
  const emissionsAdjustment = getEmissionsAdjustment(flightType);

  // Calculate emissions per km for this flight
  const emissionsPerKm = CALIBRATED_EMISSIONS_FACTOR * emissionsAdjustment;

  // Calculate one-way emissions
  let totalEmissions = adjustedDistance * emissionsPerKm;

  // Account for round trip if needed
  const finalDistance = isRoundTrip ? distance * 2 : distance;
  const finalAdjustedDistance = isRoundTrip ? adjustedDistance * 2 : adjustedDistance;

  if (isRoundTrip) {
    totalEmissions *= 2;
  }

  return {
    totalEmissions,
    distanceKm: finalDistance,
    adjustedDistance: finalAdjustedDistance,
    flightType,
    emissionsPerKm,
    isRoundTrip
  };
}

/**
 * Calculate emissions between two airports
 */
export function calculateEmissionsBetweenAirports(
  homeAirport: Airport,
  awayAirport: Airport,
  isRoundTrip: boolean = true
): EmissionsResult {
  // Calculate distance between airports
  const distance = calculateDistance(
    homeAirport.latitude,
    homeAirport.longitude,
    awayAirport.latitude,
    awayAirport.longitude
  );

  // Calculate emissions
  return calculateSportsEmissions(distance, isRoundTrip);
}

/**
 * Calculate great circle distance between coordinates
 */
export function greatCircleDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Returns one-way distance in kilometers
}

/**
 * Calculate distance between coordinates
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return greatCircleDistance(lat1, lon1, lat2, lon2);
}

/**
 * Get flight statistics breakdown
 */
export function getFlightStatistics(distance: number, isRoundTrip: boolean = true): any {
  const result = calculateSportsEmissions(distance, isRoundTrip);
  const flightType = result.flightType;

  // Different statistics based on flight type
  if (flightType === "Derby Match") {
    return {
      transportMode: "Team Bus",
      fuelType: "Diesel",
      emissionsSource: "Ground Transportation",
      efficiency: "High",
      distanceNote: "Short distance, ground transport only"
    };
  }

  return {
    transportMode: "Charter Aircraft",
    aircraftType: flightType === "Short Flight" ? "Regional Jet" :
                 (flightType === "Medium Flight" ? "Narrow-body Jet" : "Wide-body Jet"),
    fuelBurn: flightType === "Short Flight" ? "High per km" :
             (flightType === "Medium Flight" ? "Medium per km" : "Low per km"),
    routeInefficiency: `${Math.round((ROUTE_INEFFICIENCY[flightType.toLowerCase().split(" ")[0] as keyof typeof ROUTE_INEFFICIENCY] - 1) * 100)}%`,
    typicalTeamSize: "35-40 passengers",
    extraEquipment: "2-3 tons of sports equipment"
  };
}
