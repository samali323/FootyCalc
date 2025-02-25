"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import type { Team } from "@/lib/types"

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    async function fetchTeams() {
      const { data, error } = await supabase.from("teams").select("*").order("name")

      if (error) {
        console.error("Error fetching teams:", error)
        return
      }

      if (data) {
        setTeams(data)
      }
    }

    fetchTeams()
  }, [])

  return (
    <div className="p-6 lg:ml-64">
      <h1 className="text-3xl font-bold mb-6">Teams</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.team_id}>
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">City:</span> {team.city}
                </p>
                <p>
                  <span className="font-semibold">Country:</span> {team.country}
                </p>
                <p>
                  <span className="font-semibold">Stadium:</span> {team.stadium}
                </p>
                <p>
                  <span className="font-semibold">Capacity:</span> {team.capacity?.toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Founded:</span> {team.founded}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

