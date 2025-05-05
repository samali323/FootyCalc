"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Chart } from "@/components/chart"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export function ChartSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const charts = [
    {
      id: 1,
      title: "Emissions by League",
      description: "CO2 emissions in tonnes for the 2024-2025 season",
      type: "bar" as const,
      color: "emerald",
      data: [
        { name: "UEFA Conference", value: 28000 },
        { name: "UEFA Europa", value: 19500 },
        { name: "UEFA Champions", value: 13000 },
        { name: "La Liga", value: 6500 },
        { name: "Liga 1", value: 6000 },
        { name: "Serie A", value: 5500 },
        { name: "Bundesliga", value: 5000 },
        { name: "Premier League", value: 4500 },
      ],
    },
    {
      id: 2,
      title: "Monthly Emissions Trend",
      description: "Travel emissions over time",
      type: "area" as const,
      color: "blue",
      data: [
        { name: "Jul", value: 200000 },
        { name: "Aug", value: 300000 },
        { name: "Sep", value: 100000 },
        { name: "Oct", value: 150000 },
        { name: "Nov", value: 220000 },
        { name: "Dec", value: 180000 },
      ],
    },
    {
      id: 3,
      title: "Emissions by Transport Type",
      description: "CO2 emissions by different transport methods",
      type: "bar" as const,
      color: "purple",
      data: [
        { name: "Air Travel", value: 140000 },
        { name: "Team Bus", value: 12000 },
        { name: "Train", value: 5000 },
        { name: "Ferry", value: 8000 },
        { name: "Electric Vehicles", value: 1000 },
      ],
    },
    {
      id: 4,
      title: "Seasonal Comparison",
      description: "Emissions comparison across seasons",
      type: "area" as const,
      color: "amber",
      data: [
        { name: "2020", value: 120000 },
        { name: "2021", value: 130000 },
        { name: "2022", value: 125000 },
        { name: "2023", value: 135000 },
        { name: "2024", value: 140000 },
        { name: "2025", value: 110000 },
      ],
    },
    {
      id: 5,
      title: "Team Emissions Ranking",
      description: "Top teams by carbon footprint",
      type: "bar" as const,
      color: "red",
      data: [
        { name: "Real Madrid", value: 12450 },
        { name: "Barcelona", value: 11230 },
        { name: "Man United", value: 10820 },
        { name: "Juventus", value: 10120 },
        { name: "Bayern Munich", value: 9870 },
      ],
    },
    {
      id: 6,
      title: "Emissions Reduction Progress",
      description: "Year-over-year reduction by league",
      type: "area" as const,
      color: "green",
      data: [
        { name: "Premier League", value: 15 },
        { name: "La Liga", value: 12 },
        { name: "Bundesliga", value: 18 },
        { name: "Serie A", value: 10 },
        { name: "Ligue 1", value: 8 },
      ],
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === charts.length - 2 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? charts.length - 2 : prev - 1))
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <motion.div
          key={`chart-${currentSlide}`}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl overflow-hidden border border-gray-800 shadow-xl"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-2">{charts[currentSlide].title}</h3>
            <p className="text-gray-400 mb-4">{charts[currentSlide].description}</p>
            <div className="h-80">
              <Chart
                type={charts[currentSlide].type}
                data={charts[currentSlide].data}
                color={charts[currentSlide].color}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          key={`chart-${(currentSlide + 1) % charts.length}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-xl overflow-hidden border border-gray-800 shadow-xl"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-2">
              {charts[(currentSlide + 1) % charts.length].title}
            </h3>
            <p className="text-gray-400 mb-4">{charts[(currentSlide + 1) % charts.length].description}</p>
            <div className="h-80">
              <Chart
                type={charts[(currentSlide + 1) % charts.length].type}
                data={charts[(currentSlide + 1) % charts.length].data}
                color={charts[(currentSlide + 1) % charts.length].color}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex gap-2">
          {charts.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide || index === (currentSlide + 1) % charts.length
                ? "bg-emerald-500 w-6"
                : "bg-gray-600 hover:bg-gray-500"
                }`}
              onClick={() => setCurrentSlide(index === charts.length - 1 ? 0 : index)}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-8 text-center">
        <Link href="/dashboard">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">View All Analytics</Button>
        </Link>
      </div>
    </div>
  )
}
