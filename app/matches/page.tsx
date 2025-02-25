"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import type { Match, League } from "@/lib/types"
import { useRouter } from "next/navigation"
import { PlaneIcon } from "@/components/icons"
import { ArrowUpDown } from "lucide-react"

export default function MatchesPage() {
  const router = useRouter()
  const [selectedLeague, setSelectedLeague] = useState<string>("all")
  const [matches, setMatches] = useState<Match[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const currentSeason = "2024-2025"

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
        )
      `)
      .eq("season_id", currentSeason)
      .order("date", { ascending: sortDirection === "asc" })
      .limit(1000)

    if (selectedLeague !== "all") {
      matchesQuery = matchesQuery.eq("league_id", selectedLeague)
    }

    const { data: matchesData, error: matchesError } = await matchesQuery
    if (matchesError) {
      console.error("Error fetching matches:", matchesError)
      return
    }

    if (matchesData && matchesData.length > 0) {
      const { data: emissionsData } = await supabase
        .from("match_emissions")
        .select("*")
        .in(
          "match_id",
          matchesData.map((m) => m.match_id),
        )

      const matchesWithEmissions = matchesData.map((match) => ({
        ...match,
        match_emissions: emissionsData?.filter((e) => e.match_id === match.match_id) || [],
      }))

      setMatches(matchesWithEmissions)
    } else {
      setMatches([])
    }
  }, [selectedLeague, sortDirection])

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

  return (
    <div className="p-6 lg:ml-64">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Matches</h1>
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
          <Button variant="outline" size="sm" onClick={toggleSort} className="flex items-center gap-2">
            Date
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.match_id}
                className="flex justify-between items-center hover:bg-green-100/10 transition-colors rounded-lg p-4 text-center cursor-pointer"
                onClick={() => router.push(`/emissions?match=${match.match_id}`)}
              >
                <div className="flex-1 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <span className="font-medium">{match.home_team}</span>
                    <span className="text-sm text-muted-foreground">({match.home_city})</span>
                  </div>
                  <span className="font-medium text-muted-foreground mx-4">vs</span>
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <span className="font-medium">{match.away_team}</span>
                    <span className="text-sm text-muted-foreground">({match.away_city})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{new Date(match.date).toLocaleDateString()}</span>
                    {match.match_emissions?.[0]?.emissions && (
                      <span className="text-sm font-medium">
                        {Math.round(match.match_emissions[0].emissions).toLocaleString()} tonnes CO₂
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <PlaneIcon className="h-5 w-5 transition-transform hover:translate-x-2 hover:-translate-y-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

