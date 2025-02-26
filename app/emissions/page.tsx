"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { Car, Trees, Lightbulb, Home } from "lucide-react"
import Link from "next/link"

export default function EmissionsPage() {
  const searchParams = useSearchParams()
  const matchId = searchParams ? searchParams.get("match") : null
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchData] = useState<any>(null)
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch match details if we have a match ID
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        if (matchId) {
          // Fetch specific match
          const { data, error } = await supabase
            .from("matches")
            .select("*")
            .eq("match_id", matchId)
            .single()

          if (error) throw error
          setMatchData(data)
        } else {
          // Fetch recent matches
          const { data, error } = await supabase
            .from("matches")
            .select("match_id, date, home_team, away_team")
            .order("date", { ascending: false })
            .limit(5)

          if (error) throw error
          setRecentMatches(data || [])
        }
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [matchId])

  // Loading state
  if (loading) {
    return (
      <div className="p-6 lg:ml-64">
        <h1 className="text-3xl font-bold mb-6">Emissions</h1>
        <p>Loading...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 lg:ml-64">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-500">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  // Match selection screen (no match ID provided)
  if (!matchId) {
    return (
      <div className="p-6 lg:ml-64">
        <h1 className="text-3xl font-bold mb-6">Emissions Calculator</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select a Match</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Choose a match to view its emissions details</p>

            {recentMatches.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-medium mb-2">Recent Matches</h3>
                {recentMatches.map((match) => (
                  <div
                    key={match.match_id}
                    className="p-4 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Link href={`/emissions?match=${match.match_id}`} className="block">
                      <div className="flex justify-between">
                        <div>
                          <span>{match.home_team || 'Home Team'}</span>
                          <span className="mx-2">vs</span>
                          <span>{match.away_team || 'Away Team'}</span>
                        </div>
                        <div>
                          {match.date ? new Date(match.date).toLocaleDateString() : 'No date'}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p>No recent matches found</p>
            )}

            <div className="mt-4">
              <Button asChild>
                <Link href="/matches">View All Matches</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Match details view (when match ID is provided)
  return (
    <div className="p-6 lg:ml-64">
      <h1 className="text-3xl font-bold mb-6">Match Emissions</h1>

      {matchData ? (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Match Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold">{matchData.home_team || 'Home Team'}</span>
                  <span className="mx-2">vs</span>
                  <span className="font-bold">{matchData.away_team || 'Away Team'}</span>
                </div>
                <div>
                  {matchData.date ? new Date(matchData.date).toLocaleDateString() : 'No date'}
                </div>
              </div>

              <div className="mt-4">
                <p><strong>Stadium:</strong> {matchData.stadium || 'Unknown'}</p>
                <p><strong>Country:</strong> {matchData.country || 'Unknown'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emissions Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We're upgrading our emissions calculation system to use the ICAO methodology.
                Check back soon for detailed emissions data for this match.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                  <Car className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-bold">Passenger Vehicle</p>
                  <p className="text-sm">Equivalent miles</p>
                </div>
                <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                  <Trees className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-bold">Tree Seedlings</p>
                  <p className="text-sm">10-year growth</p>
                </div>
                <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-bold">LED Bulbs</p>
                  <p className="text-sm">Annual savings</p>
                </div>
                <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                  <Home className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-bold">Home Energy</p>
                  <p className="text-sm">Annual usage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div>
          <p>Match not found.</p>
          <Button asChild className="mt-4">
            <Link href="/emissions">Back to Emissions Calculator</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
