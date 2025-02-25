"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import type { Match } from "@/lib/types"
import { PlaneIcon } from "@/components/icons"
import { Car, Trees, Lightbulb, Home } from "lucide-react"
import { calculateDistance, calculateEmissions } from "@/lib/calculations"

interface MatchWithDetails extends Match {
  home_airport?: {
    iata_code: string
    airport_name: string
    latitude: number
    longitude: number
  }
  away_airport?: {
    iata_code: string
    airport_name: string
    latitude: number
    longitude: number
  }
  match_emissions?: {
    emissions: number
    distance: number
  }[]
}

interface Equivalency {
  icon: React.ElementType
  title: string
  value: string
  description: string
}

export default function EmissionsPage() {
  const searchParams = useSearchParams()
  const matchId = searchParams.get("match")
  const [match, setMatch] = useState<MatchWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRoundTrip, setIsRoundTrip] = useState(false) // Default to one-way
  const [baseDistance, setBaseDistance] = useState(0) // Store one-way distance
  const [baseEmissions, setBaseEmissions] = useState(0) // Store one-way emissions

  // Calculate current values based on round trip setting
  const currentDistance = isRoundTrip ? baseDistance * 2 : baseDistance
  const currentEmissions = isRoundTrip ? baseEmissions * 2 : baseEmissions

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
        const [homeAirport, awayAirport] = await Promise.all([
          supabase.from("airports").select("*").eq("team_id", matchData.home_team_id).single(),
          supabase.from("airports").select("*").eq("team_id", matchData.away_team_id).single(),
        ])

        if (homeAirport.data && awayAirport.data) {
          // Calculate one-way base values
          const distance = calculateDistance(
            homeAirport.data.latitude,
            homeAirport.data.longitude,
            awayAirport.data.latitude,
            awayAirport.data.longitude,
            false,
          )
          const emissions = calculateEmissions(distance, 35, false)

          setBaseDistance(distance)
          setBaseEmissions(emissions)

          setMatch({
            ...matchData,
            home_airport: homeAirport.data,
            away_airport: awayAirport.data,
            match_emissions: [
              {
                emissions: isRoundTrip ? emissions * 2 : emissions,
                distance: isRoundTrip ? distance * 2 : distance,
              },
            ],
          })
        } else {
          setMatch({
            ...matchData,
            home_airport: homeAirport.data,
            away_airport: awayAirport.data,
            match_emissions: [{ emissions: 0, distance: 0 }],
          })
        }
      }

      setLoading(false)
    }

    fetchMatchDetails()
  }, [matchId, isRoundTrip])

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

  const equivalencies = calculateEquivalencies(currentEmissions)

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
            <CardTitle>ICAO Emissions Calculation</CardTitle>
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
              <div className="flex items-center space-x-2 mb-4">
                <Switch id="round-trip" checked={isRoundTrip} onCheckedChange={setIsRoundTrip} />
                <Label htmlFor="round-trip">Include Return Flight</Label>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Flight Distance:</span>
                  <span className="text-sm">
                    {Math.round(currentDistance).toLocaleString()} km
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
                    {Math.round(currentEmissions).toLocaleString()} tonnes
                    {isRoundTrip && " (including return)"}
                  </span>
                </div>
              </div>
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

