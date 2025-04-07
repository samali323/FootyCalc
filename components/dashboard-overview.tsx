"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Trophy, Users, BarChart2, TrendingUp, Plane, MapPin, Clock, Flag } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

// Define the type for the dashboard props
interface DashboardOverviewProps {
  stats: {
    leagues: number
    teams: number
    matches: number
    seasons: number
    airports: number
    upcomingMatches: number
  },
  latestMatches: Array<any>,
  upcomingMatches: Array<any>,
  currentSeason: any,
  previousSeason: any,
  oldestSeason: any
}

const DashboardOverview = ({
  stats,
  latestMatches = [],
  upcomingMatches = [],
  currentSeason,
  previousSeason,
  oldestSeason
}: DashboardOverviewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <BarChart2 className="mr-2 h-6 w-6 text-emerald-500" />
          Dashboard Overview
        </h2>
        <div className="text-sm text-gray-400 flex items-center">
          <TrendingUp className="mr-1 h-4 w-4 text-emerald-400" />
          Updated just now
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Leagues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 rounded-lg bg-emerald-600/20 p-2">
                <Trophy className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.leagues}</div>
                <div className="text-xs text-gray-400">Active leagues</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 rounded-lg bg-emerald-600/20 p-2">
                <Users className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.teams}</div>
                <div className="text-xs text-gray-400">Registered teams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 rounded-lg bg-emerald-600/20 p-2">
                <Flag className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.matches}</div>
                <div className="text-xs text-gray-400">Total fixtures</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Seasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 rounded-lg bg-emerald-600/20 p-2">
                <Calendar className="h-8 w-8 text-emerald-400" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.seasons}</div>
                <div className="text-xs text-gray-400">Available seasons</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Airports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 rounded-lg bg-emerald-600/20 p-2">
                <Plane className="h-8 w-8 text-emerald-400" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.airports}</div>
                <div className="text-xs text-gray-400">Team airports</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:translate-y-[-2px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 rounded-lg bg-amber-600/20 p-2">
                <Clock className="h-8 w-8 text-amber-400" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.upcomingMatches}</div>
                <div className="text-xs text-gray-400">Upcoming matches</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Matches Card */}
        <Card className="bg-gray-900 border-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-300">Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {latestMatches.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No recent matches found</p>
            ) : (
              <div className="space-y-4">
                {latestMatches.map((match) => (
                  <div key={match.match_id} className="bg-gray-800/50 p-3 rounded-md border border-gray-700 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{match.home_team}</span>
                        <span className="text-xs text-gray-400">vs</span>
                        <span className="text-sm font-medium text-white">{match.away_team}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {match.stadium}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">
                      {new Date(match.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Matches Card */}
        <Card className="bg-gray-900 border-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-300">Upcoming Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMatches.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No upcoming matches found</p>
            ) : (
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <div key={match.match_id} className="bg-gray-800/50 p-3 rounded-md border border-gray-700 flex items-center justify-between group hover:bg-gray-800 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{match.home_team}</span>
                        <span className="text-xs text-gray-400">vs</span>
                        <span className="text-sm font-medium text-white">{match.away_team}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {match.stadium}
                      </div>
                    </div>
                    <div className="text-sm text-emerald-400 flex flex-col items-end">
                      <div>{new Date(match.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(match.date), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300">Seasons Data Overview</h3>
          <span className="text-xs text-emerald-400">{stats.seasons} total seasons</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <div className="text-xs text-gray-400">Current Season</div>
            <div className="text-sm font-medium text-white mt-1">
              {currentSeason ? currentSeason.season_id : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <div className="text-xs text-gray-400">Previous Season</div>
            <div className="text-sm font-medium text-white mt-1">
              {previousSeason ? previousSeason.season_id : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <div className="text-xs text-gray-400">Oldest Season</div>
            <div className="text-sm font-medium text-white mt-1">
              {oldestSeason ? oldestSeason.season_id : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <div className="text-xs text-gray-400">Avg. Matches/Season</div>
            <div className="text-sm font-medium text-white mt-1">
              {stats.seasons > 0 ? Math.round(stats.matches / stats.seasons) : 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview