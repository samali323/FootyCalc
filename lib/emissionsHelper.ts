import { Match, Airport } from "./types";
import { calculateEmissionsBetweenAirports } from "./icaoCalculations";

/**
* Calculate emissions for a match using ICAO methodology
*/
export function calculateMatchEmissions(
  match: Match,
  homeAirport: Airport | null,
  awayAirport: Airport | null,
  passengers: number = 35,
  isRoundTrip: boolean = true
): number {
  // If we don't have both airports, return 0
  if (!homeAirport || !awayAirport) {
    return 0;
  }

  // Calculate emissions using ICAO methodology
  const result = calculateEmissionsBetweenAirports(
    homeAirport,
    awayAirport,
    passengers,
    isRoundTrip
  );

  return result.totalEmissions;
}

/**
 * Calculate emissions for multiple matches
 */
export function calculateTotalEmissions(
  matches: Match[],
  airportsMap: Record<string, Airport>,
  passengers: number = 35,
  isRoundTrip: boolean = true
): number {
  let totalEmissions = 0;

  for (const match of matches) {
    // Skip if we don't have team IDs
    if (!match.home_team_id || !match.away_team_id) {
      continue;
    }

    const homeAirport = airportsMap[match.home_team_id];
    const awayAirport = airportsMap[match.away_team_id];

    if (homeAirport && awayAirport) {
      totalEmissions += calculateMatchEmissions(
        match,
        homeAirport,
        awayAirport,
        passengers,
        isRoundTrip
      );
    }
  }

  return totalEmissions;
}

/**
 * Calculate emissions by team
 */
export function calculateEmissionsByTeam(
  matches: Match[],
  airportsMap: Record<string, Airport>,
  passengers: number = 35,
  isRoundTrip: boolean = true
): Record<string, { name: string; emissions: number }> {
  const teamEmissions: Record<string, { name: string; emissions: number }> = {};

  for (const match of matches) {
    // Skip if we don't have team IDs or names
    if (!match.home_team_id || !match.away_team_id || !match.home_team || !match.away_team) {
      continue;
    }

    const homeAirport = airportsMap[match.home_team_id];
    const awayAirport = airportsMap[match.away_team_id];

    if (homeAirport && awayAirport) {
      const matchEmissions = calculateMatchEmissions(
        match,
        homeAirport,
        awayAirport,
        passengers,
        isRoundTrip
      );

      // Add emissions to both home and away teams (split equally)
      if (!teamEmissions[match.home_team_id]) {
        teamEmissions[match.home_team_id] = { name: match.home_team, emissions: 0 };
      }
      if (!teamEmissions[match.away_team_id]) {
        teamEmissions[match.away_team_id] = { name: match.away_team, emissions: 0 };
      }

      teamEmissions[match.home_team_id].emissions += matchEmissions / 2;
      teamEmissions[match.away_team_id].emissions += matchEmissions / 2;
    }
  }

  return teamEmissions;
}

/**
 * Calculate emissions by league
 */
export function calculateEmissionsByLeague(
  matches: Match[],
  airportsMap: Record<string, Airport>,
  leagueNames: Record<string, string>, // Map of league_id to league name
  passengers: number = 35,
  isRoundTrip: boolean = true
): Record<string, { name: string; emissions: number }> {
  const leagueEmissions: Record<string, { name: string; emissions: number }> = {};

  for (const match of matches) {
    // Skip if we don't have league ID
    if (!match.league_id || !match.home_team_id || !match.away_team_id) {
      continue;
    }

    const homeAirport = airportsMap[match.home_team_id];
    const awayAirport = airportsMap[match.away_team_id];

    if (homeAirport && awayAirport) {
      const matchEmissions = calculateMatchEmissions(
        match,
        homeAirport,
        awayAirport,
        passengers,
        isRoundTrip
      );

      const leagueName = leagueNames[match.league_id] || match.league_id;

      // Add emissions to the league
      if (!leagueEmissions[match.league_id]) {
        leagueEmissions[match.league_id] = { name: leagueName, emissions: 0 };
      }

      leagueEmissions[match.league_id].emissions += matchEmissions;
    }
  }

  return leagueEmissions;
}
