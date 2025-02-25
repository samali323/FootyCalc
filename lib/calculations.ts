// Function to calculate distance between two points using the Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

// Function to calculate flight emissions
export function calculateFlightEmissions(
  distance: number,
  passengers: number,
  isRoundTrip: boolean,
): {
  totalEmissions: number
  perPassengerEmissions: number
  distanceMultiplier: number
} {
  // Base emission factor for aviation (kg CO2 per passenger per km)
  const baseEmissionFactor = 0.115

  // Distance multiplier based on flight length
  let distanceMultiplier = 1.0
  if (distance < 1000) {
    // Short-haul flights have higher per-km emissions due to takeoff/landing
    distanceMultiplier = 1.2
  } else if (distance > 3700) {
    // Long-haul flights are more efficient per km
    distanceMultiplier = 0.8
  }

  // Calculate emissions per passenger
  const perPassengerEmissions = distance * baseEmissionFactor * distanceMultiplier

  // Calculate total emissions for all passengers
  let totalEmissions = perPassengerEmissions * passengers

  // Double the emissions if it's a round trip
  if (isRoundTrip) {
    totalEmissions *= 2
  }

  // Convert to metric tons
  totalEmissions = totalEmissions / 1000

  return {
    totalEmissions,
    perPassengerEmissions: perPassengerEmissions / 1000, // Convert to metric tons
    distanceMultiplier,
  }
}

// Helper function to convert degrees to radians
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

