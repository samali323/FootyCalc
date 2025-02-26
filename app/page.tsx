"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Calendar, Plane } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { BarChart, LineChart } from "@/components/charts"
import { supabase } from "@/lib/supabase/client"
import type { Match, League, Airport } from "@/lib/types"
import {
  calculateTotalEmissions,
  calculateEmissionsByTeam,
  calculateEmissionsByLeague
} from "@/lib/emissionsHelper"
import { calculateDistance } from "@/lib/icaoCalculations"

export default function Home() {
  const [selectedLeague, setSelectedLeague] = useState<string>("all")
  const [isRoundTrip, setIsRoundTrip] = useState(false) // Default to one-way trips
  const [passengers, setPassengers] = useState(35)
  const [stats, setStats] = useState({
    leagues: 0,
    teams: 0,
    matches: 0,
    totalEmissions: 0,
  })
  const [matches, setMatches] = useState<Match[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [leagueNames, setLeagueNames] = useState<Record<string, string>>({})
  const [airportsMap, setAirportsMap] = useState<Record<string, Airport>>({})
  const [emissionsData, setEmissionsData] = useState<any[]>([])

  const currentSeason = "2024-2025"

  // Fetch all airports and create a map by team_id
  const fetchAirports = useCallback(async () => {
    const { data: airportsData, error } = await supabase
      .from("airports")
      .select("*")

    if (error) {
      console.error("Error fetching airports:", error)
      return
    }

    if (airportsData) {
      const airportsById: Record<string, Airport> = {}
      airportsData.forEach(airport => {
        airportsById[airport.team_id] = airport
      })
      setAirportsMap(airportsById)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    // Get counts in parallel
    const [leaguesCount, teamsCount] = await Promise.all([
      supabase.from("leagues").select("league_id", { count: "exact" }),
      supabase.from("teams").select("team_id", { count: "exact" }),
    ])

    // Get league season data with filtering
    let leagueSeasonsQuery = supabase.from("league_seasons").select("total_matches").eq("season_id", currentSeason)

    if (selectedLeague !== "all") {
      leagueSeasonsQuery = leagueSeasonsQuery.eq("league_id", selectedLeague)
    }

    const { data: leagueSeasons } = await leagueSeasonsQuery

    // Calculate total matches from league_seasons
    const totalMatches = leagueSeasons?.reduce((sum, ls) => sum + (ls.total_matches || 0), 0) || 0

    // Get matches for emissions calculation
    let matchesQuery = supabase
      .from("matches")
      .select(`
        *,
        home_team_id,
        away_team_id
      `)
      .eq("season_id", currentSeason)

    if (selectedLeague !== "all") {
      matchesQuery = matchesQuery.eq("league_id", selectedLeague)
    }

    const { data: matchesData } = await matchesQuery

    // Calculate total emissions using the new helper
    let totalEmissions = 0
    if (matchesData && Object.keys(airportsMap).length > 0) {
      totalEmissions = calculateTotalEmissions(
        matchesData,
        airportsMap,
        passengers,
        isRoundTrip
      )
    }

    setStats({
      leagues: leaguesCount.count || 0,
      teams: teamsCount.count || 0,
      matches: totalMatches,
      totalEmissions: Math.round(totalEmissions),
    })
  }, [selectedLeague, airportsMap, passengers, isRoundTrip])

  const fetchMatches = useCallback(async () => {
    let matchesQuery = supabase
      .from("matches")
      .select(`
        *,
        league_seasons!inner (
          league_id,
          leagues (
            name
          )
        ),
        home_team_id,
        away_team_id,
        home_team,
        away_team
      `)
      .eq("season_id", currentSeason)
      .order("date", { ascending: true })

    if (selectedLeague !== "all") {
      matchesQuery = matchesQuery.eq("league_id", selectedLeague)
    }

    const { data: matchesData, error: matchesError } = await matchesQuery
    if (matchesError) {
      console.error("Error fetching matches:", matchesError)
      return
    }

    if (matchesData) {
      // Process matches with emissions data
      const matchesWithEmissions = matchesData.map((match) => {
        const homeAirport = airportsMap[match.home_team_id];
        const awayAirport = airportsMap[match.away_team_id];

        let emissions = 0;
        if (homeAirport && awayAirport) {
          // Use our helper function to calculate emissions
          emissions = calculateMatchEmissions(
            match,
            homeAirport,
            awayAirport,
            passengers,
            isRoundTrip
          );
        }

        return {
          ...match,
          match_emissions: [{ emissions }],
        }
      })

      setMatches(matchesWithEmissions)
    } else {
      setMatches([])
    }
  }, [selectedLeague, airportsMap, passengers, isRoundTrip])

  const fetchEmissionsData = useCallback(async () => {
    let query = supabase
      .from("matches")
      .select(`
        match_id,
        league_id,
        date,
        home_team_id,
        away_team_id,
        home_team,
        away_team,
        league_seasons!inner (
          league_id,
          leagues (
            name
          )
        )
      `)
      .eq("season_id", currentSeason)

    if (selectedLeague !== "all") {
      query = query.eq("league_id", selectedLeague)
    }

    const { data: matchesData, error: matchesError } = await query
    if (matchesError) {
      console.error("Error fetching matches:", matchesError)
      return
    }

    if (matchesData && matchesData.length > 0) {
      // Prepare league names map for emissions calculation
      const leagueNamesMap: Record<string, string> = {};
      matchesData.forEach(match => {
        if (match.league_seasons?.leagues?.name && match.league_id) {
          leagueNamesMap[match.league_id] = match.league_seasons.leagues.name;
        }
      });
      setLeagueNames(leagueNamesMap);

      // If showing all leagues, group by league
      if (selectedLeague === "all") {
        // Use helper to calculate emissions by league
        const leagueEmissions = calculateEmissionsByLeague(
          matchesData,
          airportsMap,
          leagueNamesMap,
          passengers,
          isRoundTrip
        );

        setEmissionsData(
          Object.values(leagueEmissions)
            .map(({ name, emissions }) => ({
              label: name,
              value: emissions,
            }))
            .sort((a, b) => b.value - a.value)
        );
      } else {
        // Show top 5 teams in the selected league
        const teamEmissions = calculateEmissionsByTeam(
          matchesData,
          airportsMap,
          passengers,
          isRoundTrip
        );

        setEmissionsData(
          Object.values(teamEmissions)
            .map(({ name, emissions }) => ({
              label: name,
              value: emissions,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
        );
      }
    } else {
      setEmissionsData([])
    }
  }, [selectedLeague, airportsMap, passengers, isRoundTrip])

  const fetchLeagues = useCallback(async () => {
    const { data, error } = await supabase.from("leagues").select("*")
    if (error) {
      console.error("Error fetching leagues:", error)
      return
    }
    if (data) {
      setLeagues(data)
    }
  }, [])

  useEffect(() => {
    fetchLeagues()
    fetchAirports()
  }, [fetchLeagues, fetchAirports])

  useEffect(() => {
    if (Object.keys(airportsMap).length > 0) {
      Promise.all([fetchStats(), fetchMatches(), fetchEmissionsData()])
    }
  }, [selectedLeague, fetchStats, fetchMatches, fetchEmissionsData, airportsMap, passengers, isRoundTrip])

  // Helper function for calculating emissions for a single match
  function calculateMatchEmissions(
    match: Match,
    homeAirport: Airport,
    awayAirport: Airport,
    passengers: number,
    isRoundTrip: boolean
  ): number {
    // Use our emissionsHelper function
    return calculateTotalEmissions(
      [match],
      { [match.home_team_id]: homeAirport, [match.away_team_id]: awayAirport },
      passengers,
      isRoundTrip
    );
  }

  return (
    <div className="p-6 lg:ml-64">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-4 items-center">
          <Select value={selectedLeague} onValueChange={setSelectedLeague}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select League" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              {leagues.map((league) => (
                <SelectItem key={league.league_id} value={league.league_id}>
                  {league.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch id="dashboard-round-trip" checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
            <Label htmlFor="dashboard-round-trip">Include Return Flights</Label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leagues}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Season Matches</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.matches}</div>
            <p className="text-xs text-muted-foreground">{currentSeason} Season</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmissions.toLocaleString()} tonnes</div>
            <p className="text-xs text-muted-foreground">
              {currentSeason} Season
              {isRoundTrip ? " (including return flights)" : " (one-way flights)"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{selectedLeague === "all" ? "Emissions by League" : "Top 5 Teams by Emissions"}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={emissionsData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Emissions Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={matches} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
