"use client"

import { forwardRef, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import CountUp from "react-countup"
import { Card, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MapPin, Trophy, Calendar, Users, Star, ArrowRight } from "lucide-react"
import Link from "next/link"

export const TopFootballClubs = forwardRef<HTMLElement>((props, ref) => {
  const [selectedClub, setSelectedClub] = useState("real_madrid")
  const [selectedLeague, setSelectedLeague] = useState("all")
  const [startAnimation, setStartAnimation] = useState({
    totalTrophies: false,
    leagueTitles: false,
    championsLeague: false,
  })

  const clubs = {
    real_madrid: {
      name: "Real Madrid",
      league: "La Liga",
      location: "Madrid, Spain",
      founded: 1902,
      stadium: "Santiago Bernabéu",
      capacity: "81,044",
      manager: "Carlo Ancelotti",
      matches: 42,
      trophies: {
        domestic: 35,
        champions: 14,
        total: 99,
      },
      image: "/pictures/gettyimages-2155639368-1024x1024.jpg",
      logo: "/pictures/gettyimages-89416970-1024x1024.jpg",
      stadiumImage: "/placeholder.svg?height=300&width=500",
      topPlayers: ["Jude Bellingham", "Vinícius Júnior", "Kylian Mbappé"],
      achievements: [
        "Most UEFA Champions League titles (14)",
        "Most La Liga titles (35)",
        "FIFA Club of the 20th Century",
      ],
      colors: "White and Gold",
    },
    barcelona: {
      name: "FC Barcelona",
      league: "La Liga",
      location: "Barcelona, Spain",
      founded: 1899,
      stadium: "Camp Nou",
      capacity: "99,354",
      manager: "Hansi Flick",
      matches: 40,
      trophies: {
        domestic: 26,
        champions: 5,
        total: 75,
      },
      image: "/pictures/gettyimages-2212148617-1024x1024.jpg",
      logo: "/pictures/FC_Barcelona_(crest).svg.png",
      stadiumImage: "/placeholder.svg?height=300&width=500",
      topPlayers: ["Robert Lewandowski", "Lamine Yamal", "Pedri"],
      achievements: [
        "Only European club to win the treble twice",
        "Six trophies in a single year (2009)",
        "Pioneered tiki-taka football style",
      ],
      colors: "Blue and Garnet",
    },
    manchester_united: {
      name: "Manchester United",
      league: "Premier League",
      location: "Manchester, England",
      founded: 1878,
      stadium: "Old Trafford",
      capacity: "74,140",
      manager: "Erik ten Hag",
      matches: 38,
      trophies: {
        domestic: 20,
        champions: 3,
        total: 66,
      },
      image: "/pictures/manchester-united (1).jpg",
      logo: "/pictures/manchester-united-logo.jpg",
      stadiumImage: "/placeholder.svg?height=300&width=500",
      topPlayers: ["Bruno Fernandes", "Marcus Rashford", "Kobbie Mainoo"],
      achievements: [
        "First English treble winners (1999)",
        "Most Premier League titles (13)",
        "Record 20 English league titles",
      ],
      colors: "Red, White and Black",
    },
    bayern_munich: {
      name: "Bayern Munich",
      league: "Bundesliga",
      location: "Munich, Germany",
      founded: 1900,
      stadium: "Allianz Arena",
      capacity: "75,000",
      manager: "Vincent Kompany",
      matches: 39,
      trophies: {
        domestic: 33,
        champions: 6,
        total: 82,
      },
      image: "/pictures/bayern-munich.jpg",
      logo: "/pictures/bayern-munich-logo.jpg",
      stadiumImage: "/placeholder.svg?height=300&width=500",
      topPlayers: ["Harry Kane", "Jamal Musiala", "Joshua Kimmich"],
      achievements: [
        "Record 33 Bundesliga titles",
        "Only German club to win the treble",
        "11 consecutive Bundesliga titles (2013-2023)",
      ],
      colors: "Red and White",
    },
    psg: {
      name: "Paris Saint-Germain",
      league: "Ligue 1",
      location: "Paris, France",
      founded: 1970,
      stadium: "Parc des Princes",
      capacity: "47,929",
      manager: "Luis Enrique",
      matches: 38,
      trophies: {
        domestic: 12,
        champions: 0,
        total: 47,
      },
      image: "/pictures/paris-saint-germain.jpg",
      logo: "/pictures/paris-saint-germain-logo.jpg",
      stadiumImage: "/placeholder.svg?height=300&width=500",
      topPlayers: ["Ousmane Dembélé", "Gianluigi Donnarumma", "Warren Zaïre-Emery"],
      achievements: [
        "Record 12 Ligue 1 titles",
        "Record 14 Coupe de France titles",
        "Champions League finalist (2020)",
      ],
      colors: "Blue, Red and White",
    },
    juventus: {
      name: "Juventus",
      league: "Serie A",
      location: "Turin, Italy",
      founded: 1897,
      stadium: "Allianz Stadium",
      capacity: "41,507",
      manager: "Thiago Motta",
      matches: 38,
      trophies: {
        domestic: 36,
        champions: 2,
        total: 70,
      },
      image: "/pictures/juventus.jpg",
      logo: "/pictures/juventus-logo.jpg",
      stadiumImage: "/placeholder.svg?height=300&width=500",
      topPlayers: ["Dušan Vlahović", "Federico Chiesa", "Nicolò Fagioli"],
      achievements: [
        "Record 36 Serie A titles",
        "Nine consecutive Serie A titles (2012-2020)",
        "First club to win all three major UEFA competitions",
      ],
      colors: "Black and White",
    },
  }

  const filteredClubs =
    selectedLeague === "all"
      ? Object.entries(clubs)
      : Object.entries(clubs).filter(([_, club]) => club.league === selectedLeague)

  const selectedClubData = clubs[selectedClub as keyof typeof clubs]

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-[#0f172a] to-[#1e293b] relative overflow-hidden w-full">
      <div className="absolute inset-0">
        {/* Animated particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="bg-particle"
            style={{
              width: Math.random() * 80 + 20,
              height: Math.random() * 80 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: "rgba(139, 92, 246, 0.25)", // Darker for better visibility
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              World's <span className="text-purple-400">Elite</span> Football Clubs
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Explore the most prestigious football clubs, their rich histories, and legendary achievements
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left sidebar - Club selection */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-gray-800">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-purple-400" />
                Filter by League
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={selectedLeague === "all" ? "default" : "outline"}
                  onClick={() => setSelectedLeague("all")}
                  className={selectedLeague === "all" ? "bg-purple-500 hover:bg-purple-600" : "text-gray-300"}
                  size="sm"
                >
                  All Leagues
                </Button>
                <Button
                  variant={selectedLeague === "Premier League" ? "default" : "outline"}
                  onClick={() => setSelectedLeague("Premier League")}
                  className={
                    selectedLeague === "Premier League" ? "bg-purple-500 hover:bg-purple-600" : "text-gray-300"
                  }
                  size="sm"
                >
                  Premier League
                </Button>
                <Button
                  variant={selectedLeague === "La Liga" ? "default" : "outline"}
                  onClick={() => setSelectedLeague("La Liga")}
                  className={selectedLeague === "La Liga" ? "bg-purple-500 hover:bg-purple-600" : "text-gray-300"}
                  size="sm"
                >
                  La Liga
                </Button>
                <Button
                  variant={selectedLeague === "Bundesliga" ? "default" : "outline"}
                  onClick={() => setSelectedLeague("Bundesliga")}
                  className={selectedLeague === "Bundesliga" ? "bg-purple-500 hover:bg-purple-600" : "text-gray-300"}
                  size="sm"
                >
                  Bundesliga
                </Button>
                <Button
                  variant={selectedLeague === "Serie A" ? "default" : "outline"}
                  onClick={() => setSelectedLeague("Serie A")}
                  className={selectedLeague === "Serie A" ? "bg-purple-500 hover:bg-purple-600" : "text-gray-300"}
                  size="sm"
                >
                  Serie A
                </Button>
                <Button
                  variant={selectedLeague === "Ligue 1" ? "default" : "outline"}
                  onClick={() => setSelectedLeague("Ligue 1")}
                  className={selectedLeague === "Ligue 1" ? "bg-purple-500 hover:bg-purple-600" : "text-gray-300"}
                  size="sm"
                >
                  Ligue 1
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
              {filteredClubs.map(([id, club]) => (
                <motion.div key={id} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <div
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-300 ${selectedClub === id
                      ? "bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/10"
                      : "bg-[#1e293b] border-gray-800 hover:border-gray-700"
                      }`}
                    onClick={() => setSelectedClub(id)}
                  >
                    <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4 flex-shrink-0 bg-white p-1">
                      <Image
                        src={club.logo || "/placeholder.svg"}
                        alt={`${club.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-white font-medium">{club.name}</h3>
                      <div className="flex items-center text-gray-400 text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{club.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge className="bg-purple-500 mb-1">{club.league}</Badge>
                      <div className="flex items-center text-amber-400 text-xs">
                        <Trophy className="h-3 w-3 mr-1" />
                        <span>{club.trophies.total} trophies</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right content - Club details */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedClub}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-[#1e293b] border-gray-800 overflow-hidden">
                  <div className="relative h-64">
                    <Image
                      src={selectedClubData.image || "/placeholder.svg"}
                      alt={selectedClubData.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 flex items-center">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white mr-4 bg-white p-1">
                        <Image
                          src={selectedClubData.logo || "/placeholder.svg"}
                          alt={`${selectedClubData.name} logo`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">{selectedClubData.name}</h2>
                        <div className="flex items-center text-gray-300">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{selectedClubData.location}</span>
                          <span className="mx-2">•</span>
                          <span>Est. {selectedClubData.founded}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="overview" className="sm:p-6">
                    <TabsList className="grid grid-cols-3 mb-6">
                      <TabsTrigger className="text-xs sm:text-sm" value="overview">Overview</TabsTrigger>
                      <TabsTrigger className="text-xs sm:text-sm" value="achievements">Achievements</TabsTrigger>
                      <TabsTrigger className="text-xs sm:text-sm" value="stadium">Stadium</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      <motion.div
                        onViewportEnter={() =>
                          setStartAnimation({
                            totalTrophies: true,
                            leagueTitles: true,
                            championsLeague: true,
                          })
                        }
                        viewport={{ once: true }}
                        className="grid grid-cols-3 gap-4"
                      >
                        <div className="bg-[#0f172a] rounded-lg p-4 text-center">
                          <Trophy className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                          <p className="text-gray-400 text-xs">Total Trophies</p>
                          <div className="flex justify-center items-end">
                            {startAnimation.totalTrophies ? (
                              <>
                                <CountUp
                                  end={selectedClubData.trophies.total}
                                  duration={3}
                                  separator=","
                                  className="text-white font-semibold text-xl"
                                />
                                <span className="text-white font-semibold text-xl ml-1">+</span>
                              </>
                            ) : (
                              <span className="text-white font-semibold text-xl">0</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-[#0f172a] rounded-lg p-4 text-center">
                          <Star className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                          <p className="text-gray-400 text-xs">League Titles</p>
                          <div className="flex justify-center items-end">
                            {startAnimation.leagueTitles ? (
                              <>
                                <CountUp
                                  end={selectedClubData.trophies.domestic}
                                  duration={3}
                                  separator=","
                                  className="text-white font-semibold text-xl"
                                />
                              </>
                            ) : (
                              <span className="text-white font-semibold text-xl">0</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-[#0f172a] rounded-lg p-4 text-center">
                          <Trophy className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                          <p className="text-gray-400 text-xs">Champions League</p>
                          <div className="flex justify-center items-end">
                            {startAnimation.championsLeague ? (
                              <>
                                <CountUp
                                  end={selectedClubData.trophies.champions}
                                  duration={3}
                                  separator=","
                                  className="text-white font-semibold text-xl"
                                />
                              </>
                            ) : (
                              <span className="text-white font-semibold text-xl">0</span>
                            )}
                          </div>
                        </div>
                      </motion.div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-white font-medium mb-3 flex items-center">
                            <Users className="h-4 w-4 mr-2 text-purple-400" />
                            Key Players
                          </h3>
                          <ul className="space-y-2">
                            {selectedClubData.topPlayers.map((player, index) => (
                              <li key={index} className="flex items-start">
                                <svg
                                  className="h-5 w-5 text-purple-400 mt-0.5 mr-2"
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
                                <p className="text-gray-300">{player}</p>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-white font-medium mb-3 flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                            Club Details
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Manager:</span>
                              <span className="text-white">{selectedClubData.manager}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">League:</span>
                              <span className="text-white">{selectedClubData.league}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Colors:</span>
                              <span className="text-white">{selectedClubData.colors}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="achievements" className="space-y-6">
                      <div className="bg-[#0f172a] rounded-lg p-5 border border-gray-800">
                        <h3 className="text-white font-medium mb-4 flex items-center">
                          <Trophy className="h-5 w-5 mr-2 text-amber-400" />
                          Major Achievements
                        </h3>
                        <ul className="space-y-3">
                          {selectedClubData.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start">
                              <div className="bg-purple-500/20 rounded-full p-1 mr-3 mt-0.5">
                                <svg
                                  className="h-4 w-4 text-purple-400"
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
                              </div>
                              <p className="text-gray-300">{achievement}</p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <motion.div
                        onViewportEnter={() =>
                          setStartAnimation({
                            totalTrophies: true,
                            leagueTitles: true,
                            championsLeague: true,
                          })
                        }
                        viewport={{ once: true }}
                        className="grid grid-cols-3 gap-2 sm:gap-4"
                      >
                        <div className="bg-gradient-to-br from-amber-500/20 to-amber-700/20 rounded-lg p-4 text-center border border-amber-500/30">
                          <Trophy className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                          <p className="text-gray-300 text-xs sm:text-sm">Domestic Titles</p>
                          <div className="flex justify-center items-end">
                            {startAnimation.leagueTitles ? (
                              <>
                                <CountUp
                                  end={selectedClubData.trophies.domestic}
                                  duration={3}
                                  separator=","
                                  className="text-amber-400 font-bold text-3xl"
                                />
                                <span className="text-amber-400 font-bold text-3xl ml-1">+</span>
                              </>
                            ) : (
                              <span className="text-amber-400 font-bold text-3xl">0</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 rounded-lg p-4 text-center border border-blue-500/30">
                          <Trophy className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                          <p className="text-gray-300 text-xs sm:text-sm">Champions League</p>
                          <div className="flex justify-center items-end">
                            {startAnimation.championsLeague ? (
                              <>
                                <CountUp
                                  end={selectedClubData.trophies.champions}
                                  duration={3}
                                  separator=","
                                  className="text-blue-400 font-bold text-3xl"
                                />
                                {/* <span className="text-blue-400 font-bold text-3xl ml-1">+</span> */}
                              </>
                            ) : (
                              <span className="text-blue-400 font-bold text-3xl">0</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 rounded-lg p-4 text-center border border-purple-500/30">
                          <Trophy className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                          <p className="text-gray-300 text-xs sm:text-sm">Total Trophies</p>
                          <div className="flex justify-center items-end">
                            {startAnimation.totalTrophies ? (
                              <>
                                <CountUp
                                  end={selectedClubData.trophies.total}
                                  duration={3}
                                  separator=","
                                  className="text-purple-400 font-bold text-3xl"
                                />
                                <span className="text-purple-400 font-bold text-3xl ml-1">+</span>
                              </>
                            ) : (
                              <span className="text-purple-400 font-bold text-3xl">0</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="stadium" className="space-y-6">
                      <div className="relative h-64 rounded-lg overflow-hidden">
                        <Image
                          src={selectedClubData.stadiumImage || "/placeholder.svg"}
                          alt={selectedClubData.stadium}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                          <div className="p-4">
                            <h3 className="text-2xl font-bold text-white">{selectedClubData.stadium}</h3>
                            <p className="text-gray-300">Capacity: {selectedClubData.capacity} seats</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0f172a] rounded-lg p-4">
                          <h4 className="text-white font-medium mb-2">Stadium Features</h4>
                          <ul className="space-y-2">
                            <li className="flex items-center text-gray-300">
                              <svg
                                className="h-4 w-4 text-purple-400 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              State-of-the-art facilities
                            </li>
                            <li className="flex items-center text-gray-300">
                              <svg
                                className="h-4 w-4 text-purple-400 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Premium hospitality areas
                            </li>
                            <li className="flex items-center text-gray-300">
                              <svg
                                className="h-4 w-4 text-purple-400 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Club museum and tour
                            </li>
                          </ul>
                        </div>
                        <div className="bg-[#0f172a] rounded-lg p-4">
                          <h4 className="text-white font-medium mb-2">Stadium History</h4>
                          <p className="text-gray-300 text-sm">
                            Home to {selectedClubData.name} since its construction, this iconic venue has hosted
                            numerous historic matches including Champions League finals and international fixtures.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <CardFooter className="px-6 pb-6 pt-6 sm:pt-0">
                    <Link href="/teams" className="w-full">
                      <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                        <span className="flex items-center">
                          View Full Club Profile
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
})