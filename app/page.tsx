"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Calendar, Plane } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, LineChart } from "@/components/charts"
import { supabase } from "@/lib/supabase/client"
import type { Match, League } from "@/lib/types"
import { calculateDistance, calculateEmissions } from "@/lib/calculations"

export default function Home() {
  const [selectedLeague, setSelectedLeague] = useState<string>("all")
  const [stats, setStats] = useState({
    leagues: 0,
    teams: 0,
    matches: 0,
    totalEmissions: 0,
  })
  const [matches, setMatches] = useState<Match[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [emissionsData, setEmissionsData] = useState<any[]>([])

  const currentSeason = "2024-2025"

  const fetchStats = useCallback(async () => {
    // Get counts and matches in parallel
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

    // Fetch all matches with their team and airport information
    let matchesQuery = supabase
      .from("matches")
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(
          team_id,
          home_airport:airports(latitude, longitude)
        ),
        away_team:teams!matches_away_team_id_fkey(
          team_id,
          away_airport:airports(latitude, longitude)
        )
      `)
      .eq("season_id", currentSeason)

    if (selectedLeague !== "all") {
      matchesQuery = matchesQuery.eq("league_id", selectedLeague)
    }

    const { data: matchesData } = await matchesQuery

    // Calculate total emissions for all matches
    let totalEmissions = 0

    if (matchesData) {
      totalEmissions = matchesData.reduce((sum, match) => {
        const homeAirport = match.home_team?.home_airport?.[0]
        const awayAirport = match.away_team?.away_airport?.[0]

        if (homeAirport && awayAirport) {
          const distance = calculateDistance(
            homeAirport.latitude,
            homeAirport.longitude,
            awayAirport.latitude,
            awayAirport.longitude,
          )
          // Calculate round-trip emissions
          const emissions = calculateEmissions(distance) * 2 // Multiply by 2 for round trip
          return sum + emissions
        }
        return sum
      }, 0)
    }

    setStats({
      leagues: leaguesCount.count || 0,
      teams: teamsCount.count || 0,
      matches: totalMatches,
      totalEmissions: Math.round(totalEmissions),
    })
  }, [selectedLeague])

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
        home_team:teams!matches_home_team_id_fkey(
          team_id,
          home_airport:airports(latitude, longitude)
        ),
        away_team:teams!matches_away_team_id_fkey(
          team_id,
          away_airport:airports(latitude, longitude)
        )
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
      // Calculate emissions for each match
      const matchesWithEmissions = matchesData.map((match) => {
        const homeAirport = match.home_team?.home_airport?.[0]
        const awayAirport = match.away_team?.away_airport?.[0]

        let emissions = 0
        if (homeAirport && awayAirport) {
          const distance = calculateDistance(
            homeAirport.latitude,
            homeAirport.longitude,
            awayAirport.latitude,
            awayAirport.longitude,
          )
          emissions = calculateEmissions(distance) * 2 // Round trip
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
  }, [selectedLeague])

  const fetchEmissionsData = useCallback(async () => {
    let query = supabase
      .from("matches")
      .select(`
        match_id,
        league_id,
        date,
        league_seasons!inner (
          league_id,
          leagues (
            name
          )
        ),
        home_team:teams!matches_home_team_id_fkey(
          team_id,
          name,
          home_airport:airports(latitude, longitude)
        ),
        away_team:teams!matches_away_team_id_fkey(
          team_id,
          name,
          away_airport:airports(latitude, longitude)
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
      // Calculate emissions for each team
      const teamEmissions: Record<string, { name: string; emissions: number }> = {}

      matchesData.forEach((match) => {
        const homeAirport = match.home_team?.home_airport?.[0]
        const awayAirport = match.away_team?.away_airport?.[0]

        if (homeAirport && awayAirport) {
          const distance = calculateDistance(
            homeAirport.latitude,
            homeAirport.longitude,
            awayAirport.latitude,
            awayAirport.longitude,
          )
          const emissions = calculateEmissions(distance) * 2 // Round trip

          // Add emissions to both teams
          const homeTeamName = match.home_team?.name || "Unknown Team"
          const awayTeamName = match.away_team?.name || "Unknown Team"

          if (!teamEmissions[homeTeamName]) {
            teamEmissions[homeTeamName] = { name: homeTeamName, emissions: 0 }
          }
          if (!teamEmissions[awayTeamName]) {
            teamEmissions[awayTeamName] = { name: awayTeamName, emissions: 0 }
          }

          teamEmissions[homeTeamName].emissions += emissions / 2 // Split emissions between teams
          teamEmissions[awayTeamName].emissions += emissions / 2
        }
      })

      // Convert to array and sort by emissions
      const sortedTeams = Object.values(teamEmissions)
        .sort((a, b) => b.emissions - a.emissions)
        .slice(0, 5) // Take top 5

      // If we're showing all leagues, group by league instead
      if (selectedLeague === "all") {
        const emissionsByLeague = matchesData.reduce(
          (acc, match) => {
            const leagueName = match.league_seasons?.leagues?.name || match.league_id
            const homeAirport = match.home_team?.home_airport?.[0]
            const awayAirport = match.away_team?.away_airport?.[0]

            if (homeAirport && awayAirport) {
              const distance = calculateDistance(
                homeAirport.latitude,
                homeAirport.longitude,
                awayAirport.latitude,
                awayAirport.longitude,
              )
              const emissions = calculateEmissions(distance) * 2 // Round trip
              acc[leagueName] = (acc[leagueName] || 0) + emissions
            }
            return acc
          },
          {} as Record<string, number>,
        )

        setEmissionsData(
          Object.entries(emissionsByLeague)
            .map(([league, emissions]) => ({
              label: league,
              value: emissions,
            }))
            .sort((a, b) => b.value - a.value),
        )
      } else {
        // Show top 5 teams in the selected league
        setEmissionsData(
          sortedTeams.map((team) => ({
            label: team.name,
            value: team.emissions,
          })),
        )
      }
    } else {
      setEmissionsData([])
    }
  }, [selectedLeague])

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
  }, [fetchLeagues])

  useEffect(() => {
    Promise.all([fetchStats(), fetchMatches(), fetchEmissionsData()])
  }, [selectedLeague, fetchStats, fetchMatches, fetchEmissionsData])

  return (
    <div className="p-6 lg:ml-64">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="flex gap-4">
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
            <p className="text-xs text-muted-foreground">{currentSeason} Season</p>
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

