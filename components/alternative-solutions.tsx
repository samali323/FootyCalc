"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wind, Zap, Droplets } from "lucide-react"
import Link from "next/link"

export function AlternativeSolutions() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const words = ["Sustainable", "Eco-Friendly", "Green"]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const solutions = {
    transport: [
      {
        title: "High-Speed Rail",
        emissions: "0.29 tonnes CO₂",
        savings: "99%",
        icon: "🚄",
        image: "/pictures/Alternatives/TRN_HS2_Trains.jpg",
        features: [
          "Fastest ground transport option",
          "Lower emissions, comfortable for players",
          "Limited availability and fixed schedules",
        ],
      },
      {
        title: "Electric Team Bus",
        emissions: "0.39 tonnes CO₂",
        savings: "97%",
        icon: "🚌",
        image: "/pictures/Alternatives/electricbusscharfsinnsstock.webp",
        features: [
          "Greatly reduced emissions",
          "Flexible, team branding opportunity",
          "Charging infrastructure requirements",
        ],
      },
      {
        title: "Team Train Charter",
        emissions: "0.43 tonnes CO₂",
        savings: "98%",
        icon: "🚆",
        image: "/pictures/Alternatives/ev-train.webp",
        features: [
          "Lower emissions, comfortable for players",
          "Potential for team meetings en route",
          "Limited to train routes and stations",
        ],
      },
      {
        title: "Hybrid Team Bus",
        emissions: "1.2 tonnes CO₂",
        savings: "85%",
        icon: ":minibus:",
        image: "/placeholder.svg?height=300&width=500",
        features: [
          "Reduced emissions compared to standard buses",
          "No charging infrastructure needed",
          "Higher emissions than fully electric options",
        ],
      },
      {
        title: "Biofuel Aircraft",
        emissions: "4.8 tonnes CO₂",
        savings: "60%",
        icon: ":airplane:",
        image: "/placeholder.svg?height=300&width=500",
        features: [
          "Significant reduction in carbon footprint",
          "Same speed and range as conventional aircraft",
          "Limited availability of sustainable aviation fuel",
        ],
      },
    ],
    energy: [
      {
        title: "Solar Powered Stadiums",
        emissions: "Reduction of 60%",
        savings: "60%",
        icon: <Zap className="h-10 w-10 text-yellow-400" />,
        image: "/pictures/Alternatives/Solar Powered Stadium.jpg",
        features: ["Renewable energy source", "Reduced operational costs over time", "Weather dependent generation"],
      },
      {
        title: "Wind Energy",
        emissions: "Reduction of 55%",
        savings: "55%",
        icon: <Wind className="h-10 w-10 text-blue-400" />,
        image: "/placeholder.svg?height=300&width=500",
        features: ["Clean energy production", "Can power training facilities", "Requires suitable location"],
      },
      {
        title: "Geothermal Heating",
        emissions: "Reduction of 45%",
        savings: "45%",
        icon: <Droplets className="h-10 w-10 text-red-400" />,
        image: "/placeholder.svg?height=300&width=500",
        features: ["Efficient stadium heating", "Consistent energy source", "Higher initial installation cost"],
      },
      {
        title: "Biomass Energy",
        emissions: "Reduction of 40%",
        savings: "40%",
        icon: <Zap className="h-10 w-10 text-green-400" />,
        image: "/placeholder.svg?height=300&width=500",
        features: ["Uses organic waste materials", "Carbon neutral when sourced sustainably", "Requires storage space"],
      },
    ],
    offset: [
      {
        title: "Forest Conservation",
        emissions: "100% offset potential",
        savings: "100%",
        icon: "🌳",
        image: "/placeholder.svg?height=300&width=500",
        features: ["Protects existing carbon sinks", "Preserves biodiversity", "Long-term positive impact"],
      },
      {
        title: "Renewable Energy Projects",
        emissions: "100% offset potential",
        savings: "100%",
        icon: "⚡",
        image: "/placeholder.svg?height=300&width=500",
        features: ["Funds clean energy development", "Creates jobs in green economy", "Verifiable carbon reduction"],
      },
      {
        title: "Community Carbon Projects",
        emissions: "100% offset potential",
        savings: "100%",
        icon: "🌍",
        image: "/placeholder.svg?height=300&width=500",
        features: [
          "Supports local communities",
          "Multiple co-benefits beyond carbon",
          "Strong storytelling opportunity",
        ],
      },
      {
        title: "Reforestation Programs",
        emissions: "100% offset potential",
        savings: "100%",
        icon: "🌱",
        image: "/placeholder.svg?height=300&width=500",
        features: [
          "Creates new carbon sinks",
          "Restores degraded ecosystems",
          "Takes time to reach full carbon sequestration potential",
        ],
      },
      {
        title: "Blue Carbon Projects",
        emissions: "100% offset potential",
        savings: "100%",
        icon: "🌊",
        image: "/placeholder.svg?height=300&width=500",
        features: [
          "Protects coastal and marine ecosystems",
          "High carbon sequestration rate",
          "Additional benefits for coastal communities",
        ],
      },
    ],
  }

  const [activeTab, setActiveTab] = useState("transport")
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = (tab: keyof typeof solutions) => {
    const maxSlides = Math.ceil(solutions[tab].length / 3)
    setCurrentSlide((prev) => (prev === maxSlides - 1 ? 0 : prev + 1))
  }

  const handlePrev = (tab: keyof typeof solutions) => {
    const maxSlides = Math.ceil(solutions[tab].length / 3)
    setCurrentSlide((prev) => (prev === 0 ? maxSlides - 1 : prev - 1))
  }

  const showSliderControls = (tab: keyof typeof solutions) => {
    return solutions[tab].length > 3
  }

  return (
    <section className="py-20 bg-[#1e293b] relative overflow-hidden w-full">
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="bg-particle"
            style={{
              width: Math.random() * 80 + 20,
              height: Math.random() * 80 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: "rgba(20, 184, 166, 0.25)",
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
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentWordIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block text-emerald-400"
                >
                  {words[currentWordIndex]}
                </motion.span>
              </AnimatePresence>{" "}
              Alternatives
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Explore eco-friendly transportation options to reduce your carbon footprint
            </p>
          </motion.div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as keyof typeof solutions)
            setCurrentSlide(0)
          }}
          className="w-full"
        >
          <div className="flex justify-center">
            <TabsList className="flex justify-center gap-2 mb-8 p-1 bg-[#0f172a] rounded-full border border-gray-800">
              {["transport", "energy", "offset"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="tab-style-1 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600"
                >
                  {tab === "transport"
                    ? "Alternative Transport"
                    : tab === "energy"
                      ? "Renewable Energy"
                      : "Carbon Offsetting"}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="transport" className="mt-0 relative">
                <div className="overflow-hidden">
                  <motion.div
                    className="flex transition-all duration-500 ease-in-out"
                    animate={{
                      x: `-${currentSlide * 100}%`,
                    }}
                  >
                    {Array.from({ length: Math.ceil(solutions.transport.length / 3) }).map((_, slideIndex) => (
                      <div key={slideIndex} className="min-w-full flex-shrink-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {solutions.transport.slice(slideIndex * 3, slideIndex * 3 + 3).map((solution) => (
                            <AlternativeCard key={solution.title} solution={solution} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {showSliderControls("transport") && (
                  <div className="flex justify-center mt-6 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePrev("transport")}
                      className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <ArrowRight className="h-5 w-5 rotate-180" />
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(solutions.transport.length / 3) }).map((_, i) => (
                        <button
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-emerald-500 w-6" : "bg-gray-600 hover:bg-gray-500"
                            }`}
                          onClick={() => setCurrentSlide(i)}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleNext("transport")}
                      className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="energy" className="mt-0 relative">
                <div className="overflow-hidden">
                  <motion.div
                    className="flex transition-all duration-500 ease-in-out"
                    animate={{
                      x: `-${currentSlide * 100}%`,
                    }}
                  >
                    {Array.from({ length: Math.ceil(solutions.energy.length / 3) }).map((_, slideIndex) => (
                      <div key={slideIndex} className="min-w-full flex-shrink-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {solutions.energy.slice(slideIndex * 3, slideIndex * 3 + 3).map((solution) => (
                            <AlternativeCard key={solution.title} solution={solution} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {showSliderControls("energy") && (
                  <div className="flex justify-center mt-6 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePrev("energy")}
                      className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <ArrowRight className="h-5 w-5 rotate-180" />
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(solutions.energy.length / 3) }).map((_, i) => (
                        <button
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-emerald-500 w-6" : "bg-gray-600 hover:bg-gray-500"
                            }`}
                          onClick={() => setCurrentSlide(i)}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleNext("energy")}
                      className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="offset" className="mt-0 relative">
                <div className="overflow-hidden">
                  <motion.div
                    className="flex transition-all duration-500 ease-in-out"
                    animate={{
                      x: `-${currentSlide * 100}%`,
                    }}
                  >
                    {Array.from({ length: Math.ceil(solutions.offset.length / 3) }).map((_, slideIndex) => (
                      <div key={slideIndex} className="min-w-full flex-shrink-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {solutions.offset.slice(slideIndex * 3, slideIndex * 3 + 3).map((solution) => (
                            <AlternativeCard key={solution.title} solution={solution} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {showSliderControls("offset") && (
                  <div className="flex justify-center mt-6 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePrev("offset")}
                      className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <ArrowRight className="h-5 w-5 rotate-180" />
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(solutions.offset.length / 3) }).map((_, i) => (
                        <button
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-emerald-500 w-6" : "bg-gray-600 hover:bg-gray-500"
                            }`}
                          onClick={() => setCurrentSlide(i)}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleNext("offset")}
                      className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </section>
  )
}

function AlternativeCard({ solution }: { solution: any }) {
  return (
    <Card className="bg-[#1E293B] border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-emerald-400 group-hover:via-teal-500 group-hover:to-cyan-600 overflow-hidden h-full flex flex-col relative group transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={solution.image || "/placeholder.svg"}
          alt={solution.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <span className="mr-2 text-2xl">{typeof solution.icon === "string" ? solution.icon : solution.icon}</span>
          {solution.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center mb-6 bg-emerald-500/10 rounded-lg p-3 group-hover:bg-emerald-500/20 transition-all duration-300">
          <div>
            <p className="text-gray-400">Emissions</p>
            <p className="text-white font-semibold">{solution.emissions}</p>
          </div>
          <div>
            <p className="text-gray-400">Savings</p>
            <p className="text-emerald-400 font-semibold">{solution.savings}</p>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-white font-medium">Benefits</h4>
          <ul className="space-y-2">
            {solution.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start group-hover:text-white transition-all duration-300">
                <svg
                  className="h-5 w-5 text-emerald-400 mt-0.5 mr-2 group-hover:text-white transition-all duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-gray-300 group-hover:text-white transition-all duration-300">{feature}</p>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/analytics" className="w-full">
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            <span className="flex items-center">
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}