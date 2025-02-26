import { Airport } from "./types";

// Constants for the calculator
const GCD_CORRECTIONS = {
short: { threshold: 550, correction: 50 },    // < 550 km
medium: { threshold: 5500, correction: 100 }, // 550-5500 km
long: { threshold: Infinity, correction: 125 } // > 5500 km
};

// Standard masses
const PASSENGER_MASS = 100; // kg per passenger including baggage
const EQUIPMENT_MASS = 50;  // kg per seat equipment weight

// Route group load factors
const ROUTE_GROUPS = {
INTRA_EUROPE: {
passengerLoadFactor: 0.823,
passengerToCargoFactor: 0.9612,
},
DOMESTIC: {
passengerLoadFactor: 0.791,
passengerToCargoFactor: 0.9335,
}
};

// Cabin class factors
const CABIN_FACTORS = {
economy: {
abreastRatio: 1.0,
pitch: 32,
yseatFactor: 1.0
},
business: {
abreastRatio: 2.0,
pitch: 48,
yseatFactor: 2.0
}
};

// ICAO fuel consumption data by aircraft type and distance (in kg)
const FUEL_CONSUMPTION = {
"A320": {
125: 1672, 250: 3430, 500: 4585, 750: 6212,
1000: 7772, 1500: 10766, 2000: 13648, 2500: 16452
},
"B737": {
125: 1695, 250: 3439, 500: 4515, 750: 6053,
1000: 7517, 1500: 10304, 2000: 12964, 2500: 15537
}
};

export interface IcaoEmissionsResult {
totalEmissions: number;       // Total emissions in metric tons
perPassenger: number;         // Per passenger emissions in metric tons
distanceKm: number;           // Original distance in km
correctedDistanceKm: number;  // Distance after GCD correction
fuelConsumption: number;      // Fuel consumption in kg
flightType: string;           // "Short", "Medium", or "Long"
isRoundTrip: boolean;         // Whether this is a round trip
}

/**
* Apply ICAO GCD correction based on distance
*/
function applyGcdCorrection(distanceKm: number): number {
  for (const category of ["short", "medium", "long"] as const) {
    if (distanceKm <= GCD_CORRECTIONS[category].threshold) {
      return distanceKm + GCD_CORRECTIONS[category].correction;
    }
  }
  return distanceKm + GCD_CORRECTIONS.long.correction;
}

/**
 * Determine flight type based on distance
 */
export function determineFlightType(distanceKm: number): string {
  if (distanceKm < 800) {
    return "Short";
  } else if (distanceKm < 4800) {
    return "Medium";
  } else {
    return "Long";
  }
}

/**
 * Interpolate fuel consumption for given distance using ICAO fuel tables
 */
function interpolateFuelConsumption(aircraft: string, distanceNm: number): number {
  const aircraftData = FUEL_CONSUMPTION[aircraft as keyof typeof FUEL_CONSUMPTION] || FUEL_CONSUMPTION.A320;
  const distances = Object.keys(aircraftData).map(Number).sort((a, b) => a - b);

  // Handle edge cases
  if (distanceNm <= distances[0]) {
    return aircraftData[distances[0]];
  }
  if (distanceNm >= distances[distances.length - 1]) {
    return aircraftData[distances[distances.length - 1]];
  }

  // Find bracketing distances and interpolate
  for (let i = 0; i < distances.length - 1; i++) {
    if (distances[i] <= distanceNm && distanceNm <= distances[i + 1]) {
      const d1 = distances[i];
      const d2 = distances[i + 1];
      const f1 = aircraftData[d1];
      const f2 = aircraftData[d2];
      return f1 + (f2 - f1) * (distanceNm - d1) / (d2 - d1);
    }
  }

  // Fallback
  return aircraftData[distances[0]];
}

/**
 * Calculate flight emissions using ICAO methodology
 */
export function calculateIcaoEmissions(
  distance: number,
  passengers: number = 30,
  isRoundTrip: boolean = false,
  cabinClass: "economy" | "business" = "business",
  aircraftType: "A320" | "B737" = "A320",
  isDomestic: boolean = false
): IcaoEmissionsResult {
  // Handle derby matches (very short distances)
  if (distance < 15) {
    return {
      totalEmissions: 0,
      perPassenger: 0,
      distanceKm: distance,
      correctedDistanceKm: distance,
      fuelConsumption: 0,
      flightType: "Derby Match",
      isRoundTrip: false
    };
  }

  // For very short flights (<200km), use simplified calculation
  if (distance < 200) {
    let baseFuelConsumption: number;
    if (distance < 100) {
      baseFuelConsumption = distance * 3.5;
    } else {
      // Gradual scaling for distances between 100-200km
      baseFuelConsumption = distance * (3.5 + (distance - 100) * 0.02);
    }

    // Calculate emissions (CO2 factor = 3.16 kg CO2 per kg fuel)
    const emissions = baseFuelConsumption * 3.16;
    const totalEmissions = emissions * (isRoundTrip ? 2 : 1);

    return {
      totalEmissions: totalEmissions / 1000, // Convert to metric tons
      perPassenger: (totalEmissions / passengers) / 1000,
      distanceKm: distance,
      correctedDistanceKm: distance,
      fuelConsumption: baseFuelConsumption,
      flightType: "Short",
      isRoundTrip: isRoundTrip
    };
  }

  // Apply GCD correction for routing inefficiencies
  const correctedDistance = applyGcdCorrection(distance);

  // Get route factors based on domestic or international flight
  const routeFactors = isDomestic ? ROUTE_GROUPS.DOMESTIC : ROUTE_GROUPS.INTRA_EUROPE;
  const paxLoadFactor = routeFactors.passengerLoadFactor;
  const paxCargoFactor = routeFactors.passengerToCargoFactor;

  // Get cabin class factors
  const cabinInfo = CABIN_FACTORS[cabinClass];

  // Calculate Yseat factor using surface area method
  const surface = cabinInfo.abreastRatio * cabinInfo.pitch;
  const minSurface = CABIN_FACTORS.economy.abreastRatio * CABIN_FACTORS.economy.pitch;
  const yseatFactor = surface / minSurface;

  // Calculate passenger mass including equipment
  const paxMass = (passengers * PASSENGER_MASS + passengers * EQUIPMENT_MASS) / 1000; // Convert to tons

  // Standard cargo for football team (equipment, etc.)
  const cargoTons = 2.0;

  // Total mass including cargo
  const totalMass = paxMass + cargoTons;

  // Calculate passenger allocation factor
  const paxAllocation = paxMass / totalMass;

  // Calculate fuel consumption
  const fuelConsumption = interpolateFuelConsumption(
    aircraftType,
    correctedDistance / 1.852 // Convert km to nautical miles
  );

  // Calculate total occupied Yseat
  const totalSeats = passengers / paxLoadFactor;
  const totalYseat = totalSeats * yseatFactor;
  const occupiedYseat = totalYseat * paxLoadFactor;

  // Calculate CO2 per passenger using ICAO formula (CO2 factor = 3.16)
  const co2PerPax = ((fuelConsumption * paxCargoFactor * paxAllocation) /
                   occupiedYseat) * yseatFactor * 3.16;

  // Calculate total flight emissions for one way
  let totalEmissions = co2PerPax * passengers;

  // Prepare result with one-way values
  let result: IcaoEmissionsResult = {
    totalEmissions: totalEmissions / 1000, // Convert kg to metric tons
    perPassenger: co2PerPax / 1000, // Convert kg to metric tons
    distanceKm: distance,
    correctedDistanceKm: correctedDistance,
    fuelConsumption: fuelConsumption,
    flightType: determineFlightType(distance),
    isRoundTrip: isRoundTrip
  };

  // Adjust for round trip if needed
  if (isRoundTrip) {
    result.totalEmissions *= 2;
    result.perPassenger *= 2;
    result.distanceKm *= 2;
    result.correctedDistanceKm *= 2;
    result.fuelConsumption *= 2;
  }

  return result;
}

/**
 * Calculate ICAO emissions between two airports
 */
export function calculateEmissionsBetweenAirports(
  homeAirport: Airport,
  awayAirport: Airport,
  passengers: number = 30,
  isRoundTrip: boolean = true
): IcaoEmissionsResult {
  // Use the existing distance calculation from calculations.ts
  const distance = calculateDistance(
    homeAirport.latitude,
    homeAirport.longitude,
    awayAirport.latitude,
    awayAirport.longitude
  );

  // Check if it's a domestic flight (simple check - could be improved with country data)
  const isDomestic = homeAirport.country === awayAirport.country;

  // Calculate using ICAO methodology
  return calculateIcaoEmissions(
    distance,
    passengers,
    isRoundTrip,
    "business", // Default cabin class for sports teams
    "A320",     // Default aircraft type
    isDomestic
  );
}

// Great Circle Distance calculation (one-way)
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

// Vincenty formula (one-way)
export function vincentyDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const a = 6378137 // Earth's semi-major axis in meters
  const b = 6356752.314245 // Earth's semi-minor axis in meters
  const f = 1 / 298.257223563 // Flattening
  const L = ((lon2 - lon1) * Math.PI) / 180
  const U1 = Math.atan((1 - f) * Math.tan((lat1 * Math.PI) / 180))
  const U2 = Math.atan((1 - f) * Math.tan((lat2 * Math.PI) / 180))
  const sinU1 = Math.sin(U1)
  const cosU1 = Math.cos(U1)
  const sinU2 = Math.sin(U2)
  const cosU2 = Math.cos(U2)
  let lambda = L
  let lambdaP = 2 * Math.PI
  let iterLimit = 100
  let sinLambda = 0
  let cosLambda = 0
  let sinSigma = 0
  let cosSigma = 0
  let sigma = 0
  let sinAlpha = 0
  let cosSqAlpha = 0
  let cos2SigmaM = 0
  let C = 0
  while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0) {
    sinLambda = Math.sin(lambda)
    cosLambda = Math.cos(lambda)
    sinSigma = Math.sqrt(
      cosU2 * sinLambda * (cosU2 * sinLambda) +
        (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda),
)
if (sinSigma == 0) return 0
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda
    sigma = Math.atan2(sinSigma, cosSigma)
    sinAlpha = (cosU1 * cosU2 * sinLambda) / sinSigma
    cosSqAlpha = 1 - sinAlpha * sinAlpha
    cos2SigmaM = cosSigma - (2 * sinU1 * sinU2) / cosSqAlpha
    if (isNaN(cos2SigmaM)) cos2SigmaM = 0
    C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha))
    lambdaP = lambda
    lambda =
      L +
      (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)))
  }
  if (iterLimit == 0) return Number.NaN
  const uSq = (cosSqAlpha * (a * a - b * b)) / (b * b)
  const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)))
  const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)))
  const deltaSigma =
    B *
    sinSigma *
    (cos2SigmaM +
      (B / 4) *
        (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
          (B / 6) * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)))
  const distance = b * A * (sigma - deltaSigma)
  return distance / 1000 // Returns one-way distance in kilometers
}

// Calculate base distance (one-way)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const vincentyDist = vincentyDistance(lat1, lon1, lat2, lon2)
  const gcdDist = greatCircleDistance(lat1, lon1, lat2, lon2)
  // Average of both methods (one-way)
  return (vincentyDist + gcdDist) / 2
}

// Helper function to convert the new ICAO result to match the legacy format if needed
export function convertToLegacyEmissions(result: IcaoEmissionsResult): number {
  return result.totalEmissions;
}
