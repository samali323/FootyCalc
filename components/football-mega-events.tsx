"use client"

import { useState, useRef, useEffect, forwardRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react"

export const FootballMegaEvents = forwardRef<HTMLElement>((props, ref) => {
  const [activeTab, setActiveTab] = useState("world-cup")
  const [backgroundImage, setBackgroundImage] = useState("/placeholder.svg?height=1080&width=1920")

  // Current slide index for each tab
  const [currentSlides, setCurrentSlides] = useState({
    "world-cup": 0,
    "champions-league": 0,
    "euro": 0,
    "copa-america": 0,
  })

  // Refs for slider containers
  const sliderRefs = {
    "world-cup": useRef<HTMLDivElement>(null),
    "champions-league": useRef<HTMLDivElement>(null),
    "euro": useRef<HTMLDivElement>(null),
    "copa-america": useRef<HTMLDivElement>(null),
  }

  // Background images for each tab
  const backgroundImages = {
    "world-cup": "/pictures/bg-stadium-1.webp",
    "champions-league": "/placeholder.svg?height=1080&width=1920&text=Champions+League",
    "euro": "/pictures/Fifa World Cup Trophy",
    "copa-america": "/placeholder.svg?height=1080&width=1920&text=Copa+America",
  }

  // Update background image when tab changes
  useEffect(() => {
    setBackgroundImage(backgroundImages[activeTab as keyof typeof backgroundImages])
  }, [activeTab])

  // Combined event data from both previous components
  const eventsData = {
    "world-cup": [
      {
        id: 1,
        name: "FIFA World Cup",
        edition: "Qatar 2022",
        image: "/pictures/FIFA Qatar final.jpg",
        logo: "/pictures/FIFA Qatar logo.jpg",
        location: "Qatar",
        date: "Nov 20 - Dec 18, 2022",
        teams: 32,
        matches: 64,
        winner: "Argentina",
        runnerUp: "France",
        finalScore: "3-3 (4-2 penalties)",
        goldenBoot: "Kylian Mbappé (8 goals)",
        goldenBall: "Lionel Messi",
        attendance: "3.4 million",
        stadiums: 8,
        mascot: "La'eeb",
        highlights: [
          "Lionel Messi led Argentina to victory",
          "First World Cup in the Middle East",
          "First winter World Cup in the Northern Hemisphere",
          "Mbappé scored a hat-trick in the final",
        ],
      },
      {
        id: 2,
        name: "FIFA World Cup",
        edition: "Russia 2018",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Russia",
        date: "Jun 14 - Jul 15, 2018",
        teams: 32,
        matches: 64,
        winner: "France",
        runnerUp: "Croatia",
        finalScore: "4-2",
        goldenBoot: "Harry Kane (6 goals)",
        goldenBall: "Luka Modrić",
        attendance: "3.03 million",
        stadiums: 12,
        mascot: "Zabivaka",
        highlights: [
          "France won their second World Cup title",
          "First use of VAR technology in a World Cup",
          "Croatia reached their first-ever final",
          "Belgium achieved their best finish (3rd place)",
        ],
      },
      {
        id: 3,
        name: "FIFA World Cup",
        edition: "Brazil 2014",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Brazil",
        date: "Jun 12 - Jul 13, 2014",
        teams: 32,
        matches: 64,
        winner: "Germany",
        runnerUp: "Argentina",
        finalScore: "1-0",
        goldenBoot: "James Rodríguez (6 goals)",
        goldenBall: "Lionel Messi",
        attendance: "3.43 million",
        stadiums: 12,
        mascot: "Fuleco",
        highlights: [
          "Germany's historic 7-1 victory over Brazil",
          "Germany won their fourth World Cup title",
          "Goal-line technology used for the first time",
          "James Rodríguez's volley against Uruguay voted best goal",
        ],
      },
      {
        id: 4,
        name: "FIFA World Cup",
        edition: "South Africa 2010",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "South Africa",
        date: "Jun 11 - Jul 11, 2010",
        teams: 32,
        matches: 64,
        winner: "Spain",
        runnerUp: "Netherlands",
        finalScore: "1-0",
        goldenBoot: "Thomas Müller (5 goals)",
        goldenBall: "Diego Forlán",
        attendance: "3.18 million",
        stadiums: 10,
        mascot: "Zakumi",
        highlights: [
          "First World Cup held in Africa",
          "Spain won their first World Cup",
          "Vuvuzelas became famous worldwide",
          "Iniesta's extra-time winner in the final",
        ],
      },
      {
        id: 5,
        name: "FIFA World Cup",
        edition: "Germany 2006",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Germany",
        date: "Jun 9 - Jul 9, 2006",
        teams: 32,
        matches: 64,
        winner: "Italy",
        runnerUp: "France",
        finalScore: "1-1 (5-3 penalties)",
        goldenBoot: "Miroslav Klose (5 goals)",
        goldenBall: "Zinedine Zidane",
        attendance: "3.36 million",
        stadiums: 12,
        mascot: "Goleo VI",
        highlights: [
          "Zidane's headbutt in the final",
          "Italy's fourth World Cup title",
          "First World Cup with the new trophy",
          "Germany's 'summer fairy tale' as hosts",
        ],
      },
      {
        id: 6,
        name: "FIFA World Cup",
        edition: "Korea/Japan 2002",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "South Korea & Japan",
        date: "May 31 - Jun 30, 2002",
        teams: 32,
        matches: 64,
        winner: "Brazil",
        runnerUp: "Germany",
        finalScore: "2-0",
        goldenBoot: "Ronaldo (8 goals)",
        goldenBall: "Oliver Kahn",
        attendance: "2.71 million",
        stadiums: 20,
        mascot: "Ato, Kaz and Nik",
        highlights: [
          "First World Cup in Asia",
          "First World Cup with co-hosts",
          "Brazil's record fifth World Cup title",
          "South Korea's surprising run to the semifinals",
        ],
      },
      {
        id: 7,
        name: "FIFA World Cup",
        edition: "United 2026",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Canada, Mexico, United States",
        date: "Jun-Jul 2026",
        teams: 48,
        matches: 104,
        winner: "TBD",
        runnerUp: "TBD",
        finalScore: "TBD",
        goldenBoot: "TBD",
        goldenBall: "TBD",
        attendance: "TBD",
        stadiums: 16,
        mascot: "Not yet announced",
        highlights: [
          "First World Cup with 48 teams",
          "First World Cup hosted by three nations",
          "Most matches in World Cup history",
          "Expanded format with 16 groups of 3 teams",
        ],
      },
    ],
    "champions-league": [
      {
        id: 1,
        name: "UEFA Champions League",
        edition: "2022-23",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Europe (Final in Istanbul, Turkey)",
        date: "Jun 2023",
        teams: 32,
        matches: 125,
        winner: "Manchester City",
        runnerUp: "Inter Milan",
        finalScore: "1-0",
        topScorer: "Erling Haaland (12 goals)",
        attendance: "72,000 (Final)",
        stadiums: "Multiple across Europe",
        highlights: [
          "Manchester City's first Champions League title",
          "Pep Guardiola's third Champions League as manager",
          "Rodri scored the winning goal in the final",
          "City completed the treble (Premier League, FA Cup, Champions League)",
        ],
      },
      {
        id: 2,
        name: "UEFA Champions League",
        edition: "2021-22",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Europe (Final in Paris, France)",
        date: "May 2022",
        teams: 32,
        matches: 125,
        winner: "Real Madrid",
        runnerUp: "Liverpool",
        finalScore: "1-0",
        topScorer: "Karim Benzema (15 goals)",
        attendance: "75,000 (Final)",
        stadiums: "Multiple across Europe",
        highlights: [
          "Real Madrid's record 14th Champions League/European Cup",
          "Thibaut Courtois' man-of-the-match performance in the final",
          "Madrid's remarkable comebacks against PSG, Chelsea, and Man City",
          "Benzema's hat-tricks against PSG and Chelsea",
        ],
      },
      {
        id: 3,
        name: "UEFA Champions League",
        edition: "2020-21",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Europe (Final in Porto, Portugal)",
        date: "May 2021",
        teams: 32,
        matches: 125,
        winner: "Chelsea",
        runnerUp: "Manchester City",
        finalScore: "1-0",
        topScorer: "Erling Haaland (10 goals)",
        attendance: "14,000 (Final - COVID restricted)",
        stadiums: "Multiple across Europe",
        highlights: [
          "Chelsea's second Champions League title",
          "Thomas Tuchel reached the final with two different teams in consecutive seasons",
          "Kai Havertz scored the winning goal in the final",
          "Played during the COVID-19 pandemic with limited crowds",
        ],
      },
      {
        id: 4,
        name: "UEFA Champions League",
        edition: "2019-20",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Europe (Final in Lisbon, Portugal)",
        date: "August 2020",
        teams: 32,
        matches: 119,
        winner: "Bayern Munich",
        runnerUp: "Paris Saint-Germain",
        finalScore: "1-0",
        topScorer: "Robert Lewandowski (15 goals)",
        attendance: "0 (Final - behind closed doors)",
        stadiums: "Multiple across Europe",
        highlights: [
          "Bayern Munich's sixth Champions League/European Cup",
          "Single-leg knockout format from quarter-finals due to COVID-19",
          "Bayern's 8-2 victory over Barcelona in the quarter-finals",
          "Kingsley Coman scored the winning goal against his former club",
        ],
      },
      {
        id: 5,
        name: "UEFA Champions League",
        edition: "2018-19",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Europe (Final in Madrid, Spain)",
        date: "June 2019",
        teams: 32,
        matches: 125,
        winner: "Liverpool",
        runnerUp: "Tottenham Hotspur",
        finalScore: "2-0",
        topScorer: "Lionel Messi (12 goals)",
        attendance: "63,272 (Final)",
        stadiums: "Multiple across Europe",
        highlights: [
          "Liverpool's sixth Champions League/European Cup",
          "First all-English final since 2008",
          "Liverpool's comeback from 3-0 down against Barcelona",
          "Tottenham's dramatic late winner against Ajax in the semi-final",
        ],
      },
      {
        id: 6,
        name: "UEFA Champions League",
        edition: "2017-18",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Europe (Final in Kyiv, Ukraine)",
        date: "May 2018",
        teams: 32,
        matches: 125,
        winner: "Real Madrid",
        runnerUp: "Liverpool",
        finalScore: "3-1",
        topScorer: "Cristiano Ronaldo (15 goals)",
        attendance: "61,561 (Final)",
        stadiums: "Multiple across Europe",
        highlights: [
          "Real Madrid's third consecutive Champions League title",
          "Gareth Bale's spectacular bicycle kick in the final",
          "Loris Karius' errors in the final",
          "Cristiano Ronaldo's overhead kick against Juventus",
        ],
      },
    ],
    euro: [
      {
        id: 1,
        name: "UEFA European Championship",
        edition: "Euro 2020",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "11 European Cities",
        date: "Jun 11 - Jul 11, 2021",
        teams: 24,
        matches: 51,
        winner: "Italy",
        runnerUp: "England",
        finalScore: "1-1 (3-2 penalties)",
        topScorer: "Cristiano Ronaldo & Patrik Schick (5 goals)",
        attendance: "1.1 million",
        stadiums: 11,
        mascot: "Skillzy",
        highlights: [
          "Italy won on penalties against England at Wembley",
          "First pan-European tournament across 11 cities",
          "Delayed by one year due to COVID-19 pandemic",
          "Denmark's emotional journey after Christian Eriksen's collapse",
        ],
      },
      {
        id: 2,
        name: "UEFA European Championship",
        edition: "Euro 2016",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "France",
        date: "Jun 10 - Jul 10, 2016",
        teams: 24,
        matches: 51,
        winner: "Portugal",
        runnerUp: "France",
        finalScore: "1-0 (AET)",
        topScorer: "Antoine Griezmann (6 goals)",
        attendance: "2.43 million",
        stadiums: 10,
        mascot: "Super Victor",
        highlights: [
          "Portugal won their first major trophy",
          "First European Championship with 24 teams",
          "Cristiano Ronaldo injured but coached from the sidelines in the final",
          "Iceland's remarkable run to the quarter-finals",
        ],
      },
      {
        id: 3,
        name: "UEFA European Championship",
        edition: "Euro 2012",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Poland & Ukraine",
        date: "Jun 8 - Jul 1, 2012",
        teams: 16,
        matches: 31,
        winner: "Spain",
        runnerUp: "Italy",
        finalScore: "4-0",
        topScorer:
          "Fernando Torres, Mario Mandžukić, Mario Gomez, Alan Dzagoev, Mario Balotelli, Cristiano Ronaldo (3 goals)",
        attendance: "1.44 million",
        stadiums: 8,
        mascot: "Slavek and Slavko",
        highlights: [
          "Spain won their third major tournament in a row",
          "First European Championship in Eastern Europe",
          "Spain's historic 4-0 victory over Italy in the final",
          "Andrea Pirlo's panenka penalty against England",
        ],
      },
      {
        id: 4,
        name: "UEFA European Championship",
        edition: "Euro 2008",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Austria & Switzerland",
        date: "Jun 7 - Jun 29, 2008",
        teams: 16,
        matches: 31,
        winner: "Spain",
        runnerUp: "Germany",
        finalScore: "1-0",
        topScorer: "David Villa (4 goals)",
        attendance: "1.14 million",
        stadiums: 8,
        mascot: "Trix and Flix",
        highlights: [
          "Spain began their era of dominance",
          "Fernando Torres scored the winning goal in the final",
          "Russia's surprising run to the semi-finals under Guus Hiddink",
          "Turkey's dramatic late comebacks",
        ],
      },
      {
        id: 5,
        name: "UEFA European Championship",
        edition: "Euro 2004",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Portugal",
        date: "Jun 12 - Jul 4, 2004",
        teams: 16,
        matches: 31,
        winner: "Greece",
        runnerUp: "Portugal",
        finalScore: "1-0",
        topScorer: "Milan Baroš (5 goals)",
        attendance: "1.16 million",
        stadiums: 10,
        mascot: "Kinas",
        highlights: [
          "Greece's shocking victory as 150-1 outsiders",
          "Greece defeated hosts Portugal twice (opening game and final)",
          "Cristiano Ronaldo's tears after the final",
          "Wayne Rooney's breakthrough tournament at age 18",
        ],
      },
      {
        id: 6,
        name: "UEFA European Championship",
        edition: "Euro 2024",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Germany",
        date: "Jun 14 - Jul 14, 2024",
        teams: 24,
        matches: 51,
        winner: "TBD",
        runnerUp: "TBD",
        finalScore: "TBD",
        topScorer: "TBD",
        attendance: "TBD",
        stadiums: 10,
        mascot: "Albärt",
        highlights: [
          "Returns to a single-host format after pan-European Euro 2020",
          "Germany hosts its first unified European Championship",
          "Expanded format with 24 teams continues",
          "Sustainability is a key focus of the tournament",
        ],
      },
    ],
    "copa-america": [
      {
        id: 1,
        name: "Copa América",
        edition: "Brazil 2021",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Brazil",
        date: "Jun 13 - Jul 10, 2021",
        teams: 10,
        matches: 28,
        winner: "Argentina",
        runnerUp: "Brazil",
        finalScore: "1-0",
        topScorer: "Luis Díaz (4 goals)",
        attendance: "Limited due to COVID-19",
        stadiums: 5,
        mascot: "None",
        highlights: [
          "Messi won his first major international trophy",
          "Argentina's first major trophy since 1993",
          "Played during the COVID-19 pandemic with no fans",
          "Ángel Di María scored the winning goal in the final",
        ],
      },
      {
        id: 2,
        name: "Copa América",
        edition: "Brazil 2019",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Brazil",
        date: "Jun 14 - Jul 7, 2019",
        teams: 12,
        matches: 26,
        winner: "Brazil",
        runnerUp: "Peru",
        finalScore: "3-1",
        topScorer: "Everton (3 goals)",
        attendance: "1.12 million",
        stadiums: 6,
        mascot: "Zizito",
        highlights: [
          "Brazil won their 9th Copa América title",
          "First Copa América to use VAR",
          "Brazil won without conceding a goal in the knockout stage",
          "Messi accused CONMEBOL of corruption",
        ],
      },
      {
        id: 3,
        name: "Copa América",
        edition: "Centenario 2016",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "United States",
        date: "Jun 3 - Jun 26, 2016",
        teams: 16,
        matches: 32,
        winner: "Chile",
        runnerUp: "Argentina",
        finalScore: "0-0 (4-2 penalties)",
        topScorer: "Eduardo Vargas (6 goals)",
        attendance: "1.48 million",
        stadiums: 10,
        mascot: "None",
        highlights: [
          "Special centennial edition of the tournament",
          "Chile won their second consecutive title",
          "First Copa América hosted outside South America",
          "Messi announced his international retirement (later reversed)",
        ],
      },
      {
        id: 4,
        name: "Copa América",
        edition: "Chile 2015",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Chile",
        date: "Jun 11 - Jul 4, 2015",
        teams: 12,
        matches: 26,
        winner: "Chile",
        runnerUp: "Argentina",
        finalScore: "0-0 (4-1 penalties)",
        topScorer: "Eduardo Vargas, Paolo Guerrero (4 goals)",
        attendance: "655,902",
        stadiums: 9,
        mascot: "Zincha",
        highlights: [
          "Chile won their first Copa América title",
          "Hosts won the tournament for the first time since Colombia in 2001",
          "Arturo Vidal's car crash controversy during the tournament",
          "Gonzalo Higuaín missed a crucial chance in the final",
        ],
      },
      {
        id: 5,
        name: "Copa América",
        edition: "Argentina 2024",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "United States",
        date: "Jun 20 - Jul 14, 2024",
        teams: 16,
        matches: 32,
        winner: "TBD",
        runnerUp: "TBD",
        finalScore: "TBD",
        topScorer: "TBD",
        attendance: "TBD",
        stadiums: 14,
        mascot: "TBD",
        highlights: [
          "Second Copa América to be hosted in the United States",
          "Expanded format with 16 teams including CONCACAF nations",
          "Argentina enters as defending champions",
          "Serves as preparation for the 2026 World Cup",
        ],
      },
      {
        id: 6,
        name: "Copa América",
        edition: "Brazil 2011",
        image: "/placeholder.svg?height=400&width=600",
        logo: "/placeholder.svg?height=100&width=100",
        location: "Argentina",
        date: "Jul 1 - Jul 24, 2011",
        teams: 12,
        matches: 26,
        winner: "Uruguay",
        runnerUp: "Paraguay",
        finalScore: "3-0",
        topScorer: "Paolo Guerrero (5 goals)",
        attendance: "583,053",
        stadiums: 8,
        mascot: "Tangolero",
        highlights: [
          "Uruguay won a record 15th Copa América title",
          "Luis Suárez was named player of the tournament",
          "Paraguay reached the final without winning a single game in regular time",
          "Brazil eliminated in quarter-finals on penalties",
        ],
      },
    ],
  }

  // Function to navigate to the next slide
  const nextSlide = (tab: string) => {
    const maxIndex = eventsData[tab as keyof typeof eventsData].length - 1
    setCurrentSlides((prev) => ({
      ...prev,
      [tab]: prev[tab as keyof typeof prev] === maxIndex ? 0 : prev[tab as keyof typeof prev] + 1,
    }))
  }

  // Function to navigate to the previous slide
  const prevSlide = (tab: string) => {
    const maxIndex = eventsData[tab as keyof typeof eventsData].length - 1
    setCurrentSlides((prev) => ({
      ...prev,
      [tab]: prev[tab as keyof typeof prev] === 0 ? maxIndex : prev[tab as keyof typeof prev] - 1,
    }))
  }

  // Color schemes for different tabs
  const colorSchemes = {
    "world-cup": {
      bg: "bg-amber-500",
      hover: "hover:bg-amber-600",
      border: "border-amber-500/30",
      shadow: "shadow-amber-500/10",
      text: "text-amber-400",
      gradient: "from-amber-500 to-amber-600",
      bgTransparent: "bg-amber-500/70",
    },
    "champions-league": {
      bg: "bg-blue-500",
      hover: "hover:bg-blue-600",
      border: "border-blue-500/30",
      shadow: "shadow-blue-500/10",
      text: "text-blue-400",
      gradient: "from-blue-500 to-blue-600",
      bgTransparent: "bg-blue-500/70",
    },
    euro: {
      bg: "bg-purple-500",
      hover: "hover:bg-purple-600",
      border: "border-purple-500/30",
      shadow: "shadow-purple-500/10",
      text: "text-purple-400",
      gradient: "from-purple-500 to-purple-600",
      bgTransparent: "bg-purple-500/70",
    },
    "copa-america": {
      bg: "bg-emerald-500",
      hover: "hover:bg-emerald-600",
      border: "border-emerald-500/30",
      shadow: "shadow-emerald-500/10",
      text: "text-emerald-400",
      gradient: "from-emerald-500 to-emerald-600",
      bgTransparent: "bg-emerald-500/70",
    },
  }

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-[#0f172a] to-[#1e293b] relative overflow-hidden w-full">
      <div className="absolute inset-0 transition-opacity duration-500 ease-in-out">
        <Image
          src={backgroundImage || "/placeholder.svg"}
          alt="Background"
          fill
          className="object-cover opacity-25"
          priority
        />
      </div>

      {/* Animated particles for background effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="bg-particle"
            style={{
              width: Math.random() * 80 + 20,
              height: Math.random() * 80 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? "rgba(234, 179, 8, 0.15)" : "rgba(16, 185, 129, 0.15)",
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
              Football's <span className="text-amber-400">Mega Events</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Explore the world's biggest football tournaments, their history, and iconic moments
            </p>
          </motion.div>
        </div>

        <Tabs defaultValue="world-cup" onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-24">
            <TabsList className="bg-[#1e293b]/80 border border-gray-800 p-1 rounded-xl grid grid-cols-4 w-full max-w-3xl">
              <TabsTrigger
                value="world-cup"
                className="flex flex-col items-center py-3 data-[state=active]:bg-gradient-to-b data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 rounded-lg"
              >
                <Image
                  src="/pictures/football.png"
                  alt="FIFA World Cup"
                  width={40}
                  height={40}
                  className="mb-1"
                />
                <span>World Cup</span>
              </TabsTrigger>
              <TabsTrigger
                value="champions-league"
                className="flex flex-col items-center py-3 data-[state=active]:bg-gradient-to-b data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 rounded-lg"
              >
                <Image
                  src="/pictures/world-cup.png"
                  alt="Champions League"
                  width={40}
                  height={40}
                  className="mb-1"
                />
                <span>Champions League</span>
              </TabsTrigger>
              <TabsTrigger
                value="euro"
                className="flex flex-col items-center py-3 data-[state=active]:bg-gradient-to-b data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 rounded-lg"
              >
                <Image
                  src="/pictures/trophy (1).png"
                  alt="UEFA Euro"
                  width={40}
                  height={40}
                  className="mb-1"
                />
                <span>UEFA Euro</span>
              </TabsTrigger>
              <TabsTrigger
                value="copa-america"
                className="flex flex-col items-center py-3 data-[state=active]:bg-gradient-to-b data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 rounded-lg"
              >
                <Image
                  src="/pictures/silver.png"
                  alt="Copa America"
                  width={40}
                  height={40}
                  className="mb-1"
                />
                <span>Copa América</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab content with sliders */}
          <AnimatePresence mode="wait">
            {Object.entries(eventsData).map(([tabKey, events]) => (
              <TabsContent key={tabKey} value={tabKey} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div ref={sliderRefs[tabKey as keyof typeof sliderRefs]} className="overflow-hidden">
                    <motion.div
                      className="flex transition-all duration-500 ease-in-out w-full"
                      animate={{
                        x: `-${currentSlides[tabKey as keyof typeof currentSlides] * 100}%`,
                      }}
                    >
                      {events.map((event, index) => (
                        <div key={`${tabKey}-${index}`} className="min-w-full w-full flex-shrink-0 px-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div
                              className={`relative rounded-xl overflow-hidden h-[400px] border ${colorSchemes[tabKey as keyof typeof colorSchemes].border} shadow-lg ${colorSchemes[tabKey as keyof typeof colorSchemes].shadow}`}
                            >
                              <Image
                                src={event.image || "/placeholder.svg"}
                                alt={`${event.name} ${event.edition}`}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
                                <div className="flex items-center mb-4">
                                  <div className="relative w-16 h-16 mr-4 bg-white rounded-full overflow-hidden flex-shrink-0">
                                    <Image
                                      src={event.logo || "/placeholder.svg"}
                                      alt={`${event.name} logo`}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-bold text-white">{event.name}</h3>
                                    <p className={colorSchemes[tabKey as keyof typeof colorSchemes].text}>
                                      {event.edition}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <Badge className={colorSchemes[tabKey as keyof typeof colorSchemes].bg}>
                                    {event.winner !== "TBD" ? `Winner: ${event.winner}` : "Upcoming"}
                                  </Badge>
                                  <Badge
                                    className={`${colorSchemes[tabKey as keyof typeof colorSchemes].bg} opacity-80`}
                                  >
                                    {event.teams} Teams
                                  </Badge>
                                  <Badge
                                    className={`${colorSchemes[tabKey as keyof typeof colorSchemes].bg} opacity-60`}
                                  >
                                    {event.matches} Matches
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-800">
                                <h3 className="text-xl font-bold text-white mb-4">Tournament Details</h3>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                  <div className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                                    <div>
                                      <p className="text-gray-400 text-sm">Location</p>
                                      <p className="text-white">{event.location}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                                    <div>
                                      <p className="text-gray-400 text-sm">Date</p>
                                      <p className="text-white">{event.date}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <Trophy className="h-5 w-5 mr-2 text-gray-400" />
                                    <div>
                                      <p className="text-gray-400 text-sm">Final Result</p>
                                      <p className="text-white">
                                        {event.finalScore !== "TBD"
                                          ? `${event.winner} ${event.finalScore} ${event.runnerUp}`
                                          : "Not played yet"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <Star className="h-5 w-5 mr-2 text-gray-400" />
                                    <div>
                                      <p className="text-gray-400 text-sm">Top Scorer</p>
                                      <p className="text-white">{event.goldenBoot || event.topScorer || "TBD"}</p>
                                    </div>
                                  </div>
                                </div>

                                <h4 className="text-white font-medium mb-3">Key Highlights</h4>
                                <ul className="space-y-2">
                                  {event.highlights.map((highlight, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <svg
                                        className={`h-5 w-5 ${colorSchemes[tabKey as keyof typeof colorSchemes].text} mt-0.5 mr-2 flex-shrink-0`}
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
                                      <p className="text-gray-300">{highlight}</p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Navigation buttons - more prominent with semi-transparent backgrounds */}
                  <div
                    className={`absolute -left-2 top-1/3 z-10 rounded-full p-2 ${colorSchemes[tabKey as keyof typeof colorSchemes].bgTransparent} cursor-pointer hover:scale-110 transition-transform duration-200`}
                    onClick={() => prevSlide(tabKey)}
                  >
                    <ChevronLeft className="h-8 w-8 text-white" />
                  </div>
                  <div
                    className={`absolute -right-2 top-1/3 z-10 rounded-full p-2 ${colorSchemes[tabKey as keyof typeof colorSchemes].bgTransparent} cursor-pointer hover:scale-110 transition-transform duration-200`}
                    onClick={() => nextSlide(tabKey)}
                  >
                    <ChevronRight className="h-8 w-8 text-white" />
                  </div>

                  {/* Pagination dots */}
                  <div className="flex justify-center mt-8 gap-2">
                    {events.map((_, idx) => (
                      <button
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlides[tabKey as keyof typeof currentSlides]
                            ? `${colorSchemes[tabKey as keyof typeof colorSchemes].bg} w-6`
                            : "bg-gray-600 hover:bg-gray-500"
                          }`}
                        onClick={() => setCurrentSlides((prev) => ({ ...prev, [tabKey]: idx }))}
                      />
                    ))}
                  </div>

                  {/* Single button at the bottom */}
                  {/* <div className="flex justify-center mt-8">
                    <Button
                      className={`${colorSchemes[tabKey as keyof typeof colorSchemes].bg} ${
                        colorSchemes[tabKey as keyof typeof colorSchemes].hover
                      } text-white px-8`}
                    >
                      <span className="flex items-center">
                        View All{" "}
                        {tabKey === "world-cup"
                          ? "World Cup"
                          : tabKey === "champions-league"
                            ? "Champions League"
                            : tabKey === "euro"
                              ? "UEFA Euro"
                              : "Copa América"}{" "}
                        Tournaments
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Button>
                  </div> */}
                </motion.div>
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </div>
    </section>
  )
})
