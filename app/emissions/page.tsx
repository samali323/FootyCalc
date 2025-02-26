"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import type { Match, Airport } from "@/lib/types"
import { PlaneIcon } from "@/components/icons"
import { Car, Trees, Lightbulb, Home, Info } from "lucide-react"
import { calculateEmissionsBetweenAirports, IcaoEmissionsResult, determineFlightType } from "@/lib/icaoCalculations"

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
  const matchId = searchParams.get("match")
  const [match, setMatch] = useState<MatchWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRoundTrip, setIsRoundTrip] = useState(true) // Default to round-trip
  const [passengers, setPassengers] = useState(35) // Default passengers
  const [cabinClass, setCabinClass] = useState<"business" | "economy">("business") // Default cabin class
  const [aircraftType, setAircraftType] = useState<"A320" | "B737">("A320") // Default aircraft type
  const [icaoResult, setIcaoResult] = useState<IcaoEmissionsResult | null>(null)
  const [activeTab, setActiveTab] = useState("icao") // Default to ICAO tab

  useEffect(() => {
    async function fetchMatchDetails() {
      if (!matchId) return

      const { data: matchData, error: matchError } = await supabase
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
        .eq("match_id", matchId)
        .single()

      if (matchError) {
        console.error("Error fetching match:", matchError)
        return
      }

      if (matchData) {
        // Fetch airports for both teams
        const [homeAirportResult, awayAirportResult] = await Promise.all([
          supabase.from("airports").select("*").eq("team_id", matchData.home_team_id).single(),
          supabase.from("airports").select("*").eq("team_id", matchData.away_team_id).single(),
        ])

        const homeAirport = homeAirportResult.data;
        const awayAirport = awayAirportResult.data;

        // Check if we have both airports
        if (homeAirport && awayAirport) {
          // Calculate emissions using ICAO methodology
          const result = calculateEmissionsBetweenAirports(
            homeAirport,
            awayAirport,
            passengers,
            isRoundTrip
          );

          setIcaoResult(result);

          setMatch({
            ...matchData,
            home_airport: homeAirport,
            away_airport: awayAirport,
            match_emissions: [
              {
                emissions: result.totalEmissions,
                distance: result.distanceKm,
              },
            ],
          })
        } else {
          setMatch({
            ...matchData,
            home_airport: homeAirport,
            away_airport: awayAirport,
            match_emissions: [{ emissions: 0, distance: 0 }],
          })
        }
      }

      setLoading(false)
    }

    fetchMatchDetails()
  }, [matchId, isRoundTrip, passengers, cabinClass, aircraftType])

  // Recalculate emissions when parameters change
  useEffect(() => {
    if (match?.home_airport && match?.away_airport) {
      const result = calculateEmissionsBetweenAirports(
        match.home_airport,
        match.away_airport,
        passengers,
        isRoundTrip
      );

      setIcaoResult(result);

      // Update match emissions for compatibility with other components
      setMatch(prevMatch => {
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
  }, [isRoundTrip, passengers, cabinClass, aircraftType]);

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

  if (loading) {
    return (
      <div className="p-6 lg:ml-64">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="p-6 lg:ml-64">
        <h1 className="text-3xl font-bold mb-6">Match not found</h1>
      </div>
    )
  }

  const equivalencies = calculateEquivalencies(match.match_emissions?.[0]?.emissions || 0)

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
                  <p className="font-medium">{match.home_team}</p>
                  <p className="text-sm text-muted-foreground">{match.home_city}</p>
                </div>
                <span className="font-medium text-muted-foreground">vs</span>
                <div>
                  <p className="font-medium">{match.away_team}</p>
                  <p className="text-sm text-muted-foreground">{match.away_city}</p>
                </div>
              </div>
              <div className="text-sm space-y-2">
                <p>
                  <span className="font-medium">Date:</span> {new Date(match.date).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Stadium:</span> {match.stadium}
                </p>
                <p>
                  <span className="font-medium">Country:</span> {match.country}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emissions Calculation</CardTitle>
            <CardDescription>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="icao" className="flex-1">ICAO Method</TabsTrigger>
                  <TabsTrigger value="simple" className="flex-1">Simple Method</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{match.home_airport?.iata_code || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">
                    {match.home_airport?.airport_name || "Airport not found"}
                  </p>
                </div>
                <PlaneIcon className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-medium">{match.away_airport?.iata_code || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">
                    {match.away_airport?.airport_name || "Airport not found"}
                  </p>
                </div>
              </div>

              <TabsContent value="icao" className="space-y-4 mt-0">
                {/* ICAO Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passengers">Team Size</Label>
                    <Select value={passengers.toString()} onValueChange={(v) => setPassengers(parseInt(v))}>
                      <SelectTrigger id="passengers">
                        <SelectValue placeholder="Team Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25 passengers</SelectItem>
                        <SelectItem value="30">30 passengers</SelectItem>
                        <SelectItem value="35">35 passengers</SelectItem>
                        <SelectItem value="40">40 passengers</SelectItem>
                        <SelectItem value="45">45 passengers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aircraft">Aircraft Type</Label>
                    <Select value={aircraftType} onValueChange={(v) => setAircraftType(v as "A320" | "B737")}>
                      <SelectTrigger id="aircraft">
                        <SelectValue placeholder="Aircraft Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A320">Airbus A320</SelectItem>
                        <SelectItem value="B737">Boeing 737</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="round-trip" checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
                  <Label htmlFor="round-trip">Include Return Flight</Label>
                </div>

                {icaoResult && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Flight Type:</span>
                      <span className="text-sm">{icaoResult.flightType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Flight Distance:</span>
                      <span className="text-sm">
                        {Math.round(icaoResult.distanceKm).toLocaleString()} km
                        {isRoundTrip && " (including return)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Corrected Distance:</span>
                      <span className="text-sm">
                        {Math.round(icaoResult.correctedDistanceKm).toLocaleString()} km
                        <Info className="inline-block ml-1 h-3 w-3" title="Includes routing inefficiencies" />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Fuel Consumption:</span>
                      <span className="text-sm">{Math.round(icaoResult.fuelConsumption).toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Per Passenger:</span>
                      <span className="text-sm">{(icaoResult.perPassenger).toFixed(2)} tonnes CO₂</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-sm font-medium">Total CO₂ Emissions:</span>
                      <span className="text-sm font-bold text-red-500">
                        {Math.round(icaoResult.totalEmissions).toLocaleString()} tonnes
                      </span>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="simple" className="space-y-4 mt-0">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch id="simple-round-trip" checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
                  <Label htmlFor="simple-round-trip">Include Return Flight</Label>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Flight Distance:</span>
                    <span className="text-sm">
                      {Math.round(match.match_emissions?.[0]?.distance || 0).toLocaleString()} km
                      {isRoundTrip && " (including return)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Team Size:</span>
                    <span className="text-sm">35 passengers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Aircraft Type:</span>
                    <span className="text-sm">Medium-haul Commercial</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-sm font-medium">Total CO₂ Emissions:</span>
                    <span className="text-sm font-bold text-red-500">
                      {Math.round(match.match_emissions?.[0]?.emissions || 0).toLocaleString()} tonnes
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
