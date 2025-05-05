"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, ArrowRight, Clock } from "lucide-react"

export function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: "Sustainable Sports Summit 2025",
      date: "May 15-17, 2025",
      location: "London, UK",
      image: "/placeholder.svg?height=300&width=500",
      description:
        "Join industry leaders to discuss the future of sustainable sports travel and operations. Featuring keynote speakers from top football clubs and sports organizations.",
      attendees: 500,
      type: "Conference",
    },
    {
      id: 2,
      title: "Green Stadium Awards",
      date: "June 22, 2025",
      location: "Berlin, Germany",
      image: "/placeholder.svg?height=300&width=500",
      description:
        "Annual awards ceremony recognizing the most environmentally friendly stadiums and sports facilities around the world.",
      attendees: 300,
      type: "Awards",
    },
    {
      id: 3,
      title: "Carbon Neutral Football Workshop",
      date: "July 8-9, 2025",
      location: "Barcelona, Spain",
      image: "/placeholder.svg?height=300&width=500",
      description:
        "Practical workshop for football clubs looking to achieve carbon neutrality. Learn from clubs that have successfully implemented sustainable practices.",
      attendees: 150,
      type: "Workshop",
    },
    {
      id: 4,
      title: "Sports Sustainability Expo",
      date: "August 12-14, 2025",
      location: "New York, USA",
      image: "/placeholder.svg?height=300&width=500",
      description:
        "The largest exhibition of sustainable technologies and solutions for the sports industry. Featuring product demonstrations and networking opportunities.",
      attendees: 1200,
      type: "Expo",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          whileHover={{ y: -5 }}
        >
          <Card className="bg-[#1e293b] border-gray-800 overflow-hidden h-full flex flex-col">
            <div className="relative h-48 overflow-hidden">
              <Image
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-emerald-500">{event.type}</Badge>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-white">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-gray-300">{event.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-400">
                  <Calendar className="h-4 w-4 mr-2 text-emerald-400" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-2 text-emerald-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Users className="h-4 w-4 mr-2 text-emerald-400" />
                  <span>{event.attendees} attendees</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Clock className="h-4 w-4 mr-2 text-emerald-400" />
                  <span>Registration open</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                <span className="flex items-center">
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
