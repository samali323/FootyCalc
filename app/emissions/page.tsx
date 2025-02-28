"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import type { Match, Airport } from "@/lib/types"
import { PlaneIcon } from "@/components/icons"
import { Car, Trees, Lightbulb, Home, Info, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

// Import the benchmark-calibrated calculator
import {
  calculateEmissionsBetweenAirports,
  EmissionsResult,
  getFlightStatistics
} from "@/lib/icaoCalculations"
import { CardDescription } from "@/components/ui/card-description"

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

  // Default to one-way flights initially
  const [isRoundTrip, setIsRoundTrip] = useState(false)
  const [passengers, setPassengers] = useState(35)
  const [emissionsResult, setEmissionsResult] = useState<EmissionsResult | null>(null)
  const [flightStats, setFlightStats] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState("benchmark")
  const [isSaving, setIsSaving] = useState(false)

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

            // Check if we already have emissions data
            const { data: emissionsData } = await supabase
              .from("match_emissions")
              .select("*")
              .eq("match_id", matchId)
              .maybeSingle();

            setMatchData({
              ...data,
              home_airport: homeAirportResult.data || undefined,
              away_airport: awayAirportResult.data || undefined,
              match_emissions: emissionsData ? [emissionsData] : [{ emissions: 0, distance: 0 }],
            });
          }
        } else {
          // Fetch recent matches with emissions data
          const { data, error } = await supabase
            .from("matches")
            .select(`
              match_id, 
              date, 
              home_team, 
              away_team,
              home_city,
              away_city
            `)
            .order("date", { ascending: false })
            .limit(5);

          if (error) throw error;
          
          if (data && data.length > 0) {
            const { data: emissionsData } = await supabase
              .from("match_emissions")
              .select("*")
              .in(
                "match_id",
                data.map((m) => m.match_id),
              );

            const matchesWithEmissions = data.map((match) => ({
              ...match,
              match_emissions: emissionsData?.filter((e) => e.match_id === match.match_id) || [],
            }));

            setRecentMatches(matchesWithEmissions);
          } else {
            setRecentMatches([]);
          }
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

  const handleSaveEmissions = async () => {
    if (!matchId || !emissionsResult) return;
    
    setIsSaving(true);
    
    try {
      const emissionsData = {
        match_id: matchId,
        emissions: emissionsResult.totalEmissions,
        distance: emissionsResult.distanceKm,
        calculation_method: activeTab,
        round_trip: isRoundTrip,
        updated_at: new Date().toISOString()
      };
      
      // Check if we already have emissions for this match
      const { data: existingData } = await supabase
        .from("match_emissions")
        .select("*")
        .eq("match_id", matchId)
        .maybeSingle();
        
      if (existingData) {
        // Update existing record
        await supabase
          .from("match_emissions")
          .update(emissionsData)
          .eq("match_id", matchId);
      } else {
        // Insert new record
        await supabase
          .from("match_emissions")
          .insert(emissionsData);
      }
      
      // Show success message or redirect
      alert("Emissions data saved successfully.");
      
    } catch (error) {
      console.error("Error saving emissions data:", error);
      alert("Failed to save emissions data.");
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
        <h2 className="text-xl font-medium">Loading emissions data...</h2>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  // Match selection screen (no match ID provided)
  if (!matchId) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Flight Emissions Calculator</h1>
          <p className="text-gray-500 dark:text-gray-400">Calculate and track carbon emissions from team travel</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlaneIcon className="mr-2 h-5 w-5 text-emerald-500" />
                  Recent Matches
                </CardTitle>
                <CardDescription>Select a match to view its emissions details</CardDescription>
              </CardHeader>
              <CardContent>
                {recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatches.map((match) => (
                      <div
                        key={match.match_id}
                        className="flex justify-between items-center p-4 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        onClick={() => window.location.href = `/emissions?match=${match.match_id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{match.home_team}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mx-2">vs</div>
                            <div className="font-medium">{match.away_team}</div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div>{match.home_city}</div>
                            <div>{match.away_city}</div>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-sm">{new Date(match.date).toLocaleDateString()}</div>
                          {match.match_emissions?.[0]?.emissions ? (
                            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              {Math.round(match.match_emissions[0].emissions).toLocaleString()} tonnes CO₂
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">No emissions data</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PlaneIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p>No recent matches found</p>
                  </div>
                )}

                <div className="mt-6">
                  <Button asChild variant="outline">
                    <Link href="/matches">View All Matches</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About Our Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm">
                Our emissions calculator uses a benchmark-calibrated methodology specifically for sports teams' travel. Key features include:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4 text-sm">
                <li>Charter vs commercial flight emissions differences (6.9x factor)</li>
                <li>Equipment and cargo considerations</li>
                <li>Special aviation procedures</li>
                <li>Regional flight pattern variations</li>
                <li>Flight inefficiencies based on distance</li>
              </ul>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a match to get started with detailed emissions analysis.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Match details view with emissions
  if (!matchData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-3xl font-bold mb-6">Match not found</h1>
        <p className="mb-6 text-gray-500 dark:text-gray-400">The match you're looking for could not be found or has been removed.</p>
        <Button asChild>
          <Link href="/emissions">Back to Emissions Calculator</Link>
        </Button>
      </div>
    )
  }

  const equivalencies = calculateEquivalencies(matchData.match_emissions?.[0]?.emissions || 0)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Match Emissions Details</h1>
        <Button 
  asChild 
  variant="outline" 
  size="sm" 
  className="gap-2 font-medium bg-emerald-900 hover:bg-emerald-800 text-white border-emerald-700 transition-colors rounded-md shadow-sm"
>
  <Link href="/matches" className="flex items-center">
    <ArrowLeft className="h-4 w-4" />
    <span>Back to Matches</span>
  </Link>
</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="overflow-hidden border-t-4 border-t-emerald-500">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
            <CardTitle>Match Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                <div>
                  <p className="font-medium">{matchData.home_team}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{matchData.home_city}</p>
                </div>
                <span className="font-medium text-gray-500 dark:text-gray-400">vs</span>
                <div className="text-right">
                  <p className="font-medium">{matchData.away_team}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{matchData.away_city}</p>
                </div>
              </div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Date</span>
                  <span>{new Date(matchData.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Time</span>
                  <span>{new Date(matchData.date).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Stadium</span>
                  <span>{matchData.stadium}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Country</span>
                  <span>{matchData.country}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-t-4 border-t-blue-500">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
            <CardTitle>Emissions Calculation</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full mb-4 grid grid-cols-2">
                <TabsTrigger value="benchmark">Benchmark Method</TabsTrigger>
                <TabsTrigger value="standard">Standard Method</TabsTrigger>
              </TabsList>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                  <div>
                    <p className="font-medium">{matchData.home_airport?.iata_code || "Unknown"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {matchData.home_airport?.airport_name || "Airport not found"}
                    </p>
                  </div>
                  <PlaneIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                  <div className="text-right">
                    <p className="font-medium">{matchData.away_airport?.iata_code || "Unknown"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {matchData.away_airport?.airport_name || "Airport not found"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-800/30">
                  <Switch id="round-trip" checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
                  <Label htmlFor="round-trip">Include Return Flight</Label>
                </div>

                <TabsContent value="benchmark" className="space-y-4 mt-2">
                  {emissionsResult && (
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium">Flight Type</span>
                        <span className="text-sm">{emissionsResult.flightType}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium">Flight Distance</span>
                        <span className="text-sm">
                          {Math.round(emissionsResult.distanceKm).toLocaleString()} km
                          {isRoundTrip && " (including return)"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium flex items-center">
                          Adjusted Distance
                          <Info className="inline-block ml-1 h-3 w-3 text-gray-400" title="Includes routing inefficiencies" />
                        </span>
                        <span className="text-sm">
                          {Math.round(emissionsResult.adjustedDistance).toLocaleString()} km
                        </span>
                      </div>
                      {flightStats && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-sm font-medium">Transport Mode</span>
                          <span className="text-sm">{flightStats.transportMode}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium">Emissions per km</span>
                        <span className="text-sm">
                          {(emissionsResult.emissionsPerKm * 1000).toFixed(1)} kg CO₂/km
                        </span>
                      </div>
                      <div className="flex justify-between py-2 font-semibold">
                        <span className="text-sm">Total CO₂ Emissions</span>
                        <span className="text-red-500 dark:text-red-400">
                          {Math.round(emissionsResult.totalEmissions).toLocaleString()} tonnes
                        </span>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="standard" className="space-y-4 mt-2">
                  <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                    <p className="text-sm">
                      <strong>Note:</strong> Standard ICAO emissions calculations typically
                      underestimate sports team charter emissions by 6-7 times.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium">Flight Distance</span>
                      <span className="text-sm">
                        {Math.round((emissionsResult?.distanceKm || 0) / (isRoundTrip ? 2 : 1)).toLocaleString()} km
                        {isRoundTrip && " × 2 = " + Math.round(emissionsResult?.distanceKm || 0).toLocaleString() + " km"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium">Team Size</span>
                      <span className="text-sm">{passengers} passengers</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium">Emissions Factor</span>
                      <span className="text-sm">0.12 kg CO₂ per passenger km</span>
                    </div>
                    <div className="flex justify-between py-2 font-semibold">
                      <span className="text-sm">Estimated CO₂</span>
                      <span className="text-sm">
                        {Math.round((emissionsResult?.totalEmissions || 0) / 6.9).toLocaleString()} tonnes
                      </span>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
            
            <Button 
              className="w-full mt-6" 
              onClick={handleSaveEmissions}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Saving...
                </>
              ) : (
                'Save Emissions Data'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Environmental Impact Equivalencies</CardTitle>
          <CardDescription>The CO₂ emissions from this flight are equivalent to:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {equivalencies.map((eq) => (
              <div key={eq.title} className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border">
                <eq.icon className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-medium mb-1">{eq.title}</h3>
                <p className="text-2xl font-bold mb-2">{eq.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{eq.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Emissions Reduction Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Travel Schedule Optimization</h3>
              <p className="text-sm">Reorganize match schedules to minimize long-distance travel and combine away games in the same region.</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Alternative Transport Options</h3>
              <p className="text-sm">For distances under 500km, consider high-speed rail or electric coach transport where infrastructure allows.</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Carbon Offset Investment</h3>
              <p className="text-sm">Invest in verified carbon offset projects equivalent to the emissions calculated from team travel.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}