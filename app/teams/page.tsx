"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import type { Team } from "@/lib/types"
import { Leaf, Trophy, MapPin, Users, Building, Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const teamsPerPage = 6

  // Debounce search input to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setPage(1) // Reset to first page when search changes
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    async function fetchTeams() {
      setIsLoading(true)
      
      let query = supabase.from("teams").select("*", { count: "exact" })
      
      // Apply search filter if query exists
      if (debouncedSearchQuery) {
        query = query.or(
          `name.ilike.%${debouncedSearchQuery}%,` + 
          `city.ilike.%${debouncedSearchQuery}%,` +
          `country.ilike.%${debouncedSearchQuery}%,` +
          `stadium.ilike.%${debouncedSearchQuery}%`
        )
      }
      
      // Get count for pagination
      const countQuery = query.select("team_id")
      const { count, error: countError } = await countQuery
      
      if (countError) {
        console.error("Error counting teams:", countError)
      } else if (count !== null) {
        setTotalPages(Math.ceil(count / teamsPerPage))
      }
      
      // Fetch paginated teams with same filter
      let dataQuery = supabase.from("teams").select("*")
      
      // Apply the same search filter
      if (debouncedSearchQuery) {
        dataQuery = dataQuery.or(
          `name.ilike.%${debouncedSearchQuery}%,` + 
          `city.ilike.%${debouncedSearchQuery}%,` +
          `country.ilike.%${debouncedSearchQuery}%,` +
          `stadium.ilike.%${debouncedSearchQuery}%`
        )
      }
      
      // Add ordering and pagination
      const { data, error } = await dataQuery
        .order("name")
        .range((page - 1) * teamsPerPage, page * teamsPerPage - 1)
      
      if (error) {
        console.error("Error fetching teams:", error)
      } else if (data) {
        setTeams(data)
      }
      
      setIsLoading(false)
    }
    
    fetchTeams()
  }, [page, debouncedSearchQuery])

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

  // Function to get a random emission reduction percentage for demo purposes
  const getRandomEmissionReduction = () => {
    return Math.floor(Math.random() * 30) + 5
  }

  return (
    <div className="w-full">
      {/* Page header with title and description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Teams</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          View and manage all teams tracking their carbon emissions
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
          <Input
            type="text"
            placeholder="Search teams by name, city, country or stadium..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-800 dark:border-emerald-800 bg-gray-900 text-white focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>
        {debouncedSearchQuery && (
          <div className="mt-2 text-sm text-emerald-500">
            Showing results for "{debouncedSearchQuery}"
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(teamsPerPage)].map((_, i) => (
            <Card key={i} className="bg-gray-900 animate-pulse h-64 border-gray-800">
              <div className="h-full"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const emissionReduction = getRandomEmissionReduction()
            return (
              <Card 
                key={team.team_id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-gray-900 border-gray-800"
              >
                <div className="h-2 bg-gradient-to-r from-emerald-900 to-emerald-700 rounded-t-lg" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 flex items-center justify-center bg-emerald-900/50 rounded-lg mr-3">
                        <Trophy className="h-5 w-5 text-emerald-500" />
                      </div>
                      <CardTitle className="text-xl text-white">{team.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
                      <span>{team.city}, {team.country}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Building className="h-4 w-4 mr-2 text-emerald-500" />
                      <span>{team.stadium}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="h-4 w-4 mr-2 text-emerald-500" />
                      <span>Capacity: {team.capacity?.toLocaleString() || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
                      <span>Founded: {team.founded || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {teams.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
          <Leaf className="mx-auto h-12 w-12 text-emerald-600" />
          <h3 className="mt-2 text-lg font-medium text-white">
            {debouncedSearchQuery ? "No teams match your search" : "No teams found"}
          </h3>
          <p className="mt-1 text-gray-400">
            {debouncedSearchQuery 
              ? "Try adjusting your search term or clear the search to see all teams."
              : "Get started by adding your first team."}
          </p>
          {debouncedSearchQuery && (
            <Button 
              onClick={() => setSearchQuery("")}
              className="mt-4 bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Pagination controls */}
      {!isLoading && teams.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Showing page {page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handlePreviousPage} 
              disabled={page === 1}
              className="flex items-center bg-gray-900 border-emerald-800 hover:bg-gray-800 text-emerald-500"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button 
              onClick={handleNextPage} 
              disabled={page === totalPages}
              className="flex items-center bg-gray-900 border-emerald-800 hover:bg-gray-800 text-emerald-500"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}