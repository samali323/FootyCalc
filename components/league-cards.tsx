"use client"

import { forwardRef, useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Trophy, Users, Calendar, MapPin, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import CountUp from "react-countup"
import Link from "next/link"

interface League {
  id: number
  league_id: string
  name: string
  images: string[]
  logo: string
  teams: number
  matches: number
  founded: number | string
  color: string
  season: string
  headquarters: string
  topTeams: string[]
  topScorers: string[]
  mostTitles: { team: string; count: number }
  recentWinners: { year: string; team: string }[]
  revenue: string
  viewership: string
  stadiumAvgCapacity: string
  facts: string[]
  emissions: {
    total: string
    perMatch: string
    perTeam: string
    transportPercent: number
    stadiumPercent: number
    otherPercent: number
    yearlyReduction: number
    sustainabilityRating: string
    sustainabilityInitiatives: string[]
  }
}

export const LeagueCards = forwardRef<HTMLElement>((props, ref) => {
  const leagues: League[] = [
    {
      id: 1,
      league_id: "4480",
      name: "UEFA Champions League",
      images: ["/placeholder.svg?height=300&width=600"],
      logo: "/placeholder.svg?height=100&width=100",
      teams: 32,
      matches: 125,
      founded: 1955,
      color: "from-blue-600 to-indigo-800",
      season: "2024-2025",
      headquarters: "Nyon, Switzerland",
      topTeams: ["Real Madrid", "Bayern Munich", "Liverpool"],
      topScorers: ["Cristiano Ronaldo (140)", "Lionel Messi (129)", "Robert Lewandowski (91)"],
      mostTitles: { team: "Real Madrid", count: 14 },
      recentWinners: [
        { year: "2023", team: "Manchester City" },
        { year: "2022", team: "Real Madrid" },
        { year: "2021", team: "Chelsea" },
      ],
      revenue: "€3.5 billion",
      viewership: "380 million per matchday",
      stadiumAvgCapacity: "52,000",
      facts: [
        "Most prestigious club competition in the world",
        "Famous anthem composed by Tony Britten",
        "Iconic starball logo represents excellence",
      ],
      emissions: {
        total: "28,000",
        perMatch: "224",
        perTeam: "875",
        transportPercent: 68,
        stadiumPercent: 22,
        otherPercent: 10,
        yearlyReduction: 8,
        sustainabilityRating: "B+",
        sustainabilityInitiatives: [
          "Carbon offsetting for team travel",
          "Solar-powered stadiums",
          "Plastic-free match days",
        ],
      },
    },
    {
      id: 2,
      league_id: "4328",
      name: "Premier League",
      images: ["/placeholder.svg?height=300&width=600"],
      logo: "/placeholder.svg?height=100&width=100",
      teams: 20,
      matches: 380,
      founded: 1992,
      color: "from-purple-600 to-indigo-800",
      season: "2024-2025",
      headquarters: "London, England",
      topTeams: ["Manchester City", "Arsenal", "Liverpool"],
      topScorers: ["Alan Shearer (260)", "Harry Kane (213)", "Wayne Rooney (208)"],
      mostTitles: { team: "Manchester United", count: 13 },
      recentWinners: [
        { year: "2024", team: "Manchester City" },
        { year: "2023", team: "Manchester City" },
        { year: "2022", team: "Manchester City" },
      ],
      revenue: "€6.6 billion",
      viewership: "3.2 billion cumulative global audience",
      stadiumAvgCapacity: "40,000",
      facts: [
        "Most-watched sports league in the world",
        "Broadcast in 212 territories to 643 million homes",
        "Highest revenue of any football league",
      ],
      emissions: {
        total: "19,500",
        perMatch: "51",
        perTeam: "975",
        transportPercent: 72,
        stadiumPercent: 18,
        otherPercent: 10,
        yearlyReduction: 15,
        sustainabilityRating: "B",
        sustainabilityInitiatives: [
          "Electric vehicle fleet for staff",
          "Rainwater harvesting for pitch irrigation",
          "Partnership with local environmental organizations",
        ],
      },
    },
    {
      id: 3,
      league_id: "4335",
      name: "La Liga",
      images: ["/placeholder.svg?height=300&width=600"],
      logo: "/placeholder.svg?height=100&width=100",
      teams: 20,
      matches: 380,
      founded: 1929,
      color: "from-red-600 to-orange-700",
      season: "2024-2025",
      headquarters: "Madrid, Spain",
      topTeams: ["Real Madrid", "Barcelona", "Atletico Madrid"],
      topScorers: ["Lionel Messi (474)", "Cristiano Ronaldo (311)", "Telmo Zarra (251)"],
      mostTitles: { team: "Real Madrid", count: 35 },
      recentWinners: [
        { year: "2024", team: "Real Madrid" },
        { year: "2023", team: "Barcelona" },
        { year: "2022", team: "Real Madrid" },
      ],
      revenue: "€3.3 billion",
      viewership: "2.8 billion cumulative global audience",
      stadiumAvgCapacity: "35,000",
      facts: [
        "Known for technical and tactical excellence",
        "El Clásico is one of the biggest sporting events globally",
        "Produced 19 Ballon d'Or winners",
      ],
      emissions: {
        total: "17,800",
        perMatch: "47",
        perTeam: "890",
        transportPercent: 65,
        stadiumPercent: 25,
        otherPercent: 10,
        yearlyReduction: 12,
        sustainabilityRating: "C+",
        sustainabilityInitiatives: [
          "Sustainable waste management program",
          "Energy-efficient lighting in stadiums",
          "Promoting public transport for fans",
        ],
      },
    },
    {
      id: 4,
      league_id: "4331",
      name: "Bundesliga",
      images: ["/placeholder.svg?height=300&width=600"],
      logo: "/placeholder.svg?height=100&width=100",
      teams: 18,
      matches: 306,
      founded: 1963,
      color: "from-red-600 to-yellow-600",
      season: "2024-2025",
      headquarters: "Frankfurt, Germany",
      topTeams: ["Bayern Munich", "Borussia Dortmund", "RB Leipzig"],
      topScorers: ["Robert Lewandowski (312)", "Gerd Müller (365)", "Klaus Fischer (268)"],
      mostTitles: { team: "Bayern Munich", count: 33 },
      recentWinners: [
        { year: "2024", team: "Bayer Leverkusen" },
        { year: "2023", team: "Bayern Munich" },
        { year: "2022", team: "Bayern Munich" },
      ],
      revenue: "€3.2 billion",
      viewership: "1.8 billion cumulative global audience",
      stadiumAvgCapacity: "45,000",
      facts: [
        "Highest average attendance in European football",
        "50+1 rule ensures fan ownership of clubs",
        "Known for developing young talent",
      ],
      emissions: {
        total: "15,200",
        perMatch: "50",
        perTeam: "844",
        transportPercent: 60,
        stadiumPercent: 30,
        otherPercent: 10,
        yearlyReduction: 18,
        sustainabilityRating: "A-",
        sustainabilityInitiatives: [
          "Carbon-neutral stadium operations",
          "Green energy sourcing",
          "Community tree planting initiatives",
        ],
      },
    },
    {
      id: 5,
      league_id: "4332",
      name: "Serie A",
      images: ["/placeholder.svg?height=300&width=600"],
      logo: "/placeholder.svg?height=100&width=100",
      teams: 20,
      matches: 380,
      founded: 1898,
      color: "from-blue-600 to-sky-500",
      season: "2024-2025",
      headquarters: "Milan, Italy",
      topTeams: ["Inter Milan", "AC Milan", "Juventus"],
      topScorers: ["Silvio Piola (274)", "Francesco Totti (250)", "Gunnar Nordahl (225)"],
      mostTitles: { team: "Juventus", count: 36 },
      recentWinners: [
        { year: "2024", team: "Inter Milan" },
        { year: "2023", team: "Napoli" },
        { year: "2022", team: "AC Milan" },
      ],
      revenue: "€2.5 billion",
      viewership: "1.5 billion cumulative global audience",
      stadiumAvgCapacity: "38,000",
      facts: [
        "Known for tactical discipline and defensive excellence",
        "Produced numerous world-class defenders",
        "Home to some of the oldest clubs in football history",
      ],
      emissions: {
        total: "16,500",
        perMatch: "43",
        perTeam: "825",
        transportPercent: 62,
        stadiumPercent: 28,
        otherPercent: 10,
        yearlyReduction: 10,
        sustainabilityRating: "C",
        sustainabilityInitiatives: [
          "Recycling programs in stadiums",
          "Promoting cycling to matches",
          "Educational campaigns on environmental awareness",
        ],
      },
    },
  ]

  const [activeTab, setActiveTab] = useState("overview")
  const [leaguesData, setLeaguesData] = useState<League[]>(leagues)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>(
    leagues.reduce((acc, league) => ({ ...acc, [league.id]: 0 }), {})
  )
  const [teamsData, setTeamsData] = useState<{ [key: string]: number }>({})
  const [matchesData, setMatchesData] = useState<{ [key: string]: number }>({})
  const [seasons, setSeasons] = useState<any[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // Step 1: Fetch seasons
      const { data: seasonsData, error: seasonsError } = await supabase
        .from("seasons")
        .select("*")
        .order("season_id", { ascending: false })

      if (seasonsError) {
        console.error("Error fetching seasons:", seasonsError)
        setError(seasonsError.message || "Failed to fetch seasons")
        return
      }

      if (seasonsData && seasonsData.length > 0) {
        setSeasons(seasonsData)
        setSelectedSeason(seasonsData[0].season_id)
      } else {
        setError("No seasons found")
        return
      }

      const currentSeason = seasonsData[0].season_id

      // Step 2: Fetch total matches from league_seasons table
      const { data: leagueSeasons, error: leagueSeasonsError } = await supabase
        .from("league_seasons")
        .select("league_id, total_matches")
        .eq("season_id", currentSeason)

      if (leagueSeasonsError) {
        console.error("Error fetching league seasons:", leagueSeasonsError)
        setError(leagueSeasonsError.message || "Failed to fetch league seasons")
        return
      }

      const matchesCount: { [key: string]: number } = {}
      leagueSeasons.forEach((ls: any) => {
        matchesCount[ls.league_id] = ls.total_matches || 0
      })
      setMatchesData(matchesCount)

      // Step 3: Fetch matches to calculate unique teams
      const teamsCount: { [key: string]: number } = {}
      for (const league of leaguesData) {
        const leagueId = league.league_id

        const { data: matches, error: matchesError } = await supabase
          .from("matches")
          .select("home_team_id, away_team_id")
          .eq("league_id", leagueId)
          .eq("season_id", currentSeason)

        if (matchesError) {
          console.error(`Error fetching matches for league ${leagueId}:`, matchesError)
          teamsCount[leagueId] = 0
          continue
        }

        // Extract unique team IDs using a Set
        const uniqueTeams = new Set<string>()
        matches.forEach((match: any) => {
          if (match.home_team_id) uniqueTeams.add(match.home_team_id)
          if (match.away_team_id) uniqueTeams.add(match.away_team_id)
        })

        teamsCount[leagueId] = uniqueTeams.size
      }
      setTeamsData(teamsCount)

      // Step 4: Fetch league details from TheSportsDB API
      const updatedLeagues = [...leaguesData]
      for (const league of updatedLeagues) {
        const response = await fetch(
          `https://www.thesportsdb.com/api/v1/json/594392/lookupleague.php?id=${league.league_id}`
        )
        const data = await response.json()
        const leagueInfo = data.leagues?.[0] || {}

        league.images = [
          leagueInfo.strFanart1 || league.images[0],
          leagueInfo.strFanart2 || league.images[0],
          leagueInfo.strFanart3 || league.images[0],
          leagueInfo.strFanart4 || league.images[0],
        ].filter((img) => img !== null)
        league.logo = leagueInfo.strBadge || league.logo
        league.founded = leagueInfo.intFormedYear || league.founded
        league.teams = teamsCount[league.league_id] || league.teams
        league.matches = matchesCount[league.league_id] || league.matches
        league.mostTitles = league.mostTitles || { team: "Unknown", count: 0 }
        league.topTeams = league.topTeams || []
        league.topScorers = league.topScorers || []
        league.recentWinners = league.recentWinners || []
        league.facts = league.facts || []
      }
      setLeaguesData(updatedLeagues)
    }

    fetchData()
  }, [])

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []

    leaguesData.forEach((league) => {
      const images = Array.isArray(league.images) ? league.images : [league.images || "/placeholder.svg?height=300&width=600"]
      if (images.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prev) => {
            const currentIdx = prev[league.id] || 0
            const nextIdx = (currentIdx + 1) % images.length
            return { ...prev, [league.id]: nextIdx }
          })
        }, 3000)
        intervals.push(interval)
      }
    })

    return () => intervals.forEach((interval) => clearInterval(interval))
  }, [leaguesData])

  if (error) {
    return <div className="text-center text-red-400 py-20">Error: {error}</div>
  }

  return (
    <section ref={ref} className="py-20 bg-[#1e293b] relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b] via-[#1e293b] to-[#0f172a]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Elite <span className="text-emerald-400">Football Leagues</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Explore the world's most prestigious football competitions and their rich histories
            </p>
          </motion.div>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full mb-12"
        >
          <CarouselContent className="p-3">
            {leaguesData.map((league, index) => (
              <CarouselItem key={league.id} className="md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="h-full"
                >
                  <Card className="bg-[#1e293b] border-gray-800 overflow-hidden h-full shadow-lg transition-all duration-300 hover:shadow-emerald-500/20 hover:border-emerald-500/30">
                    <div className="relative h-56 group">
                      <Image
                        src={(Array.isArray(league.images) ? league.images : [league.images || "/placeholder.svg?height=300&width=600"])[currentImageIndex[league.id] || 0] || "/placeholder.svg"}
                        alt={league.name}
                        fill
                        className="object-cover transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 group-hover:bg-transparent transition-all duration-500"></div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                        <div className="relative w-12 h-12">
                          <Image
                            src={league.logo || "/placeholder.svg"}
                            alt={`${league.name} logo`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-white text-center">{league.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid grid-cols-3 mb-4">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="stats">Stats</TabsTrigger>
                          <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0f172a] rounded-lg p-3 text-center">
                              <Users className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                              <p className="text-gray-400 text-xs">Teams</p>
                              <p className="text-white font-semibold text-lg">
                                <CountUp end={league.teams} duration={2} />
                              </p>
                            </div>
                            <div className="bg-[#0f172a] rounded-lg p-3 text-center">
                              <Calendar className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                              <p className="text-gray-400 text-xs">Matches</p>
                              <p className="text-white font-semibold text-lg">
                                <CountUp end={league.matches} duration={2} />
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">Founded:</span>
                              <span className="text-white text-sm">{league.founded}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">Season:</span>
                              <span className="text-white text-sm">{league.season}</span>
                            </div>
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                              <span className="text-white text-sm">{league.headquarters}</span>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="stats" className="space-y-4">
                          <div className="bg-[#0f172a] rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-gray-400 text-sm">Most Titles</span>
                              <Badge className="bg-emerald-500">{league.mostTitles?.team || "Unknown"}</Badge>
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="relative w-12 h-12 mr-3">
                                <Trophy className="w-12 h-12 text-amber-400" />
                              </div>
                              <span className="text-3xl font-bold text-white">
                                <CountUp end={league.mostTitles?.count || 0} duration={2} />
                              </span>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-white text-sm font-medium mb-2">Top Teams</h4>
                            <div className="flex flex-wrap gap-1">
                              {(league.topTeams || []).map((team, idx) => (
                                <Badge key={`${team}-${idx}`} variant="outline" className="text-xs">
                                  {team}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-400">Viewership:</span>
                              <span className="text-emerald-400">{league.viewership}</span>
                            </div>

                            <div>
                              <h4 className="text-white text-xs font-medium mb-2">Emission Sources</h4>
                              <div className="flex h-4 w-full rounded-full overflow-hidden bg-gray-800">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${league.emissions.transportPercent}%` }}
                                  transition={{ duration: 0.7 }}
                                  viewport={{ once: true }}
                                  className="bg-blue-500"
                                ></motion.div>
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${league.emissions.stadiumPercent}%` }}
                                  transition={{ duration: 0.7, delay: 0.2 }}
                                  viewport={{ once: true }}
                                  className="bg-emerald-500"
                                ></motion.div>
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${league.emissions.otherPercent}%` }}
                                  transition={{ duration: 0.7, delay: 0.4 }}
                                  viewport={{ once: true }}
                                  className="bg-amber-500"
                                ></motion.div>
                              </div>
                              <div className="flex text-xs mt-1 justify-between">
                                <span className="text-blue-400">Transport</span>
                                <span className="text-emerald-400">Stadium</span>
                                <span className="text-amber-400">Other</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-400">Sustainability Rating:</span>
                              <span
                                className={`font-bold ${league.emissions.sustainabilityRating.startsWith("A")
                                  ? "text-emerald-400"
                                  : league.emissions.sustainabilityRating.startsWith("B")
                                    ? "text-green-400"
                                    : league.emissions.sustainabilityRating.startsWith("C")
                                      ? "text-yellow-400"
                                      : league.emissions.sustainabilityRating.startsWith("D")
                                        ? "text-orange-400"
                                        : "text-red-400"
                                  }`}
                              >
                                {league.emissions.sustainabilityRating}
                              </span>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="history" className="space-y-4">
                          <div>
                            <h4 className="text-white text-sm font-medium mb-2">Recent Winners</h4>
                            <div className="space-y-2">
                              {(league.recentWinners || []).map((winner, idx) => (
                                <div key={`${winner.year}-${idx}`} className="flex justify-between items-center">
                                  <span className="text-gray-400 text-sm">{winner.year}:</span>
                                  <span className="text-white text-sm">{winner.team}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-white text-sm font-medium mb-2">Key Facts</h4>
                            <ul className="space-y-1">
                              {(league.facts || []).map((fact, i) => (
                                <li key={i} className="flex items-start">
                                  <svg
                                    className="h-4 w-4 text-emerald-400 mt-0.5 mr-1 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <span className="text-gray-300 text-xs">{fact}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>

                    <CardFooter className="p-6 pt-0">
                      <Link href="/matches" className="w-full">
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                          <span className="flex items-center">
                            View League Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8">
            <CarouselPrevious className="static transform-none mr-2 bg-emerald-500 hover:bg-emerald-600 text-white border-none" />
            <CarouselNext className="static transform-none ml-2 bg-emerald-500 hover:bg-emerald-600 text-white border-none" />
          </div>
        </Carousel>
      </div>
    </section>
  )
})