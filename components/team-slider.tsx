"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Trophy,
  Users,
  Calendar,
  Star,
  Award,
  Shirt,
  Banknote,
  Globe,
  ArrowRight,
} from "lucide-react"

export function TeamSlider() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const sliderRef = useRef<HTMLDivElement>(null)

  const teams = [
    {
      id: 1,
      name: "Real Madrid",
      location: "Madrid, Spain",
      stadium: "Santiago Bernabéu",
      capacity: "81,044",
      founded: "1902",
      image: "/placeholder.svg?height=400&width=600",
      logo: "/placeholder.svg?height=100&width=100",
      colors: "White and Gold",
      nickname: "Los Blancos",
      manager: "Carlo Ancelotti",
      president: "Florentino Pérez",
      website: "realmadrid.com",
      trophies: {
        champions: 14,
        league: 35,
        domestic: 20,
        total: 99,
      },
      players: [
        { name: "Jude Bellingham", position: "Midfielder", nationality: "England", number: 5 },
        { name: "Vinícius Júnior", position: "Forward", nationality: "Brazil", number: 7 },
        { name: "Kylian Mbappé", position: "Forward", nationality: "France", number: 9 },
      ],
      achievements: [
        "Most UEFA Champions League titles (14)",
        "Most La Liga titles (35)",
        "FIFA Club of the 20th Century",
      ],
      marketValue: "€1.2 billion",
      fanBase: "450 million worldwide",
      rivals: ["Barcelona", "Atlético Madrid", "Bayern Munich"],
    },
    {
      id: 2,
      name: "Manchester United",
      location: "Manchester, England",
      stadium: "Old Trafford",
      capacity: "74,140",
      founded: "1878",
      image: "/placeholder.svg?height=400&width=600",
      logo: "/placeholder.svg?height=100&width=100",
      colors: "Red, White and Black",
      nickname: "The Red Devils",
      manager: "Erik ten Hag",
      president: "Joel Glazer",
      website: "manutd.com",
      trophies: {
        champions: 3,
        league: 20,
        domestic: 25,
        total: 66,
      },
      players: [
        { name: "Bruno Fernandes", position: "Midfielder", nationality: "Portugal", number: 8 },
        { name: "Marcus Rashford", position: "Forward", nationality: "England", number: 10 },
        { name: "Kobbie Mainoo", position: "Midfielder", nationality: "England", number: 37 },
      ],
      achievements: [
        "First English treble winners (1999)",
        "Most Premier League titles (13)",
        "Record 20 English league titles",
      ],
      marketValue: "€950 million",
      fanBase: "670 million worldwide",
      rivals: ["Liverpool", "Manchester City", "Arsenal"],
    },
    {
      id: 3,
      name: "FC Barcelona",
      location: "Barcelona, Spain",
      stadium: "Camp Nou",
      capacity: "99,354",
      founded: "1899",
      image: "/placeholder.svg?height=400&width=600",
      logo: "/placeholder.svg?height=100&width=100",
      colors: "Blue and Garnet",
      nickname: "Blaugrana",
      manager: "Hansi Flick",
      president: "Joan Laporta",
      website: "fcbarcelona.com",
      trophies: {
        champions: 5,
        league: 26,
        domestic: 31,
        total: 75,
      },
      players: [
        { name: "Robert Lewandowski", position: "Forward", nationality: "Poland", number: 9 },
        { name: "Lamine Yamal", position: "Forward", nationality: "Spain", number: 19 },
        { name: "Pedri", position: "Midfielder", nationality: "Spain", number: 8 },
      ],
      achievements: [
        "Only European club to win the treble twice",
        "Six trophies in a single year (2009)",
        "Pioneered tiki-taka football style",
      ],
      marketValue: "€1.05 billion",
      fanBase: "400 million worldwide",
      rivals: ["Real Madrid", "Espanyol", "Atlético Madrid"],
    },
    {
      id: 4,
      name: "Bayern Munich",
      location: "Munich, Germany",
      stadium: "Allianz Arena",
      capacity: "75,000",
      founded: "1900",
      image: "/placeholder.svg?height=400&width=600",
      logo: "/placeholder.svg?height=100&width=100",
      colors: "Red and White",
      nickname: "Die Roten",
      manager: "Vincent Kompany",
      president: "Herbert Hainer",
      website: "fcbayern.com",
      trophies: {
        champions: 6,
        league: 33,
        domestic: 20,
        total: 82,
      },
      players: [
        { name: "Harry Kane", position: "Forward", nationality: "England", number: 9 },
        { name: "Jamal Musiala", position: "Midfielder", nationality: "Germany", number: 10 },
        { name: "Joshua Kimmich", position: "Midfielder", nationality: "Germany", number: 6 },
      ],
      achievements: [
        "Record 33 Bundesliga titles",
        "Only German club to win the treble",
        "11 consecutive Bundesliga titles (2013-2023)",
      ],
      marketValue: "€980 million",
      fanBase: "300 million worldwide",
      rivals: ["Borussia Dortmund", "1860 Munich", "Real Madrid"],
    },
    {
      id: 5,
      name: "Liverpool FC",
      location: "Liverpool, England",
      stadium: "Anfield",
      capacity: "61,276",
      founded: "1892",
      image: "/placeholder.svg?height=400&width=600",
      logo: "/placeholder.svg?height=100&width=100",
      colors: "Red",
      nickname: "The Reds",
      manager: "Arne Slot",
      president: "Tom Werner",
      website: "liverpoolfc.com",
      trophies: {
        champions: 6,
        league: 19,
        domestic: 17,
        total: 67,
      },
      players: [
        { name: "Mohamed Salah", position: "Forward", nationality: "Egypt", number: 11 },
        { name: "Virgil van Dijk", position: "Defender", nationality: "Netherlands", number: 4 },
        { name: "Trent Alexander-Arnold", position: "Defender", nationality: "England", number: 66 },
      ],
      achievements: [
        "Miracle of Istanbul comeback (2005)",
        "Only English club to win the treble of European trophies",
        "Unbeaten home record for 68 games (2017-2020)",
      ],
      marketValue: "€870 million",
      fanBase: "350 million worldwide",
      rivals: ["Manchester United", "Everton", "Manchester City"],
    },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (autoplay) {
      interval = setInterval(() => {
        setCurrent((prev) => (prev === teams.length - 1 ? 0 : prev + 1))
      }, 8000)
    }

    return () => clearInterval(interval)
  }, [autoplay, teams.length])

  const next = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev === teams.length - 1 ? 0 : prev + 1))
  }

  const prev = () => {
    setAutoplay(false)
    setCurrent((prev) => (prev === 0 ? teams.length - 1 : prev - 1))
  }

  return (
    <section className="py-20 bg-gradient-to-b from-[#0f172a] to-[#1e293b] relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-5"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Legendary <span className="text-emerald-400">Football Clubs</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Discover the rich history and achievements of the world's most prestigious football clubs
            </p>
          </motion.div>
        </div>

        <div className="relative" ref={sliderRef}>
          <div className="overflow-hidden rounded-xl">
            <div className="relative h-[600px] md:h-[650px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={teams[current].id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-transparent to-transparent z-10"></div>
                      <Image
                        src={teams[current].image || "/placeholder.svg"}
                        alt={teams[current].name}
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute bottom-0 left-0 p-6 z-20">
                        <Badge className="bg-emerald-500 mb-2">Est. {teams[current].founded}</Badge>
                        <div className="flex items-center">
                          <div className="relative w-16 h-16 bg-white rounded-full p-1 mr-4">
                            <Image
                              src={teams[current].logo || "/placeholder.svg"}
                              alt={`${teams[current].name} logo`}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-white">{teams[current].name}</h3>
                            <div className="flex items-center text-gray-300">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{teams[current].location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-8 flex flex-col">
                      <Tabs
                        defaultValue="overview"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex-grow"
                      >
                        <TabsList className="grid grid-cols-4 mb-6">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="trophies">Trophies</TabsTrigger>
                          <TabsTrigger value="players">Players</TabsTrigger>
                          <TabsTrigger value="facts">Facts</TabsTrigger>
                        </TabsList>

                        <TabsContent
                          value="overview"
                          className="space-y-6 h-[400px] overflow-y-auto pr-2 scrollbar-thin"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0f172a] rounded-lg p-4">
                              <div className="flex items-center text-gray-400 mb-1">
                                <Users className="h-4 w-4 mr-1" />
                                <span className="text-sm">Stadium Capacity</span>
                              </div>
                              <p className="text-white font-semibold">{teams[current].capacity}</p>
                            </div>
                            <div className="bg-[#0f172a] rounded-lg p-4">
                              <div className="flex items-center text-gray-400 mb-1">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span className="text-sm">Founded</span>
                              </div>
                              <p className="text-white font-semibold">{teams[current].founded}</p>
                            </div>
                          </div>

                          <div className="bg-[#0f172a] rounded-lg p-4">
                            <h4 className="text-white font-medium mb-3 flex items-center">
                              <Trophy className="h-4 w-4 mr-2 text-amber-400" />
                              Club Identity
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Nickname:</span>
                                <span className="text-white">{teams[current].nickname}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Colors:</span>
                                <span className="text-white">{teams[current].colors}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Manager:</span>
                                <span className="text-white">{teams[current].manager}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">President:</span>
                                <span className="text-white">{teams[current].president}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Website:</span>
                                <span className="text-emerald-400">{teams[current].website}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#0f172a] rounded-lg p-4">
                            <h4 className="text-white font-medium mb-3 flex items-center">
                              <Globe className="h-4 w-4 mr-2 text-blue-400" />
                              Global Presence
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Market Value:</span>
                                <span className="text-white">{teams[current].marketValue}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Fan Base:</span>
                                <span className="text-white">{teams[current].fanBase}</span>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="trophies" className="h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 rounded-lg p-4 text-center border border-blue-500/30">
                              <Trophy className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                              <p className="text-gray-300 text-sm">Champions League</p>
                              <p className="text-blue-400 font-bold text-3xl">{teams[current].trophies.champions}</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-500/20 to-amber-700/20 rounded-lg p-4 text-center border border-amber-500/30">
                              <Trophy className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                              <p className="text-gray-300 text-sm">League Titles</p>
                              <p className="text-amber-400 font-bold text-3xl">{teams[current].trophies.league}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 rounded-lg p-4 text-center border border-emerald-500/30">
                              <Trophy className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                              <p className="text-gray-300 text-sm">Domestic Cups</p>
                              <p className="text-emerald-400 font-bold text-3xl">{teams[current].trophies.domestic}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 rounded-lg p-4 text-center border border-purple-500/30">
                              <Trophy className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                              <p className="text-gray-300 text-sm">Total Trophies</p>
                              <p className="text-purple-400 font-bold text-3xl">{teams[current].trophies.total}</p>
                            </div>
                          </div>

                          <div className="bg-[#0f172a] rounded-lg p-4">
                            <h4 className="text-white font-medium mb-3 flex items-center">
                              <Award className="h-4 w-4 mr-2 text-amber-400" />
                              Major Achievements
                            </h4>
                            <ul className="space-y-2">
                              {teams[current].achievements.map((achievement, index) => (
                                <li key={index} className="flex items-start">
                                  <div className="bg-emerald-500/20 rounded-full p-1 mr-3 mt-0.5">
                                    <svg
                                      className="h-3 w-3 text-emerald-400"
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
                                  <p className="text-gray-300 text-sm">{achievement}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </TabsContent>

                        <TabsContent value="players" className="h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                          <div className="space-y-4">
                            <h4 className="text-white font-medium flex items-center">
                              <Shirt className="h-4 w-4 mr-2 text-emerald-400" />
                              Key Players
                            </h4>

                            {teams[current].players.map((player, index) => (
                              <div
                                key={index}
                                className="bg-[#0f172a] rounded-lg p-4 flex items-center hover:bg-[#0f172a]/70 transition-colors"
                              >
                                <div className="bg-emerald-500/20 rounded-full h-12 w-12 flex items-center justify-center mr-4">
                                  <span className="text-emerald-400 font-bold">{player.number}</span>
                                </div>
                                <div className="flex-grow">
                                  <h5 className="text-white font-medium">{player.name}</h5>
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-400 text-sm">{player.position}</span>
                                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                                      {player.nationality}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}

                            <div className="mt-4">
                              <Button
                                variant="outline"
                                className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                              >
                                View Full Squad
                              </Button>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="facts" className="h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                          <div className="space-y-6">
                            <div className="bg-[#0f172a] rounded-lg p-4">
                              <h4 className="text-white font-medium mb-3 flex items-center">
                                <Star className="h-4 w-4 mr-2 text-amber-400" />
                                Stadium Information
                              </h4>
                              <div className="relative h-40 rounded-lg overflow-hidden mb-3">
                                <Image
                                  src={teams[current].image || "/placeholder.svg"}
                                  alt={teams[current].stadium}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                                  <div className="p-3">
                                    <h5 className="text-white font-medium">{teams[current].stadium}</h5>
                                    <p className="text-gray-300 text-sm">Capacity: {teams[current].capacity}</p>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm">
                                Home to {teams[current].name} since its construction, this iconic venue has hosted
                                numerous historic matches and is renowned worldwide.
                              </p>
                            </div>

                            <div className="bg-[#0f172a] rounded-lg p-4">
                              <h4 className="text-white font-medium mb-3 flex items-center">
                                <Banknote className="h-4 w-4 mr-2 text-emerald-400" />
                                Club Rivals
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {teams[current].rivals.map((rival, index) => (
                                  <Badge
                                    key={index}
                                    className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                  >
                                    {rival}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="mt-6">
                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                          <span className="flex items-center">
                            View Full Club Profile
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="bg-black/50 border-gray-700 text-white hover:bg-black/70 hover:text-white rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="bg-black/50 border-gray-700 text-white hover:bg-black/70 hover:text-white rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute bottom-4 left-4 flex space-x-2 z-20">
            {teams.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === current ? "bg-emerald-500 w-6" : "bg-gray-600 hover:bg-gray-500"
                }`}
                onClick={() => {
                  setAutoplay(false)
                  setCurrent(index)
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
