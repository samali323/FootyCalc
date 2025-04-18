"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Trophy, Users, Calendar, Plane, ArrowUp, ArrowDown,
  PieChart, BarChart3, LineChart as LineChartIcon,
  Calendar as CalendarIcon, MapPin, Settings, Info
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart, LineChart } from "@/components/charts"
import { supabase } from "@/lib/supabase/client"
import type { Match, League, Airport, EmissionsResult } from "@/lib/types"
import {
  calculateTotalEmissions,
  calculateEmissionsByTeam,
  calculateEmissionsByLeague
} from "@/lib/emissionsHelper"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { CardDescription } from "@/components/ui/card-description"

// Import the calculation functions from the shared library
import { calculateEmissionsBetweenAirports, getFlightStatistics } from "@/lib/icaoCalculations"
import { Skeleton } from "@/components/ui/skeleton"
// Skeleton loaders components
const CardSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <Skeleton className="h-5 w-1/3" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-1/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardContent>
  </Card>
)

const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/3 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="h-80">
      <div className="flex items-center justify-center h-full">
        <Skeleton className="h-full w-full rounded-md" />
      </div>
    </CardContent>
  </Card>
)

const TableSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-10 w-[300px]" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-[15%]" />
          <Skeleton className="h-4 w-[25%]" />
          <Skeleton className="h-4 w-[15%]" />
          <Skeleton className="h-4 w-[15%]" />
          <Skeleton className="h-4 w-[15%]" />
          <Skeleton className="h-4 w-[15%]" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-8 w-[15%]" />
            <Skeleton className="h-8 w-[25%]" />
            <Skeleton className="h-8 w-[15%]" />
            <Skeleton className="h-8 w-[15%]" />
            <Skeleton className="h-8 w-[15%]" />
            <Skeleton className="h-8 w-[15%]" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)
export default function Home() {
  const [selectedLeague, setSelectedLeague] = useState<string>("all")
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  const [passengers, setPassengers] = useState(35)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() })
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const [seasons, setSeasons] = useState<{ season_id: string }[]>([])
  const [stats, setStats] = useState({
    leagues: 0,
    teams: 0,
    matches: 0,
    totalEmissions: 0,
    emissionsChange: 0,
    emissionsReduction: 0,
    emissionsGoal: 5000,
    progress: 0
  })
  const [matches, setMatches] = useState<Match[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [leagueNames, setLeagueNames] = useState<Record<string, string>>({})
  const [airportsMap, setAirportsMap] = useState<Record<string, Airport>>({})
  const [emissionsData, setEmissionsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true)
  const [isMatchesLoading, setIsMatchesLoading] = useState<boolean>(true)
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalMatches, setTotalMatches] = useState(0)
  const [chartMatches, setChartMatches] = useState([])

  // Fetch all airports and create a map by team_id
  const fetchAirports = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: airportsData, error } = await supabase
        .from("airports")
        .select("*")

      if (error) {
        throw error
      }

      if (airportsData) {
        const airportsById: Record<string, Airport> = {}
        airportsData.forEach(airport => {
          airportsById[airport.team_id] = airport
        })
        setAirportsMap(airportsById)
      }
    } catch (error) {
      console.error("Error fetching airports:", error)
      toast.error("Failed to load airport data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchSeasons = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("seasons")
        .select("season_id")
        .order("season_id", { ascending: false })

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        setSeasons(data)
        // Set the most recent season as default if not already selected
        if (!selectedSeason) {
          setSelectedSeason(data[0].season_id)
        }
      }
    } catch (error) {
      console.error("Error fetching seasons:", error)
      toast.error("Failed to load season data")
    }
  }, [selectedSeason]) // This dependency is correct
  const fetchStats = useCallback(async () => {
    if (!selectedSeason) return;
    setIsStatsLoading(true)
    try {
      // Get counts in parallel
      const [leaguesCount, teamsCount] = await Promise.all([
        supabase.from("leagues").select("league_id", { count: "exact" }),
        supabase.from("teams").select("team_id", { count: "exact" }),
      ])

      // Get league season data with filtering
      let leagueSeasonsQuery = supabase.from("league_seasons").select("total_matches").eq("season_id", selectedSeason)

      if (selectedLeague !== "all") {
        leagueSeasonsQuery = leagueSeasonsQuery.eq("league_id", selectedLeague)
      }

      const { data: leagueSeasons } = await leagueSeasonsQuery

      // Calculate total matches from league_seasons
      const totalMatches = leagueSeasons?.reduce((sum, ls) => sum + (ls.total_matches || 0), 0) || 0

      // Get all matches using pagination
      let allMatchesData = []
      let page = 0
      const pageSize = 1000
      let hasMore = true

      // Build base query
      let baseMatchesQuery = supabase
        .from("matches")
        .select(`
        *,
        home_team_id,
        away_team_id
      `)
        .eq("season_id", selectedSeason)

      if (selectedLeague !== "all") {
        baseMatchesQuery = baseMatchesQuery.eq("league_id", selectedLeague)
      }

      // Paginate through all matches
      while (hasMore) {
        const { data: pageData, error } = await baseMatchesQuery
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) {
          console.error("Error fetching matches page:", error)
          break
        }

        if (pageData && pageData.length > 0) {
          allMatchesData = [...allMatchesData, ...pageData]
          // Check if we need to fetch more
          hasMore = pageData.length === pageSize
          page++
        } else {
          hasMore = false
        }
      }

      // console.log('Total matches fetched:', allMatchesData.length)

      // Calculate total emissions using the accurate method
      let totalEmissions = 0
      if (allMatchesData.length > 0 && Object.keys(airportsMap).length > 0) {
        // Calculate emissions for each match and sum them up
        allMatchesData.forEach(match => {
          const homeAirport = airportsMap[match.home_team_id]
          const awayAirport = airportsMap[match.away_team_id]

          if (homeAirport && awayAirport) {
            // Use the detailed emissions calculation from the other component
            const result = calculateEmissionsBetweenAirports(
              homeAirport,
              awayAirport,
              isRoundTrip
            )

            // Scale by number of passengers (team and staff)
            const matchEmissions = result.totalEmissions * passengers / 35 // Normalize if passenger count is different
            totalEmissions += matchEmissions
          }
        })
      }

      // Calculate emissions change based on historical data (could be replaced with real data)
      const previousEmissions = totalEmissions * (1 + (Math.random() > 0.5 ? 0.05 : -0.15))
      const emissionsChange = Math.round(((totalEmissions - previousEmissions) / previousEmissions) * 1000) / 10

      // Calculate emissions reduction and progress toward goal
      const emissionsReduction = Math.round(previousEmissions - totalEmissions)
      const progress = Math.min(100, Math.round((emissionsReduction / stats.emissionsGoal) * 100))

      setStats({
        leagues: leaguesCount.count || 0,
        teams: teamsCount.count || 0,
        matches: totalMatches,
        totalEmissions: Math.round(totalEmissions),
        emissionsChange: emissionsChange,
        emissionsReduction: Math.max(0, emissionsReduction), // Ensure it's not negative
        emissionsGoal: 5000,
        progress: progress,
        matchesProcessed: allMatchesData.length // Add this to track processed matches
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast.error("Failed to load statistics")
    } finally {
      setIsStatsLoading(false)
    }
  }, [selectedLeague, selectedSeason, airportsMap, passengers, isRoundTrip, stats.emissionsGoal])

  const fetchMatches = useCallback(async () => {
    if (!selectedSeason) return;
    setIsMatchesLoading(true)

    try {
      // First, get total count for pagination
      let countQuery = supabase
        .from("matches")
        .select("match_id", { count: "exact" })
        .eq("season_id", selectedSeason)

      if (selectedLeague !== "all") {
        countQuery = countQuery.eq("league_id", selectedLeague)
      }

      if (searchQuery) {
        countQuery = countQuery.or(`home_team.ilike.%${searchQuery}%,away_team.ilike.%${searchQuery}%`)
      }

      const { count } = await countQuery
      setTotalMatches(count || 0)

      // Then, fetch paginated data for the table
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
        .eq("season_id", selectedSeason)
        .order("date", { ascending: true })

      if (selectedLeague !== "all") {
        matchesQuery = matchesQuery.eq("league_id", selectedLeague)
      }

      if (searchQuery) {
        matchesQuery = matchesQuery.or(`home_team.ilike.%${searchQuery}%,away_team.ilike.%${searchQuery}%`)
      }

      // Add pagination
      matchesQuery = matchesQuery
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)

      const { data: matchesData, error: matchesError } = await matchesQuery

      if (matchesError) {
        throw matchesError
      }

      if (matchesData) {
        // Process matches with accurate emissions data
        const matchesWithEmissions = matchesData.map((match) => {
          const homeAirport = airportsMap[match.home_team_id]
          const awayAirport = airportsMap[match.away_team_id]

          let emissions = 0
          let distance = 0
          let flightStats = null

          if (homeAirport && awayAirport) {
            // Use the detailed emissions calculation 
            const result = calculateEmissionsBetweenAirports(
              homeAirport,
              awayAirport,
              isRoundTrip
            )

            distance = result.distanceKm
            emissions = result.totalEmissions * passengers / 35 // Scale by passenger count

            // Get additional flight statistics
            flightStats = getFlightStatistics(
              result.distanceKm / (isRoundTrip ? 2 : 1), // One-way distance for stats
              isRoundTrip
            )
          }

          return {
            ...match,
            distance,
            flightStats,
            match_emissions: [{ emissions, distance }],
          }
        })

        setMatches(matchesWithEmissions)
      } else {
        setMatches([])
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
      toast.error("Failed to load match data")
    } finally {
      setIsMatchesLoading(false)
    }
  }, [selectedLeague, selectedSeason, airportsMap, passengers, isRoundTrip, searchQuery, currentPage, pageSize])

  const fetchChartData = useCallback(async () => {
    if (!selectedSeason) return;
    setIsChartLoading(true)

    try {
      let chartDataQuery = supabase
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
        .eq("season_id", selectedSeason)
        .order("date", { ascending: true })

      if (selectedLeague !== "all") {
        chartDataQuery = chartDataQuery.eq("league_id", selectedLeague)
      }

      const { data: chartMatchesData, error: chartError } = await chartDataQuery

      if (chartError) {
        throw chartError
      }

      if (chartMatchesData) {
        // Process matches with emissions data for charts
        const processedData = chartMatchesData.map((match) => {
          const homeAirport = airportsMap[match.home_team_id]
          const awayAirport = airportsMap[match.away_team_id]

          let emissions = 0
          let distance = 0

          if (homeAirport && awayAirport) {
            const result = calculateEmissionsBetweenAirports(
              homeAirport,
              awayAirport,
              isRoundTrip
            )

            distance = result.distanceKm
            emissions = result.totalEmissions * passengers / 35
          }

          return {
            ...match,
            distance,
            match_emissions: [{ emissions, distance }],
          }
        })

        setChartMatches(processedData)
        return processedData
      }

      return []
    } catch (error) {
      console.error("Error fetching chart data:", error)
      toast.error("Failed to load chart data")
      return []
    } finally {
      setIsChartLoading(false)
    }
  }, [selectedLeague, selectedSeason, airportsMap, passengers, isRoundTrip])

  const fetchEmissionsData = useCallback(async () => {
    setIsChartLoading(true)

    try {
      // Get chart data for emissions calculations
      const chartData = await fetchChartData()

      if (chartData && chartData.length > 0) {
        // Prepare league names map for emissions calculation
        const leagueNamesMap: Record<string, string> = {}
        chartData.forEach(match => {
          if (match.league_seasons?.leagues?.name && match.league_id) {
            leagueNamesMap[match.league_id] = match.league_seasons.leagues.name
          }
        })
        setLeagueNames(leagueNamesMap)

        // If showing all leagues, group by league
        if (selectedLeague === "all") {
          // Create a map to store emissions by league
          const leagueEmissionsMap: Record<string, { name: string, emissions: number }> = {}

          // Calculate emissions for each match
          for (const match of chartData) {
            const homeAirport = airportsMap[match.home_team_id]
            const awayAirport = airportsMap[match.away_team_id]

            if (homeAirport && awayAirport && match.league_id) {
              const leagueName = leagueNamesMap[match.league_id] || match.league_id

              // Calculate emissions using the detailed method
              const result = calculateEmissionsBetweenAirports(
                homeAirport,
                awayAirport,
                isRoundTrip
              )

              // Scale by number of passengers
              const matchEmissions = result.totalEmissions * passengers / 35

              // Add to league total
              if (!leagueEmissionsMap[match.league_id]) {
                leagueEmissionsMap[match.league_id] = { name: leagueName, emissions: 0 }
              }
              leagueEmissionsMap[match.league_id].emissions += matchEmissions
            }
          }

          setEmissionsData(
            Object.values(leagueEmissionsMap)
              .map(({ name, emissions }) => ({
                label: name,
                value: emissions,
              }))
              .sort((a, b) => b.value - a.value)
          )
        } else {
          // Show top teams in the selected league by calculating team-specific emissions
          const teamEmissionsMap: Record<string, { name: string, emissions: number }> = {}

          // Calculate emissions for each match
          for (const match of chartData) {
            const homeAirport = airportsMap[match.home_team_id]
            const awayAirport = airportsMap[match.away_team_id]

            if (homeAirport && awayAirport) {
              // Calculate emissions using the detailed method
              const result = calculateEmissionsBetweenAirports(
                homeAirport,
                awayAirport,
                isRoundTrip
              )

              // Scale by number of passengers
              const matchEmissions = result.totalEmissions * passengers / 35

              // Add to home team total (home team is responsible for organizing travel)
              if (!teamEmissionsMap[match.home_team_id]) {
                teamEmissionsMap[match.home_team_id] = { name: match.home_team, emissions: 0 }
              }
              teamEmissionsMap[match.home_team_id].emissions += matchEmissions
            }
          }

          setEmissionsData(
            Object.values(teamEmissionsMap)
              .map(({ name, emissions }) => ({
                label: name,
                value: emissions,
              }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
          )
        }
      } else {
        setEmissionsData([])
      }
    } catch (error) {
      console.error("Error fetching emissions data:", error)
      toast.error("Failed to load emissions data")
    }
  }, [selectedLeague, selectedSeason, airportsMap, passengers, isRoundTrip, fetchChartData])

  const fetchLeagues = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("leagues").select("*")
      if (error) {
        throw error
      }
      if (data) {
        setLeagues(data)
      }
    } catch (error) {
      console.error("Error fetching leagues:", error)
      toast.error("Failed to load league data")
    } finally {
      setIsLoading(false)
    }
  }, [])



  // Initial data loading
  useEffect(() => {
    fetchLeagues()
    fetchAirports()
    fetchSeasons()
  }, [fetchLeagues, fetchAirports])
  // Add this new useEffect to handle season changes
  useEffect(() => {
    if (selectedSeason && Object.keys(airportsMap).length > 0) {
      // Reset pagination when season changes
      setCurrentPage(1)

      // Clear existing data to avoid showing stale data
      setMatches([])
      setChartMatches([])
      setEmissionsData([])

      // Fetch fresh data for the new season
      fetchStats()
      fetchMatches()
      fetchChartData()
      fetchEmissionsData()
    }
  }, [selectedSeason, airportsMap, fetchStats, fetchMatches, fetchChartData, fetchEmissionsData])
  // Load data when airportsMap is available
  useEffect(() => {
    if (Object.keys(airportsMap).length > 0 && selectedSeason) {
      // Only load data for the active tab to optimize performance
      if (activeTab === "overview" || activeTab === "charts") {
        fetchStats()
        fetchEmissionsData()
      }

      if (activeTab === "details") {
        fetchMatches()
      }

      // Chart data needed for all tabs
      fetchChartData()
    }
  }, [
    activeTab,
    selectedLeague,
    selectedSeason,
    fetchStats,
    fetchMatches,
    fetchEmissionsData,
    fetchChartData,
    airportsMap,
    passengers,
    isRoundTrip,
    searchQuery,
    currentPage,
    pageSize
  ])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const Pagination = () => {
    const totalPages = Math.ceil(totalMatches / pageSize)

    return (
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing <span className="font-medium">{matches.length}</span> of{" "}
          <span className="font-medium">{totalMatches}</span> matches
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(current => Math.max(1, current - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(current => Math.min(totalPages, current + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }




  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Monitor and analyze sports travel emissions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={selectedSeason || ""}
            onValueChange={(value) => {
              setSelectedSeason(value);
              // Reset UI states when season changes
              setIsStatsLoading(true);
              setIsMatchesLoading(true);
              setIsChartLoading(true);
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map(season => (
                <SelectItem key={season.season_id} value={season.season_id}>
                  {season.season_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLeague} onValueChange={setSelectedLeague}>
            <SelectTrigger className="w-full sm:w-[200px]">
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

      <Separator />

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full md:w-[300px]">
          <TabsTrigger value="overview" className="flex gap-1 items-center">
            <PieChart className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex gap-1 items-center">
            <BarChart3 className="h-4 w-4" />
            <span>Charts</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex gap-1 items-center">
            <LineChartIcon className="h-4 w-4" />
            <span>Details</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isStatsLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
                <Card className="overflow-hidden border-l-4 border-l-emerald-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
                    <Trophy className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.leagues}</div>
                    <p className="text-xs text-muted-foreground">{selectedSeason} Season</p>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-emerald-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                    <Users className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.teams}</div>
                    <p className="text-xs text-muted-foreground">{selectedSeason} Season</p>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-emerald-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Season Matches</CardTitle>
                    <Calendar className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.matches}</div>
                    <p className="text-xs text-muted-foreground">{selectedSeason} Season</p>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-l-4 border-l-emerald-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Plane className="h-4 w-4 text-emerald-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>CO2 emissions from team travel</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline">
                      <div className="text-2xl font-bold">{stats.totalEmissions.toLocaleString()} tonnes</div>
                      <div className={`ml-2 flex items-center text-sm ${stats.emissionsChange > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {stats.emissionsChange > 0 ? (
                          <ArrowUp className="mr-1 h-4 w-4" />
                        ) : (
                          <ArrowDown className="mr-1 h-4 w-4" />
                        )}
                        {Math.abs(stats.emissionsChange)}%
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isRoundTrip ? "Including return flights" : "One-way flights only"}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>



          {/* Charts */}

          <div className="grid gap-4 md:grid-cols-2">
            {isChartLoading ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            ) : (<>

              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedLeague === "all" ? "Emissions by League" : "Top 5 Teams by Emissions"}</CardTitle>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">About this data</h4>
                          <p className="text-sm text-muted-foreground">
                            This chart shows the estimated CO2 emissions in tonnes for each {selectedLeague === "all" ? "league" : "team"} based on their travel schedule.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <CardDescription>
                    CO2 emissions in tonnes for the {selectedSeason} season
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <BarChart
                    data={emissionsData}
                    colors={["#10b981", "#34d399", "#6ee7b7"]}
                  />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-xl">
                      Monthly Emissions Trend
                    </CardTitle>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                      {selectedSeason}
                    </Badge>
                  </div>
                  <CardDescription>
                    Travel emissions over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <LineChart
                    data={chartMatches}
                    colors={["#10b981"]}
                  />
                </CardContent>
              </Card>
            </>)}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {isChartLoading ? (
              <>
                <ChartSkeleton />
                <ChartSkeleton />
              </>
            ) : (<>

              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">

                    <CardTitle className="text-base sm:text-xl">{selectedLeague === "all" ? "Emissions by League" : "Top 5 Teams by Emissions"}</CardTitle>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">About this data</h4>
                          <p className="text-sm text-muted-foreground">
                            This chart shows the estimated CO2 emissions in tonnes for each {selectedLeague === "all" ? "league" : "team"} based on their travel schedule.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <CardDescription>
                    CO2 emissions in tonnes for the {selectedSeason} season
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <BarChart
                    data={emissionsData}
                    colors={["#10b981", "#34d399", "#6ee7b7"]}
                  />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base sm:text-xl">
                      Monthly Emissions Trend
                    </CardTitle>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                      {selectedSeason}
                    </Badge>
                  </div>
                  <CardDescription>
                    Travel emissions over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <LineChart
                    data={chartMatches}
                    colors={["#10b981"]}
                  />
                </CardContent>
              </Card>
            </>)}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {/* Match details table with additional stats */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {isChartLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (

              emissionsData.slice(0, 3).map((item, index) => (
                <Card key={index} className="overflow-hidden border-l-4 border-l-emerald-500">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">{item.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="text-2xl font-bold">{Math.round(item.value).toLocaleString()} tonnes</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Plane className="h-3 w-3" />
                      <span>Approx. {Math.round(item.value / 5)} flights</span>
                    </div>
                  </CardContent>
                </Card>
              ))

            )}
          </div>{isMatchesLoading ? (
            <TableSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="text-base sm:text-xl">Match Details</CardTitle>
                  <Input
                    placeholder="Search matches..."
                    className="w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-background border-b">
                      <tr>
                        <th className="text-left p-2 text-xs sm:text-sm">Date</th>
                        <th className="text-left p-2 text-xs sm:text-sm">Teams</th>
                        <th className="text-left p-2 text-xs sm:text-sm">League</th>
                        <th className="text-right p-2 text-xs sm:text-sm">Distance (km)</th>
                        <th className="text-right p-2 text-xs sm:text-sm">Emissions (t)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matches.map((match) => (
                        <tr key={match.match_id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="p-2">
                            <div className="font-medium">{new Date(match.date).toLocaleDateString()}</div>
                          </td>
                          <td className="p-2">
                            <div className="font-medium">{match.home_team} vs {match.away_team}</div>
                          </td>
                          <td className="p-2">
                            <Badge variant="outline">{leagueNames[match.league_id] || match.league_id}</Badge>
                          </td>
                          <td className="p-2 text-right">
                            {Math.round(match.distance).toLocaleString()}
                          </td>
                          <td className="p-2 text-right">
                            {Math.round(match.match_emissions[0].emissions).toLocaleString()}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination />
                </ScrollArea>
              </CardContent>
            </Card>)}
        </TabsContent>
      </Tabs>
    </div>
  )
}