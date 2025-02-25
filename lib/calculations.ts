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

// ICAO emissions calculation (one-way)
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

