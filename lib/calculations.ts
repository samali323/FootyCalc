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

// Simple ICAO emissions calculation (one-way)
export function calculateEmissions(distanceKm: number, passengers = 35): number {
  // ICAO methodology components
  const kgCO2PerKmPerPerson = 0.115 // Average for medium-haul flights
  const ltoEmissions = 2400 // Landing and Take-off emissions in kg CO2
  // Calculate one-way emissions
  const cruiseEmissions = distanceKm * kgCO2PerKmPerPerson * passengers
  const totalEmissions = cruiseEmissions + ltoEmissions
  // Convert to tonnes
  return totalEmissions / 1000
}

// Advanced ICAO-based flight emissions calculator
export function calculateFlightEmissions(
  distanceKm: number,
  passengers: number = 30,
  isRoundTrip: boolean = false,
  cabinClass: string = "business",
  aircraftType: string = "A320"
): { 
  totalEmissions: number;
  perPassenger: number;
  distanceKm: number;
  fuelConsumption: number;
  flightType: string;
} {
  // GCD correction factors based on distance
  const gcdCorrections = {
    short: { threshold: 550, correction: 50 },
    medium: { threshold: 5500, correction: 100 },
    long: { threshold: Number.POSITIVE_INFINITY, correction: 125 }
  };

  // Cabin class factors
  const cabinFactors = {
    economy: { abreastRatio: 1.0, pitch: 32, yseatFactor: 1.0 },
    premium_economy: { abreastRatio: 1.2, pitch: 38, yseatFactor: 1.5 },
    business: { abreastRatio: 2.0, pitch: 48, yseatFactor: 2.0 },
    first: { abreastRatio: 2.2, pitch: 60, yseatFactor: 2.4 }
  };

  // Route load factors
  const routeFactors = {
    passengerLoadFactor: 0.82,
    passengerToCargoFactor: 0.96
  };

  // Fuel consumption data for different aircraft types
  const fuelConsumption: Record<string, Record<number, number>> = {
    "A320": {
      125: 1672, 250: 3430, 500: 4585, 750: 6212,
      1000: 7772, 1500: 10766, 2000: 13648, 2500: 16452
    },
    "B737": {
      125: 1695, 250: 3439, 500: 4515, 750: 6053,
      1000: 7517, 1500: 10304, 2000: 12964, 2500: 15537
    }
  };

  // Handle short distances (less than 200km)
  if (distanceKm < 200) {
    let baseFuelConsumption: number;
    if (distanceKm < 100) {
      baseFuelConsumption = distanceKm * 3.5;
    } else {
      // Gradual scaling for distances between 100-200km
      baseFuelConsumption = distanceKm * (3.5 + (distanceKm - 100) * 0.02);
    }
    
    // Calculate emissions
    const emissions = baseFuelConsumption * 3.16;
    const totalEmissions = emissions * (isRoundTrip ? 2 : 1);
    
    return {
      totalEmissions: totalEmissions / 1000, // Convert to metric tons
      perPassenger: (totalEmissions / passengers) / 1000,
      distanceKm: distanceKm * (isRoundTrip ? 2 : 1),
      fuelConsumption: baseFuelConsumption * (isRoundTrip ? 2 : 1),
      flightType: "Short"
    };
  }

  // Apply GCD correction
  let correctedDistance = distanceKm;
  for (const category in gcdCorrections) {
    if (distanceKm <= gcdCorrections[category as keyof typeof gcdCorrections].threshold) {
      correctedDistance = distanceKm + gcdCorrections[category as keyof typeof gcdCorrections].correction;
      break;
    }
  }

  // Get cabin class factors
  const cabinInfo = cabinFactors[cabinClass.toLowerCase() as keyof typeof cabinFactors] || cabinFactors.business;
  
  // Calculate Yseat factor using surface area
  const surface = cabinInfo.abreastRatio * cabinInfo.pitch;
  const minSurface = cabinFactors.economy.abreastRatio * cabinFactors.economy.pitch;
  const yseatFactor = surface / minSurface;

  // Interpolate fuel consumption
  const distanceNm = correctedDistance / 1.852; // Convert km to nautical miles
  const fuelData = fuelConsumption[aircraftType] || fuelConsumption.A320;
  
  // Find bracketing distances and interpolate
  const distances = Object.keys(fuelData).map(d => Number(d)).sort((a, b) => a - b);
  let totalFuel: number;
  
  if (distanceNm <= distances[0]) {
    totalFuel = fuelData[distances[0]];
  } else if (distanceNm >= distances[distances.length - 1]) {
    totalFuel = fuelData[distances[distances.length - 1]];
  } else {
    // Find bracketing distances
    let d1 = 0, d2 = 0, f1 = 0, f2 = 0;
    for (let i = 0; i < distances.length - 1; i++) {
      if (distances[i] <= distanceNm && distanceNm <= distances[i + 1]) {
        d1 = distances[i];
        d2 = distances[i + 1];
        f1 = fuelData[d1];
        f2 = fuelData[d2];
        break;
      }
    }
    totalFuel = f1 + (f2 - f1) * (distanceNm - d1) / (d2 - d1);
  }

  // Calculate total occupied Yseat
  const totalSeats = passengers / routeFactors.passengerLoadFactor;
  const totalYseat = totalSeats * yseatFactor;
  const occupiedYseat = totalYseat * routeFactors.passengerLoadFactor;

  // Calculate CO2 per passenger
  const co2PerPax = ((totalFuel * routeFactors.passengerToCargoFactor) / occupiedYseat) * yseatFactor * 3.16;

  // Calculate total emissions
  let totalEmissions = co2PerPax * passengers;
  
  // Apply round trip if needed
  if (isRoundTrip) {
    totalEmissions *= 2;
    correctedDistance *= 2;
    totalFuel *= 2;
  }
  
  // Determine flight type based on one-way distance
  let flightType: string;
  const oneWayDistance = distanceKm;
  if (oneWayDistance < 800) {
    flightType = "Short";
  } else if (oneWayDistance < 4800) {
    flightType = "Medium";
  } else {
    flightType = "Long";
  }

  return {
    totalEmissions: totalEmissions / 1000, // Convert to metric tons
    perPassenger: (co2PerPax * (isRoundTrip ? 2 : 1)) / 1000,
    distanceKm: correctedDistance,
    fuelConsumption: totalFuel,
    flightType: flightType
  };
}

// Calculate flight time in seconds
export function calculateFlightTime(distanceKm: number, isRoundTrip: boolean = false): number {
  // Constants for one leg of the journey
  const CRUISE_SPEED = 800;      // km/h
  const GROUND_OPS = 1800;       // 30 minutes total for taxi, takeoff, landing per leg
  const MIN_TIME = 1800;         // Minimum 30 minutes for very short flights

  // Calculate cruise time
  const cruiseTime = (distanceKm / CRUISE_SPEED) * 3600;  // Convert to seconds

  // Total time for one leg
  let oneLegTime = cruiseTime + GROUND_OPS;

  // Ensure minimum time
  oneLegTime = Math.max(oneLegTime, MIN_TIME);

  // Double for round trip
  if (isRoundTrip) {
    return Math.round(oneLegTime * 2);
  } else {
    return Math.round(oneLegTime);
  }
}

// Calculate environmental equivalencies
export function calculateEquivalencies(emissionsMtCO2: number): Record<string, number> {
  return {
    // Vehicle emissions
    gasoline_vehicles_year: emissionsMtCO2 / 0.233,  // Gasoline vehicles driven for one year
    electric_vehicles_year: emissionsMtCO2 / 0.883,  // Electric vehicles driven for one year
    gasoline_vehicle_miles: emissionsMtCO2 * 2547,   // Miles driven by gasoline vehicle

    // Fuel consumption
    gasoline_gallons: emissionsMtCO2 * 113,    // Gallons of gasoline
    diesel_gallons: emissionsMtCO2 * 98.2,     // Gallons of diesel
    propane_cylinders: emissionsMtCO2 * 45.9,  // Propane cylinders for BBQ
    oil_barrels: emissionsMtCO2 * 2.3,         // Barrels of oil

    // Home energy use
    homes_energy_year: emissionsMtCO2 / 0.134,    // Homes' energy use for one year
    homes_electricity_year: emissionsMtCO2 / 0.208, // Homes' electricity use for one year

    // Waste and recycling
    waste_tons_recycled: emissionsMtCO2 * 0.353,     // Tons of waste recycled
    garbage_trucks_recycled: emissionsMtCO2 * 0.05,  // Garbage trucks of waste recycled
    trash_bags_recycled: emissionsMtCO2 * 85,        // Trash bags of waste recycled

    // Carbon sequestration
    tree_seedlings_10years: emissionsMtCO2 * 16.5,  // Tree seedlings grown for 10 years
    forest_acres_year: emissionsMtCO2 * 1.0,        // Acres of U.S. forests in one year
    forest_preserved_acres: emissionsMtCO2 * 0.006, // Acres of U.S. forests preserved

    // Electronic devices
    smartphones_charged: emissionsMtCO2 * 80847    // Number of smartphones charged
  };
}
