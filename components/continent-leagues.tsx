"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

export function ContinentLeagues({ continent }: { continent: string }) {
  const continentData = {
    all: [
      {
        name: "UEFA Champions League",
        location: "Europe",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "28,000",
      },
      {
        name: "Premier League",
        location: "England",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "19,500",
      },
      {
        name: "Copa Libertadores",
        location: "South America",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "22,300",
      },
    ],
    europe: [
      {
        name: "Premier League",
        location: "England",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "19,500",
      },
      {
        name: "La Liga",
        location: "Spain",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "17,800",
      },
      {
        name: "Bundesliga",
        location: "Germany",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "15,200",
      },
    ],
    americas: [
      {
        name: "Copa Libertadores",
        location: "South America",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "22,300",
      },
      {
        name: "MLS",
        location: "United States",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "18,700",
      },
      {
        name: "Liga MX",
        location: "Mexico",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "12,450",
      },
    ],
    asia: [
      {
        name: "AFC Champions League",
        location: "Asia",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "24,800",
      },
      {
        name: "J1 League",
        location: "Japan",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "8,900",
      },
      {
        name: "A-League",
        location: "Australia",
        logo: "/placeholder.svg?height=40&width=40",
        emissions: "11,200",
      },
    ],
  }

  const leagues = continentData[continent as keyof typeof continentData] || continentData.all

  return (
    <div className="space-y-3">
      {leagues.map((league, index) => (
        <motion.div
          key={league.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-center justify-between bg-[#0f172a] rounded-lg p-3 hover:bg-[#1e293b] transition-colors duration-300"
        >
          <div className="flex items-center">
            <div className="relative w-10 h-10 mr-3">
              <Image
                src={league.logo || "/placeholder.svg"}
                alt={league.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <div>
              <h4 className="text-white font-medium">{league.name}</h4>
              <div className="flex items-center text-gray-400 text-sm">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{league.location}</span>
              </div>
            </div>
          </div>
          <Badge className="bg-emerald-500">{league.emissions} tonnes</Badge>
        </motion.div>
      ))}
    </div>
  )
}
