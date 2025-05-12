"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Leaf, BarChart3, Calendar, Users, Plane, ArrowRight, ChevronDown, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import CountUp from "react-countup"
import { BlogCard, BlogPost } from "@/components/blog-card"
import { TeamSlider } from "@/components/team-slider"
import { LeagueCards } from "@/components/league-cards"
import { ChartSlider } from "@/components/chart-slider"
import { AlternativeSolutions } from "@/components/alternative-solutions"
import { UpcomingEvents } from "@/components/upcoming-events"
import { ContinentLeagues } from "@/components/continent-leagues"
import { PhotoGallery } from "@/components/photo-gallery"
import { ForestReserves } from "@/components/forest-reserves"
import { TopFootballClubs } from "@/components/topClubs"
import { createClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client";
import { FootballMegaEvents } from "@/components/football-mega-events"
import { AnimatedHeader } from "@/components/animated-header"

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showVideo, setShowVideo] = useState(false)
  const HeroSectionRef = useRef<HTMLElement>(null) // For Hero section
  const leaguesSectionRef = useRef<HTMLElement>(null) // Ref for LeagueCards section
  const tournamentsSectionRef = useRef<HTMLElement>(null) // For FootballMegaEvents
  const clubsSectionRef = useRef<HTMLElement>(null) // For TopFootballClubs
  const blogsSectionRef = useRef<HTMLElement>(null) // For Blogs section
  const sustainabilitySectionRef = useRef<HTMLElement>(null) // For ForestReserves
  const dashboardSectionRef = useRef<HTMLElement>(null) // For ChartSlider (as a placeholder for Dashboard)

  const [activeRegion, setActiveRegion] = useState("all")

  // State for Supabase data
  const [leagueCount, setLeagueCount] = useState(0)
  const [teamCount, setTeamCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [leaguesData, setLeaguesData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch counts from Supabase
  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true)
      try {
        // Fetch league count
        const { count: leagueCountData, error: leagueError } = await supabase
          .from("leagues")
          .select("*", { count: "exact", head: true })

        if (leagueError) throw leagueError
        setLeagueCount(leagueCountData || 0)

        // Fetch team count
        const { count: teamCountData, error: teamError } = await supabase
          .from("teams")
          .select("*", { count: "exact", head: true })

        if (teamError) throw teamError
        setTeamCount(teamCountData || 0)

        // Fetch match count
        const { count: matchCountData, error: matchError } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })

        if (matchError) throw matchError
        setMatchCount(matchCountData || 0)
      } catch (error) {
        console.error("Error fetching counts:", error)
        // Optionally, show a toast notification here
      } finally {
        setIsLoading(false)
      }
    }

    fetchCounts()
  }, [])

  // Fetch the latest 3 blog posts
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from("blogs")
          .select("*")
          .order("created_at", { ascending: false })
          .eq('isPublished', true)
          .limit(3) // Fetch only the latest 3 blogs

        if (error) throw error

        setBlogPosts(data || [])
      } catch (err: any) {
        setError(err.message || "Failed to fetch blog posts")
      }
    }

    // Fetch all data from the leagues table for inspection in the network tab
    const fetchLeagues = async () => {
      try {
        const { data, error } = await supabase.from("leagues").select("*")

        if (error) throw error

        setLeaguesData(data || [])
      } catch (err: any) {
        setError(err.message || "Failed to fetch leagues data")
      }
    }

    const fetchLeaguesSeasons = async () => {
      try {
        const { data, error } = await supabase.from("league_seasons").select("*")

        if (error) throw error

        setLeaguesData(data || [])
      } catch (err: any) {
        setError(err.message || "Failed to fetch leagues data")
      }
    }

    fetchLeaguesSeasons()
    fetchBlogs()
    fetchLeagues()
  }, [])

  // Function to scroll to a section
  const scrollToSection = (section: string) => {
    switch (section) {
      case "Hero":
        HeroSectionRef.current?.scrollIntoView({ behavior: "smooth" })
        break
      case "leagues":
        leaguesSectionRef.current?.scrollIntoView({ behavior: "smooth" })
        break
      case "tournaments":
        tournamentsSectionRef.current?.scrollIntoView({ behavior: "smooth" })
        break
      case "clubs":
        clubsSectionRef.current?.scrollIntoView({ behavior: "smooth" })
        break
      case "blogs":
        blogsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "sustainability":
        sustainabilitySectionRef.current?.scrollIntoView({ behavior: "smooth" })
        break
      case "dashboard":
        dashboardSectionRef.current?.scrollIntoView({ behavior: "smooth" })
        break
      default:
        break
    }
  }

  useEffect(() => {
    setIsClient(true)

    // Animate stats on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.2 },
    )

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el)
    })

    return () => {
      document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        observer.unobserve(el)
      })
    }
  }, [])

  // Animated text for headings
  const words = ["Sustainable", "Eco-friendly", "Green", "Clean"]
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] overflow-x-hidden w-full">
      {/* ==================== HEADER SECTION ==================== */}
      <AnimatedHeader scrollToSection={scrollToSection} blogPosts={blogPosts} />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative h-screen w-full overflow-hidden" ref={HeroSectionRef}>
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            preload="metadata"
            playsInline // Add this to ensure autoplay on mobile Safari
            className="w-full h-full object-cover"
            poster="/placeholder.svg?height=1080&width=1920"
            onLoadedData={() => videoRef.current?.play()} // Ensure video plays on load
          >
            <source src="/videos/2657260-uhd_3840_2160_24fps.mp4" type="video/mp4" />
          </video>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/40"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              >
                <Leaf className="h-12 w-12 text-emerald-400 mr-3" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-600">
                  Sport Ecolytics
                </span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Monitor, analyze and reduce carbon emissions from sports travel worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ y: -5 }} className="framer-motion">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                </Link>
              </motion.div>
              {/* <motion.div whileHover={{ y: -5 }} className="framer-motion">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-white/10 group"
                    onClick={() => setShowVideo(true)}
                  >
                    <Play className="mr-2 h-5 w-5 group-hover:text-emerald-400 transition-colors" />
                    Watch Demo
                  </Button>
                </Link>
              </motion.div> */}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-10 framer-motion"
          >
            <ChevronDown className="h-10 w-10 text-white animate-bounce" />
          </motion.div>
        </div>

        {/* Video Modal */}
        {/* <AnimatePresence>
          {showVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
              onClick={() => setShowVideo(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setShowVideo(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
                <iframe
                  width="100%"
                  height="100%"
                  src="about:blank"
                  title="Demo Video"
                  className="absolute inset-0"
                  allowFullScreen
                ></iframe>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence> */}
      </section>

      {/* ==================== KEY STATS SECTION ==================== */}
      <section className="py-20 bg-gradient-to-b from-[#0f172a] to-[#1e293b] relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#0f172a] to-transparent"></div>

        {/* Animated background elements - darker for better visibility */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="bg-particle"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: "rgba(16, 185, 129, 0.25)", // Darker for better visibility
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
              className="framer-motion"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tracking Global Impact</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Comprehensive data on sports travel emissions across leagues, teams, and seasons
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="animate-on-scroll"
            >
              <StatsCard
                icon={<BarChart3 className="h-8 w-8 text-emerald-400" />}
                title="Leagues"
                value={leagueCount}
                description="Active leagues tracked"
                color="emerald"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="animate-on-scroll"
            >
              <StatsCard
                icon={<Users className="h-8 w-8 text-blue-400" />}
                title="Teams"
                value={teamCount}
                description="Registered teams"
                color="blue"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="animate-on-scroll"
            >
              <StatsCard
                icon={<Calendar className="h-8 w-8 text-purple-400" />}
                title="Matches"
                value={matchCount}
                description="Season matches"
                color="purple"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="animate-on-scroll"
            >
              <StatsCard
                icon={<Plane className="h-8 w-8 text-red-400" />}
                title="Emissions"
                value={140075}
                suffix="tonnes"
                description="Including return flights"
                color="red"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== PHOTO GALLERY SECTION ==================== */}
      <section className="py-20 bg-[#1e293b] relative overflow-hidden w-full">
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
                backgroundColor: "rgba(59, 130, 246, 0.25)", // Darker for better visibility
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
                Sustainable <span className="text-blue-400">Initiatives</span> Gallery
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Explore visual highlights of eco-friendly practices in sports around the world
              </p>
            </motion.div>
          </div>

          <PhotoGallery />
        </div>
      </section>

      <FootballMegaEvents ref={tournamentsSectionRef} />

      {/* ==================== CHARTS SECTION ==================== */}
      <section className="py-20 bg-[#0f172a] relative overflow-hidden w-full">
        <div className="absolute inset-0">
          {/* Animated grid lines */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
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
                Interactive <span className="text-emerald-400">Analytics</span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Explore detailed emissions data through our interactive charts and visualizations
              </p>
            </motion.div>
          </div>

          <ChartSlider />
        </div>
      </section>

      {/* ==================== TopFootballClubs ==================== */}
      <TopFootballClubs ref={clubsSectionRef} />

      {/* ==================== LEAGUE CARDS SECTION ==================== */}
      <LeagueCards ref={leaguesSectionRef} />

      {/* ==================== FOREST RESERVES SECTION ==================== */}
      <ForestReserves />

      {/* ==================== TEAM SLIDER SECTION ==================== */}
      {/* <section className="py-20 bg-gradient-to-b from-[#0f172a] to-[#1e293b] relative overflow-hidden w-full">
        <TeamSlider />
      </section> */}

      {/* ==================== ALTERNATIVE SOLUTIONS SECTION ==================== */}
      <AlternativeSolutions />

      {/* ==================== UPCOMING EVENTS SECTION ==================== */}
      {/* <section className="py-20 bg-gradient-to-b from-[#1e293b] to-[#0f172a] relative overflow-hidden w-full">
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
                Upcoming <span className="text-emerald-400">Events</span>
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Join us at these sustainability-focused sports events around the world
              </p>
            </motion.div>
          </div>

          <UpcomingEvents />
        </div>
      </section> */}

      {/* ==================== SUSTAINABILITY SECTION ==================== */}
      <section ref={sustainabilitySectionRef} className="py-20 bg-[#0f172a] relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <motion.div whileHover={{ scale: 1.02 }}>
                <div className="relative rounded-xl overflow-hidden">
                  <Image
                    src="/pictures/Stadium-for-Stroud.jpg"
                    alt="Sustainable stadium surrounded by trees"
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 hover:from-black/0 to-transparent flex items-end">
                    <div className="p-6">
                      <Badge className="bg-emerald-500 mb-2">Carbon Neutral</Badge>
                      <h3 className="text-xl font-semibold text-white">Forest Green Rovers Stadium</h3>
                      <p className="text-gray-200">The world's first carbon-neutral football club</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Towards a <span className="text-emerald-400">Greener</span> Future
              </h2>
              <p className="text-gray-300 mb-8">
                Our platform not only tracks emissions but helps teams implement sustainable practices and offset their
                carbon footprint through verified environmental projects.
              </p>

              <div className="space-y-6">
                <motion.div whileHover={{ y: -5 }}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-white">Carbon Offset Programs</h3>
                      <p className="text-gray-400">
                        Partner with verified carbon offset projects worldwide to neutralize your team's emissions.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -5 }}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-white">Renewable Energy</h3>
                      <p className="text-gray-400">
                        Implement renewable energy solutions at stadiums and training facilities.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -5 }}>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-white">Sustainable Transport</h3>
                      <p className="text-gray-400">
                        Transition to electric team buses and prioritize low-carbon travel options.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>


            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== BLOG SECTION ==================== */}
      {blogPosts.length > 0 && (
        <section ref={blogsSectionRef} className="py-20 bg-gradient-to-b from-[#0f172a] to-[#1e293b] relative overflow-hidden w-full">
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
                  backgroundColor: "rgba(245, 158, 11, 0.25)", // Darker for better visibility
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
                  Latest <span className="text-emerald-400">Insights</span>
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Stay updated with the latest news and research on sports sustainability
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.length > 0 ? (
                blogPosts.map((post, index) => (
                  <BlogCard key={post.id} post={post} index={index} />
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-400">
                  No blog posts available.
                </div>
              )}
            </div>

            <div className="mt-12 text-center">
              <motion.div whileHover={{ y: -5 }}>
                <Link href="/view">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    View All Articles
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>)}

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-20 bg-[#1e293b] relative overflow-hidden w-full">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Track Your <span className="text-emerald-400">Sport Ecolytics</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join hundreds of sports organizations worldwide in the mission to reduce carbon footprint
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ y: -5 }}>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Get Started Now
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                </Link>
              </motion.div>
              {/* <motion.div whileHover={{ y: -5 }}>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Schedule a Demo
                </Button>
              </motion.div> */}
            </div>

            {/* <div className="mt-12 pt-12 border-t border-gray-800">
              <p className="text-gray-400 mb-6">Trusted by leading sports organizations</p>
              <div className="flex flex-wrap justify-center gap-8 opacity-70 hover:opacity-100 transition-opacity duration-300">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Image
                    key={i}
                    src={`/placeholder.svg?height=60&width=120`}
                    alt={`Partner logo ${i}`}
                    width={120}
                    height={60}
                    className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                ))}
              </div>
            </div> */}
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER SECTION ==================== */}
      <footer className="py-12 bg-[#0F172A] border-t border-gray-800 w-full">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            {/* Logo and Title */}
            <motion.div
              className="flex items-center justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <Leaf className="h-10 w-10 text-emerald-400 mr-3" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white">Sports Ecolytics</h2>
            </motion.div>

            {/* Platform Links - Centered and Enhanced */}
            <div className="mb-10 text-center">
              <h3 className="text-white text-xl font-semibold mb-6 inline-block border-b-2 border-emerald-400 pb-1">
                Platform
              </h3>
              <ul className="flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-md mx-auto">
                <li>
                  <Link
                    href="/dashboard"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 text-lg flex items-center"
                  >
                    <span className="relative group">
                      Dashboard
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/teams"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 text-lg flex items-center"
                  >
                    <span className="relative group">
                      Teams
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/matches"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 text-lg flex items-center"
                  >
                    <span className="relative group">
                      Matches
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 text-lg flex items-center"
                  >
                    <span className="relative group">
                      Analytics
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Decorative Element */}
            <div className="w-full max-w-xs mx-auto mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"></div>
            </div>

            {/* Copyright */}
            <div className="text-center text-gray-500 text-sm">
              <p>&copy; {new Date().getFullYear()} Sports Ecolytics. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Component for stats cards with enhanced animations
function StatsCard({ icon, title, value, suffix = "", description, color }: {
  icon: React.ReactNode
  title: string
  value: number
  suffix?: string
  description: string
  color: string
}) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
    red: "from-red-500/20 to-red-500/5 border-red-500/20",
  }

  const [startAnimation, setStartAnimation] = useState(false)
  const isTeamsCard = title === "Teams"
  const isMatchesCard = title === "Matches"

  return (
    <motion.div
      onViewportEnter={() => setStartAnimation(true)}
      viewport={{ once: true }}
      className={`rounded-xl p-6 bg-gradient-to-b ${colorClasses[color as keyof typeof colorClasses]} border border-opacity-20 shadow-lg group transition-all duration-300 hover:shadow-2xl`}
    >
      <div className="flex items-center mb-4">
        <div className="transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white ml-3">{title}</h3>
      </div>
      <div className="mb-2">
        <div className="flex items-end">
          {startAnimation ? (
            <>
              <CountUp
                end={value}
                duration={8}
                separator=","
                className="text-3xl md:text-4xl font-bold text-white"
              />
              {(isTeamsCard || isMatchesCard) && <span className="text-3xl md:text-4xl font-bold text-white ml-1">+</span>
              }
            </>
          ) : (
            <span className="text-3xl md:text-4xl font-bold text-white">0</span>
          )}
          {suffix && <span className="text-white ml-1 mb-1">{suffix}</span>}
        </div>
      </div>
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{description}</p>
    </motion.div>
  )
}
