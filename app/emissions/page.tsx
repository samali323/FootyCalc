"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import type { Match, Airport } from "@/lib/types"
import { PlaneIcon } from "@/components/icons"
import { Car, Trees, Lightbulb, Home, Info } from "lucide-react"
import Link from "next/link"

// Import the benchmark-calibrated calculator
import {
  calculateEmissionsBetweenAirports,
  EmissionsResult,
  getFlightStatistics
} from "@/lib/sportsEmissions"

interface MatchWithDetails extends Match {
  home_airport?: Airport;
  away_airport?: Airport;
  match_emissions?: {
    emissions: number;
    distance: number;
  }[];
}

interface Equivalency {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
}

export default function EmissionsPage() {
  const searchParams = useSearchParams()
  const matchId = searchParams ? searchParams.get("match") : null
  const [loading, setLoading] = useState(true)
  const [matchData, setMatchData] = useState<MatchWithDetails | null>(null)
  const [recentMatches, setRecentMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)

  // Default to one-way flights
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  const [passengers, setPassengers] = useState(35)
  const [emissionsResult, setEmissionsResult] = useState<EmissionsResult | null>(null)
  const [flightStats, setFlightStats] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState("benchmark")

  // Calculate emissions whenever match data or parameters change
  useEffect(() => {
    if (matchData?.home_airport && matchData?.away_airport) {
      const result = calculateEmissionsBetweenAirports(
        matchData.home_airport,
        matchData.away_airport,
        isRoundTrip
      );

      setEmissionsResult(result);

      // Get additional flight statistics
      const stats = getFlightStatistics(
        result.distanceKm / (isRoundTrip ? 2 : 1), // One-way distance for stats
        isRoundTrip
      );

      setFlightStats(stats);

      // Update match emissions for compatibility with other components
      setMatchData(prevMatch => {
        if (!prevMatch) return null;
        return {
          ...prevMatch,
          match_emissions: [
            {
              emissions: result.totalEmissions,
              distance: result.distanceKm,
            },
          ],
        };
      });
    }
  }, [matchData?.home_airport, matchData?.away_airport, isRoundTrip, passengers]);

  // Fetch data on initial load
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        if (matchId) {
          // Fetch specific match
          const { data, error } = await supabase
            .from("matches")
            .select("*")
            .eq("match_id", matchId)
            .single();

          if (error) throw error;

          if (data) {
            // Fetch airports for this match
            const [homeAirportResult, awayAirportResult] = await Promise.all([
              supabase.from("airports").select("*").eq("team_id", data.home_team_id).single(),
              supabase.from("airports").select("*").eq("team_id", data.away_team_id).single(),
            ]);

            setMatchData({
              ...data,
              home_airport: homeAirportResult.data || undefined,
              away_airport: awayAirportResult.data || undefined,
              match_emissions: [{ emissions: 0, distance: 0 }],
            });
          }
        } else {
          // Fetch recent matches
          const { data, error } = await supabase
            .from("matches")
            .select("match_id, date, home_team, away_team")
            .order("date", { ascending: false })
            .limit(5);

          if (error) throw error;
          setRecentMatches(data || []);
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [matchId]);

  const calculateEquivalencies = (emissions: number): Equivalency[] => {
    return [
      {
        icon: Car,
        title: "Passenger Vehicle",
        value: `${Math.round(emissions * 2.42).toLocaleString()}`,
        description: "miles driven by an average passenger vehicle",
      },
      {
        icon: Trees,
        title: "Tree Seedlings",
        value: `${Math.round(emissions * 16.5).toLocaleString()}`,
        description: "tree seedlings grown for 10 years",
      },
      {
        icon: Lightbulb,
        title: "LED Bulbs",
        value: `${Math.round(emissions * 121.6).toLocaleString()}`,
        description: "LED bulbs switched from incandescent for a year",
      },
      {
        icon: Home,
        title: "Home Energy",
        value: `${(emissions * 0.12).toFixed(1)}`,
        description: "homes' electricity use for one year",
      },
    ]
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 lg:ml-64">
        <h1 className="text-3xl font-bold mb-6">Emissions Calculator</h1>
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
          <Link href="/">Return to Dashboard</Link>
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

        <Card>
          <CardHeader>
            <CardTitle>About Our Emissions Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This tool uses a benchmark-calibrated methodology specifically for sports teams' carbon emissions.
              Our calculations are based on real-world data from European football leagues and account for:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Charter flights vs commercial flights (6.9x higher emissions)</li>
              <li>Sports equipment and additional cargo</li>
              <li>Special aviation procedures for team travel</li>
              <li>Regional variations in flight patterns</li>
              <li>Flight inefficiencies based on distance</li>
            </ul>
            <p>
              Select a match from above or browse all matches to see detailed emissions analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Match details view with emissions
  if (!matchData) {
    return (
      <div className="p-6 lg:ml-64">
        <h1 className="text-3xl font-bold mb-6">Match not found</h1>
        <Button asChild>
          <Link href="/emissions">Back to Emissions Calculator</Link>
        </Button>
      </div>
    )
  }

  const equivalencies = calculateEquivalencies(matchData.match_emissions?.[0]?.emissions || 0)

  return (
    <div className="p-6 lg:ml-64">
      <h1 className="text-3xl font-bold mb-6">Match Emissions Details</h1>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Match Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{matchData.home_team}</p>
                  <p className="text-sm text-muted-foreground">{matchData.home_city}</p>
                </div>
                <span className="font-medium text-muted-foreground">vs</span>
                <div>
                  <p className="font-medium">{matchData.away_team}</p>
                  <p className="text-sm text-muted-foreground">{matchData.away_city}</p>
                </div>
              </div>
              <div className="text-sm space-y-2">
                <p>
                  <span className="font-medium">Date:</span> {new Date(matchData.date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Stadium:</span> {matchData.stadium}
                </p>
                <p>
                  <span className="font-medium">Country:</span> {matchData.country}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emissions Calculation</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="benchmark" className="flex-1">Benchmark Method</TabsTrigger>
                <TabsTrigger value="standard" className="flex-1">Standard Method</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{matchData.home_airport?.iata_code || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">
                    {matchData.home_airport?.airport_name || "Airport not found"}
                  </p>
                </div>
                <PlaneIcon className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium">{matchData.away_airport?.iata_code || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">
                    {matchData.away_airport?.airport_name || "Airport not found"}
                  </p>
                </div>
              </div>

              <TabsContent value="benchmark" className="space-y-4 mt-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch id="round-trip" checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
                  <Label htmlFor="round-trip">Include Return Flight</Label>
                </div>

                {emissionsResult && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Flight Type:</span>
                      <span className="text-sm">{emissionsResult.flightType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Flight Distance:</span>
                      <span className="text-sm">
                        {Math.round(emissionsResult.distanceKm).toLocaleString()} km
                        {isRoundTrip && " (including return)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Adjusted Distance:</span>
                      <span className="text-sm">
                        {Math.round(emissionsResult.adjustedDistance).toLocaleString()} km
                        <Info className="inline-block ml-1 h-3 w-3" title="Includes routing inefficiencies" />
                      </span>
                    </div>
                    {flightStats && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Transport Mode:</span>
                        <span className="text-sm">{flightStats.transportMode}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Emissions per km:</span>
                      <span className="text-sm">
                        {(emissionsResult.emissionsPerKm * 1000).toFixed(1)} kg CO₂/km
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-sm font-medium">Total CO₂ Emissions:</span>
                      <span className="text-sm font-bold text-red-500">
                        {Math.round(emissionsResult.totalEmissions).toLocaleString()} tonnes
                      </span>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="standard" className="space-y-4 mt-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch
                    id="standard-round-trip"
                    checked={isRoundTrip}
                    onCheckedChange={setIsRoundTrip}
                  />
                  <Label htmlFor="standard-round-trip">Include Return Flight</Label>
                </div>

                <div className="p-4 border rounded-md bg-amber-50 dark:bg-amber-950 mb-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> Standard ICAO emissions calculations typically
                    underestimate sports team charter emissions by 6-7 times.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Flight Distance:</span>
                    <span className="text-sm">
                      {Math.round((emissionsResult?.distanceKm || 0) / (isRoundTrip ? 2 : 1)).toLocaleString()} km
                      {isRoundTrip && " × 2 = " + Math.round(emissionsResult?.distanceKm || 0).toLocaleString() + " km"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Team Size:</span>
                    <span className="text-sm">{passengers} passengers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Emissions Factor:</span>
                    <span className="text-sm">0.12 kg CO₂ per passenger km</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium">Estimated CO₂:</span>
                    <span className="text-sm">
                      {Math.round((emissionsResult?.totalEmissions || 0) / 6.9).toLocaleString()} tonnes
                    </span>
                  </div>
                </div>
              </TabsContent>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environmental Impact Equivalencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {equivalencies.map((eq) => (
              <div key={eq.title} className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
                <eq.icon className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-medium mb-1">{eq.title}</h3>
                <p className="text-2xl font-bold mb-2">{eq.value}</p>
                <p className="text-sm text-muted-foreground">{eq.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
