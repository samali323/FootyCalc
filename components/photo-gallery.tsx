"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

export function PhotoGallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [category, setCategory] = useState("all")

  const images = [
    {
      id: 1,
      src: "/pictures/solar-powered-stadium.jpg",
      alt: "Solar panels on stadium roof",
      category: "stadiums",
      title: "Solar-Powered Stadium",
      description: "Renewable energy installation at Allianz Arena, reducing carbon footprint by 60%",
    },
    {
      id: 2,
      src: "/pictures/maxresdefault.jpg",
      alt: "Electric team bus",
      category: "transport",
      title: "Electric Team Transport",
      description: "Manchester City's new electric team bus, eliminating emissions from local travel",
    },
    {
      id: 3,
      src: "/pictures/water-conservation-stadium.jpg",
      alt: "Rainwater collection system",
      category: "stadiums",
      title: "Water Conservation",
      description: "Rainwater harvesting system at Emirates Stadium, saving millions of gallons annually",
    },
    {
      id: 4,
      src: "/pictures/1 (1).jpg",
      alt: "Team planting trees",
      category: "initiatives",
      title: "Carbon Offset Program",
      description: "Real Madrid players participating in tree planting initiative to offset travel emissions",
    },
    {
      id: 5,
      src: "/pictures/1 (1).jpeg",
      alt: "Recycling bins at stadium",
      category: "stadiums",
      title: "Zero-Waste Initiative",
      description: "Comprehensive recycling program at Camp Nou, diverting 95% of waste from landfills",
    },
    {
      id: 6,
      src: "/pictures/1 (2).jpg",
      alt: "Team on train",
      category: "transport",
      title: "Rail Travel",
      description: "Liverpool FC choosing train travel for domestic away matches to reduce emissions",
    },
    {
      id: 7,
      src: "/pictures/download.jpg",
      alt: "Sustainable food options",
      category: "initiatives",
      title: "Plant-Based Concessions",
      description: "Forest Green Rovers offering 100% plant-based food options, reducing carbon footprint",
    },
    {
      id: 8,
      src: "/pictures/Fifa World Cup Trophy",
      alt: "LED lighting installation",
      category: "stadiums",
      title: "Energy-Efficient Lighting",
      description: "LED lighting system at Tottenham Hotspur Stadium, reducing energy consumption by 70%",
    },
  ]

  const filteredImages = category === "all" ? images : images.filter((img) => img.category === category)

  const handlePrev = () => {
    if (selectedImage === null) return
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage)
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length
    setSelectedImage(filteredImages[prevIndex].id)
  }

  const handleNext = () => {
    if (selectedImage === null) return
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage)
    const nextIndex = (currentIndex + 1) % filteredImages.length
    setSelectedImage(filteredImages[nextIndex].id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <Button
          variant={category === "all" ? "default" : "outline"}
          onClick={() => setCategory("all")}
          className={category === "all" ? "bg-blue-500 hover:bg-blue-600" : "text-gray-300"}
        >
          All
        </Button>
        <Button
          variant={category === "stadiums" ? "default" : "outline"}
          onClick={() => setCategory("stadiums")}
          className={category === "stadiums" ? "bg-blue-500 hover:bg-blue-600" : "text-gray-300"}
        >
          Stadiums
        </Button>
        <Button
          variant={category === "transport" ? "default" : "outline"}
          onClick={() => setCategory("transport")}
          className={category === "transport" ? "bg-blue-500 hover:bg-blue-600" : "text-gray-300"}
        >
          Transport
        </Button>
        <Button
          variant={category === "initiatives" ? "default" : "outline"}
          onClick={() => setCategory("initiatives")}
          className={category === "initiatives" ? "bg-blue-500 hover:bg-blue-600" : "text-gray-300"}
        >
          Initiatives
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative group overflow-hidden rounded-lg cursor-pointer"
            onClick={() => setSelectedImage(image.id)}
          >
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-medium">{image.title}</h3>
                <p className="text-gray-200 text-sm line-clamp-2">{image.description}</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="ghost" size="icon" className="bg-black/50 text-white hover:bg-black/70">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(null)
              }}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {filteredImages
              .filter((img) => img.id === selectedImage)
              .map((image) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="relative max-w-4xl max-h-[80vh] w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative aspect-video">
                    <Image
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                    <Badge className="mb-2 bg-blue-500">{image.category}</Badge>
                    <h2 className="text-xl font-semibold text-white mb-1">{image.title}</h2>
                    <p className="text-gray-200">{image.description}</p>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
