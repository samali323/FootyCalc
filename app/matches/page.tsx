"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"
import type { Match, League } from "@/lib/types"
import { useRouter } from "next/navigation"
import { PlaneIcon } from "@/components/icons"
import { ArrowUpDown, Calendar, MapPin, Search, ChevronLeft, ChevronRight, Trophy } from "lucide-react"

export default function MatchesPage() {
  const router = useRouter()
  const [selectedLeague, setSelectedLeague] = useState<string>("all")
  const [matches, setMatches] = useState<Match[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const currentSeason = "2024-2025"
  const matchesPerPage = 8

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setPage(1) // Reset to first page when search changes
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchMatchesCount = useCallback(async () => {
    let countQuery = supabase
      .from("matches")
      .select(`
        match_id,
        league_seasons!inner (
          league_id,
          leagues (
            name
          )
        )
      `, { count: "exact" })
      .eq("season_id", currentSeason)

    // Apply league filter if selected
    if (selectedLeague !== "all") {
      countQuery = countQuery.eq("league_id", selectedLeague)
    }

    // Apply search filter if query exists
    if (debouncedSearchQuery) {
      countQuery = countQuery.or(
        `home_team.ilike.%${debouncedSearchQuery}%,` +
        `away_team.ilike.%${debouncedSearchQuery}%,` +
        `home_city.ilike.%${debouncedSearchQuery}%,` +
        `away_city.ilike.%${debouncedSearchQuery}%`
      )
    }

    const { count, error } = await countQuery
    
    if (error) {
      console.error("Error counting matches:", error)
    } else if (count !== null) {
      setTotalPages(Math.ceil(count / matchesPerPage))
    }
  }, [selectedLeague, debouncedSearchQuery])

  const fetchMatches = useCallback(async () => {
    setIsLoading(true)
    
    // First get count for pagination
    await fetchMatchesCount()
    
    // Then fetch the actual matches for current page
    let matchesQuery = supabase
      .from("matches")
      .select(`
        *,
        league_seasons!inner (
          league_id,
          leagues (
            name
          )
        )
      `)
      .eq("season_id", currentSeason)
      .order("date", { ascending: sortDirection === "asc" })

    // Apply league filter
    if (selectedLeague !== "all") {
      matchesQuery = matchesQuery.eq("league_id", selectedLeague)
    }

    // Apply search filter
    if (debouncedSearchQuery) {
      matchesQuery = matchesQuery.or(
        `home_team.ilike.%${debouncedSearchQuery}%,` +
        `away_team.ilike.%${debouncedSearchQuery}%,` +
        `home_city.ilike.%${debouncedSearchQuery}%,` +
        `away_city.ilike.%${debouncedSearchQuery}%`
      )
    }

    // Apply pagination
    matchesQuery = matchesQuery.range(
      (page - 1) * matchesPerPage, 
      page * matchesPerPage - 1
    )

    const { data: matchesData, error: matchesError } = await matchesQuery
    
    if (matchesError) {
      console.error("Error fetching matches:", matchesError)
      setIsLoading(false)
      return
    }

    if (matchesData) {
      setMatches(matchesData)
    } else {
      setMatches([])
    }
    
    setIsLoading(false)
  }, [selectedLeague, sortDirection, page, debouncedSearchQuery, fetchMatchesCount])

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
    fetchMatches()
  }, [fetchMatches])

  const toggleSort = () => {
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
  }

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  // Function to determine which league a match belongs to
  const getLeagueName = (match) => {
    if (match.league_seasons?.leagues?.name) {
      return match.league_seasons.leagues.name;
    }
    
    const league = leagues.find(l => l.league_id === match.league_id);
    return league?.name || "Unknown League";
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header with animated gradient text */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-emerald-500 animate-gradient">
            Upcoming Matches
          </h1>
          <p className="text-gray-400 mt-2 text-lg max-w-2xl mx-auto md:mx-0">
            Explore upcoming matches across all leagues for the {currentSeason} season
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700 hover:border-emerald-600/50 transition-all duration-300 shadow-lg hover:shadow-emerald-700/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-emerald-600/20 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Current Season</p>
                  <p className="text-white font-semibold text-xl mt-1">{currentSeason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700 hover:border-emerald-600/50 transition-all duration-300 shadow-lg hover:shadow-emerald-700/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-emerald-600/20 flex items-center justify-center">
                  <Trophy className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Matches</p>
                  <p className="text-white font-semibold text-xl mt-1">{totalPages * matchesPerPage}+</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/40 backdrop-blur-sm border-gray-700 hover:border-emerald-600/50 transition-all duration-300 shadow-lg hover:shadow-emerald-700/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-full bg-emerald-600/20 flex items-center justify-center">
                  <MapPin className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Leagues</p>
                  <p className="text-white font-semibold text-xl mt-1">{leagues.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700 mb-8 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Search */}
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-500" />
                <Input
                  type="text"
                  placeholder="Search by team or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-700 bg-gray-800/70 text-white focus:ring-emerald-500 focus:border-emerald-500 text-base"
                />
                {debouncedSearchQuery && (
                  <div className="mt-2 text-sm text-emerald-400 font-medium">
                    Showing results for "{debouncedSearchQuery}"
                  </div>
                )}
              </div>
              
              {/* League Filter */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                  <SelectTrigger className="w-full sm:w-[220px] border-gray-700 bg-gray-800/70 hover:bg-gray-800 text-gray-200">
                    <SelectValue placeholder="Select League" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-gray-200 focus:bg-emerald-800/30 focus:text-white">All Leagues</SelectItem>
                    {leagues.map((league) => (
                      <SelectItem 
                        key={league.league_id} 
                        value={league.league_id}
                        className="text-gray-200 focus:bg-emerald-800/30 focus:text-white"
                      >
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Sort Direction */}
                <Button 
                  variant="outline" 
                  size="default" 
                  onClick={toggleSort} 
                  className="flex items-center gap-2 border-gray-700 bg-gray-800/70 hover:bg-gray-800 text-gray-200 hover:text-emerald-400 hover:border-emerald-500"
                >
                  {sortDirection === "asc" ? "Oldest First" : "Newest First"}
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matches Card */}
        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800 shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm py-4">
            <CardTitle className="text-xl text-white flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-emerald-400" />
              Upcoming Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y divide-gray-800">
                {[...Array(matchesPerPage)].map((_, index) => (
                  <div key={index} className="p-5">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-center animate-pulse">
                      <div className="md:col-span-5 flex items-center justify-between">
                        <div className="h-6 w-32 bg-gray-800 rounded"></div>
                        <div className="mx-3 h-6 w-8 bg-gray-800 rounded-full"></div>
                        <div className="h-6 w-32 bg-gray-800 rounded"></div>
                      </div>
                      <div className="md:col-span-4 flex flex-col items-center md:border-l md:border-r border-gray-800 px-4">
                        <div className="h-5 w-32 bg-gray-800 rounded mb-1"></div>
                        <div className="h-4 w-24 bg-gray-800 rounded"></div>
                      </div>
                      <div className="md:col-span-3 flex justify-end items-center">
                        <div className="h-6 w-24 bg-gray-800 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {matches.length > 0 ? (
                  matches.map((match) => (
                    <div
                      key={match.match_id}
                      className="group flex justify-between items-center hover:bg-emerald-900/20 transition-colors p-6 cursor-pointer"
                      onClick={() => router.push(`/emissions?match=${match.match_id}`)}
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-5 flex items-center justify-between">
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-white text-lg">{match.home_team}</span>
                            <div className="flex items-center mt-1 text-gray-400">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="text-xs">{match.home_city}</span>
                            </div>
                          </div>
                          
                          <div className="mx-3 px-3 py-1 bg-gray-800 rounded-full text-gray-300 font-medium text-sm">
                            vs
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-white text-lg">{match.away_team}</span>
                            <div className="flex items-center mt-1 text-gray-400">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="text-xs">{match.away_city}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:col-span-4 flex flex-col items-center md:border-l md:border-r border-gray-800 px-4">
                          <span className="text-base text-white font-medium">
                            {new Date(match.date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-sm text-emerald-400 mt-1">
                            {new Date(match.date).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="md:col-span-3 flex justify-end items-center">
                          <div className="flex items-center px-3 py-1 bg-emerald-900/30 rounded-full">
                            <Trophy className="h-4 w-4 text-emerald-400 mr-2" />
                            <span className="text-sm font-medium text-emerald-300">
                              {getLeagueName(match)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center">
                    <Trophy className="h-16 w-16 mx-auto text-emerald-700/50 mb-6" />
                    <p className="text-gray-300 text-xl font-medium mb-2">
                      {debouncedSearchQuery 
                        ? "No matches found for your search query" 
                        : "No matches found for the selected league"}
                    </p>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Try adjusting your filters or search terms to find the matches you're looking for
                    </p>
                    {debouncedSearchQuery && (
                      <Button 
                        onClick={() => setSearchQuery("")}
                        className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        {!isLoading && matches.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-400 font-medium">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={handlePreviousPage} 
                disabled={page === 1}
                variant="outline"
                className="flex items-center border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-emerald-400 hover:text-emerald-300 disabled:opacity-50 disabled:text-gray-600"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              <Button 
                onClick={handleNextPage} 
                disabled={page === totalPages}
                className="flex items-center bg-emerald-800 hover:bg-emerald-700 text-white border-none disabled:opacity-50 disabled:bg-gray-800"
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}