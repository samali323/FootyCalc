"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, TreePine, Globe, Leaf } from "lucide-react"

export function ForestReserves() {
  const [activeTab, setActiveTab] = useState("rainforests")

  const forestData = {
    rainforests: [
      {
        name: "Amazon Rainforest",
        location: "South America",
        area: "5.5 million km²",
        carbonStorage: "~90-140 billion tonnes",
        image: "/placeholder.svg?height=400&width=600",
        description:
          "The Amazon is the world's largest tropical rainforest, absorbing vast amounts of CO2 and producing 20% of Earth's oxygen.",
        facts: [
          "Home to 10% of known species on Earth",
          "Contains 16,000 tree species",
          "Stores carbon equivalent to 10 years of global emissions",
        ],
      },
      {
        name: "Congo Basin",
        location: "Central Africa",
        area: "3.7 million km²",
        carbonStorage: "~60 billion tonnes",
        image: "/placeholder.svg?height=400&width=600",
        description:
          "The second-largest tropical forest in the world, the Congo Basin is a critical carbon sink and biodiversity hotspot.",
        facts: [
          "Spans across 6 countries",
          "Contains 10,000 plant species",
          "Home to endangered forest elephants and gorillas",
        ],
      },
      {
        name: "Southeast Asian Rainforests",
        location: "Southeast Asia",
        area: "2.4 million km²",
        carbonStorage: "~42 billion tonnes",
        image: "/placeholder.svg?height=400&width=600",
        description:
          "The rainforests of Indonesia, Malaysia, and Papua New Guinea are among the most biodiverse and carbon-rich ecosystems.",
        facts: [
          "Contains the oldest rainforests on Earth",
          "Home to orangutans and Sumatran tigers",
          "Includes peat forests with extremely high carbon density",
        ],
      },
    ],
    boreal: [
      {
        name: "Boreal Forest (Taiga)",
        location: "Northern Hemisphere",
        area: "14.7 million km²",
        carbonStorage: "~700 billion tonnes",
        image: "/placeholder.svg?height=400&width=600",
        description:
          "The world's largest terrestrial biome, boreal forests circle the Northern Hemisphere and store massive amounts of carbon.",
        facts: [
          "Covers 11% of Earth's land surface",
          "Contains more freshwater than any other biome",
          "Stores twice as much carbon per acre as tropical forests",
        ],
      },
      {
        name: "Russian Taiga",
        location: "Russia",
        area: "7.6 million km²",
        carbonStorage: "~300 billion tonnes",
        image: "/placeholder.svg?height=400&width=600",
        description:
          "Russia's vast boreal forest is the largest continuous forest on Earth and a critical carbon reservoir.",
        facts: [
          "Contains 25% of the world's timber reserves",
          "Home to Siberian tigers and brown bears",
          "Stores carbon in trees and permafrost soils",
        ],
      },
      {
        name: "Canadian Boreal Forest",
        location: "Canada",
        area: "3.7 million km²",
        carbonStorage: "~208 billion tonnes",
        image: "/placeholder.svg?height=400&width=600",
        description:
          "Canada's boreal region represents 28% of the world's boreal zone and is vital for global carbon sequestration.",
        facts: [
          "Contains 25% of the world's remaining intact forests",
          "Home to over 600 Indigenous communities",
          "Stores 80% of its carbon in soil and peat",
        ],
      },
    ],
    marine: [
      {
        name: "Mangrove Forests",
        location: "Tropical Coastlines",
        area: "137,760 km²",
        carbonStorage: "~6.4 billion tonnes",
        image: "/placeholder.svg?height=400&width=600",
        description:
          "Mangroves are among the most carbon-rich forests in the tropics, storing carbon in plants and soil for thousands of years.",
        facts: [
          "Store up to 10 times more carbon than terrestrial forests",
          "Protect coastlines from erosion and storms",
          "Support rich marine ecosystems and fisheries",
        ],
      },
      {
        name: "Seagrass Meadows",
        location: "Coastal Waters Worldwide",
        area: "300,000-600,000 km²",
        carbonStorage: "~19.9 billion tonnes",
        image: "/placeholder.svg?height=400&width=600",
        description:
          "Seagrass meadows are marine flowering plants that form extensive underwater meadows and sequester carbon efficiently.",
        facts: [
          "Can capture carbon 35 times faster than tropical rainforests",
          "Provide habitat for thousands of marine species",
          "Filter water and stabilize sediments",
        ],
      },
      {
        name: "Kelp Forests",
        location: "Temperate and Arctic Coastal Waters",
        area: "~25% of world's coastlines",
        carbonStorage: "Significant but not fully quantified",
        image: "/placeholder.svg?height=400&width=600",
        description:
          "Kelp forests are underwater ecosystems formed by large brown algae that grow up to 45 meters tall.",
        facts: [
          "Among the most productive ecosystems on Earth",
          "Can grow up to 2 feet per day",
          "Support diverse marine life including fish, invertebrates, and mammals",
        ],
      },
    ],
  }

  return (
    <section className="py-20 bg-[#0f172a] relative overflow-hidden w-full">
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="bg-particle"
            style={{
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: "rgba(34, 197, 94, 0.25)",
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
              World's Largest <span className="text-green-400">Carbon Sinks</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Explore the forests and natural reserves that help offset carbon emissions worldwide
            </p>
          </motion.div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center">
            <TabsList className="flex justify-center mb-12 bg-transparent">
              {["rainforests", "boreal", "marine"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="tab-style-3 mx-1 px-6 py-3 bg-[#1e293b] data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center gap-2 rounded-lg"
                >
                  {tab === "rainforests" ? <TreePine className="h-4 w-4" /> : tab === "boreal" ? <Leaf className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  {tab === "rainforests" ? "Rainforests" : tab === "boreal" ? "Boreal Forests" : "Marine Carbon Sinks"}
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
              <TabsContent value="rainforests" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {forestData.rainforests.map((forest, index) => (
                    <ForestCard key={forest.name} forest={forest} index={index} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="boreal" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {forestData.boreal.map((forest, index) => (
                    <ForestCard key={forest.name} forest={forest} index={index} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="marine" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {forestData.marine.map((forest, index) => (
                    <ForestCard key={forest.name} forest={forest} index={index} />
                  ))}
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* <div className="mt-12 text-center">
          <p className="text-gray-300 mb-6 max-w-3xl mx-auto">
            These natural carbon sinks play a crucial role in mitigating climate change. Supporting conservation efforts
            and sustainable management of these ecosystems is essential for global carbon reduction strategies.
          </p>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <span className="flex items-center">
              Support Conservation Efforts
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Button>
        </div> */}
      </div>
    </section>
  )
}

function ForestCard({ forest, index }: { forest: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="bg-[#1e293b] border-gray-800 overflow-hidden h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={forest.image || "/placeholder.svg"}
            alt={forest.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
            <div className="p-4">
              <Badge className="bg-green-600 mb-2">Carbon Sink</Badge>
              <h3 className="text-xl font-semibold text-white">{forest.name}</h3>
            </div>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-white flex justify-between items-center">
            <span>{forest.location}</span>
            <Badge variant="outline" className="border-green-500 text-green-400">
              {forest.area}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <p className="text-gray-300 font-medium mb-1">Carbon Storage</p>
            <p className="text-green-400 font-bold text-lg">{forest.carbonStorage}</p>
          </div>

          <p className="text-gray-300">{forest.description}</p>

          <div>
            <h4 className="text-white font-medium mb-2">Key Facts</h4>
            <ul className="space-y-2">
              {forest.facts.map((fact: string, i: number) => (
                <li key={i} className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-gray-300">{fact}</p>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}