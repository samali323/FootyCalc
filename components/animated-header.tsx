"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  Trophy,
  Users,
  BarChart3,
  Leaf,
  LogOut,
  User,
  LayoutDashboard,
  ZoomIn,
  ZoomOut,
  RotateCw,
  LogIn,
  FileText,
  ChevronDown,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "./auth/auth-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Cropper from "react-easy-crop"
import type { Point, Area } from "react-easy-crop"
import { supabase } from "@/lib/supabase/client"
import bydefault from "../public/pictures/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg"
import { BlogPost } from "./blog-card"
// Define Area type for cropping
type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// Global styles for the component
const globalStyles = `
  button:focus {
    outline: none !important;
    box-shadow: none !important;
  }
  
  .cropper-container {
    position: relative;
    width: 100%;
    height: 300px;
    overflow: hidden;
    border-radius: 8px;
    background-color: #0f172a;
  }
  
  .zoom-controls {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    background-color: rgba(15, 23, 42, 0.8);
    padding: 8px;
    border-radius: 24px;
    z-index: 10;
  }
  
  .rotate-button {
    position: absolute;
    top: 16px;
    right: 16px;
    background-color: rgba(15, 23, 42, 0.8);
    border-radius: 50%;
    padding: 8px;
    z-index: 10;
  }
  
  .aspect-ratio-selector {
    position: absolute;
    top: 16px;
    left: 16px;
    background-color: rgba(15, 23, 42, 0.8);
    border-radius: 24px;
    padding: 4px;
    z-index: 10;
  }
  
  .preview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
  }
  
  .preview-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #10b981;
  }
  
  .preview-square {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #10b981;
  }
`

// Utility function to combine first and last names
function combineNames(firstName?: string, lastName?: string): string {
  const trimmedFirstName = firstName?.trim() || ""
  const trimmedLastName = lastName?.trim() || ""

  if (!trimmedFirstName && !trimmedLastName) return ""
  if (!trimmedFirstName) return trimmedLastName
  if (!trimmedLastName) return trimmedFirstName

  return `${trimmedFirstName} ${trimmedLastName}`
}

// Interface for component props
interface AnimatedHeaderProps {
  scrollToSection?: (section: string) => void
  blogPosts?: BlogPost[]; // Prop for checking blogs
}

// Function to crop image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new window.Image();
  image.crossOrigin = "anonymous";
  image.src = imageSrc;
  await new Promise<void>((resolve) => {
    image.onload = () => resolve();
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2D context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

// Main component
export function AnimatedHeader({ scrollToSection }: AnimatedHeaderProps) {
  const [isScrollingUp, setIsScrollingUp] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isAtTop, setIsAtTop] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("leagues")
  const { signOut, profile, user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [firstName, setFirstName] = useState(profile?.first_name || "")
  const [lastName, setLastName] = useState(profile?.last_name || "")
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [newProfilePic, setNewProfilePic] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [cropShape, setCropShape] = useState<"round" | "rect">("round")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [activeImageTab, setActiveImageTab] = useState("edit")

  // Refs for touch gestures
  const touchStartRef = useRef<Point | null>(null)
  const lastTouchRef = useRef<Point | null>(null)
  const touchDistanceRef = useRef<number | null>(null)

  // Fetch profile picture from Supabase
  useEffect(() => {
    const fetchProfilePic = async () => {
      if (user?.id) {
        const { data: profile } = await supabase.from("profiles").select('*').eq("id", user.id).single()
        if (profile?.id && profile?.img) {
          const { data: files } = await supabase.storage.from("profile-pics").getPublicUrl(`${profile.img}`)
          files?.publicUrl ? setProfilePic(files.publicUrl) : setProfilePic(null);
        } else {
          setProfilePic(null)
        }
      } else {
        setProfilePic(null)
      }
    }
    fetchProfilePic()
  }, [user?.id])

  // Update firstName and lastName when profile changes
  useEffect(() => {
    setFirstName(profile?.first_name || "")
    setLastName(profile?.last_name || "")
  }, [profile])

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsAtTop(currentScrollY < 10);
      if (!mobileMenuOpen) { // Disable scroll hide only when menu is open
        if (currentScrollY < lastScrollY) {
          setIsScrollingUp(true);
        } else if (currentScrollY > 50 && currentScrollY > lastScrollY) {
          setIsScrollingUp(false);
        }
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    if (scrollToSection && tabId !== "dashboard") {
      scrollToSection(tabId)
    }
  }

  // const handleDropdownItemClick = (tabId: string, dropdownItem: string) => {
  //   setActiveTab(tabId)
  //   if (scrollToSection) {
  //     scrollToSection(`${tabId}-${dropdownItem.toLowerCase()}`)
  //   }
  // }

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
      generatePreview(croppedAreaPixels)
    },
    [newProfilePic]
  )

  const generatePreview = async (pixelCrop?: Area) => {
    if (!newProfilePic || !pixelCrop) return
    try {
      const croppedImg = await getCroppedImg(newProfilePic, pixelCrop)
      const previewUrl = URL.createObjectURL(croppedImg)
      setPreviewImage(previewUrl)
    } catch (e) {
      console.error("Error generating preview:", e)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setNewProfilePic(reader.result as string)
        setZoom(1)
        setCrop({ x: 0, y: 0 })
        setRotation(0)
        setActiveImageTab("edit")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (newProfilePic && croppedAreaPixels && user?.id) {
      try {
        const croppedImage = await getCroppedImg(newProfilePic, croppedAreaPixels)
        const fileName = `${user.id}-${Date.now()}.jpg`
        const { error } = await supabase.storage.from("profile-pics").upload(fileName, croppedImage, {
          contentType: "image/jpeg",
        })
        if (error) {
          console.error("Error uploading image to Supabase:", error)
          return
        }
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .update({ img: fileName })
          .eq("id", user.id);
        const { data } = supabase.storage.from("profile-pics").getPublicUrl(fileName)
        setProfilePic(data.publicUrl)
        setNewProfilePic(null)
        setPreviewImage(null)
        // Delete old profile pictures
        // const { data: files } = await supabase.storage.from("profile-pics").list()
        // const oldFiles = files?.filter((file) => file.name.startsWith(`${user.id}-`) && file.name !== fileName)
        // if (oldFiles && oldFiles.length > 0) {
        //   await supabase.storage.from("profile-pics").remove(oldFiles.map((file) => file.name))
        // }
      } catch (e) {
        console.error("Error processing image:", e)
      }
    }
    setIsDialogOpen(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY }
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
      touchDistanceRef.current = distance
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouchRef.current) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - lastTouchRef.current.x
      const deltaY = touch.clientY - lastTouchRef.current.y
      setCrop((prevCrop) => ({
        x: prevCrop.x + deltaX * 0.5,
        y: prevCrop.y + deltaY * 0.5,
      }))
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY }
    } else if (e.touches.length === 2 && touchDistanceRef.current) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
      const scale = distance / touchDistanceRef.current
      const newZoom = Math.max(1, Math.min(3, zoom * scale))
      setZoom(newZoom)
      touchDistanceRef.current = distance
    }
  }

  const handleTouchEnd = () => {
    touchStartRef.current = null
    lastTouchRef.current = null
    touchDistanceRef.current = null
  }

  const handleRotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360)
  }

  const handleAspectRatioChange = (ratio: string) => {
    switch (ratio) {
      case "1:1":
        setAspectRatio(1)
        break
      case "4:3":
        setAspectRatio(4 / 3)
        break
      case "16:9":
        setAspectRatio(16 / 9)
        break
      default:
        setAspectRatio(1)
    }
  }

  const handleShapeChange = (shape: "round" | "rect") => {
    setCropShape(shape)
  }

  const handleDropdownItemClick = (tabId: string, dropdownItem: string) => {
    setActiveTab(tabId)
  }

  const navItems = [
    {
      id: "leagues",
      name: "Leagues",
      icon: <Trophy className="h-4 w-4 mr-1" />,
      activeColor: "text-emerald-400",
    },
    {
      id: "tournaments",
      name: "Tournaments",
      icon: <BarChart3 className="h-4 w-4 mr-1" />,
      activeColor: "text-blue-400",
    },
    {
      id: "clubs",
      name: "Clubs",
      icon: <Users className="h-4 w-4 mr-1" />,
      activeColor: "text-amber-400",
    },
    {
      id: "blogs",
      name: "Blogs",
      icon: <FileText className="h-4 w-4 mr-1" />,
      activeColor: "text-orange-400",
    },
    {
      id: "sustainability",
      name: "Sustainability",
      icon: <Leaf className="h-4 w-4 mr-1" />,
      activeColor: "text-purple-400",
    },
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4 mr-1" />,
      activeColor: "text-pink-400",
      hasDropdown: true,
      dropdownItems: [
        { name: "Overview", path: "/dashboard" },
        { name: "Team", path: "/teams" },
        { name: "Matches", path: "/matches" },
        { name: "Analytics", path: "/analytics" },
      ],
    },
  ]

  const displayName = user
    ? combineNames(user?.user_metadata?.first_name, user?.user_metadata?.last_name) || "Admin"
    : "Welcome"

  return (
    <>
      <style jsx global>
        {globalStyles}
      </style>
      <AnimatePresence>
        {(isScrollingUp || isAtTop) && (
          <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-0 left-0 right-0 z-50 ${isAtTop ? "bg-transparent" : "bg-[#0f172a]/95 backdrop-blur-md shadow-lg shadow-emerald-500/10"} transition-all duration-300`}
          >
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 animate-gradient"></div>
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16 md:h-20">
                <div onClick={() => scrollToSection && scrollToSection("Hero")} className="flex items-center space-x-2">
                  <div className="relative h-10 w-10 md:h-12 md:w-12">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full opacity-80 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Leaf className="h-6 w-6 md:h-7 md:w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-white">
                      Sports <span className="text-emerald-400">Emissions</span>
                    </h1>
                    <p className="text-xs text-gray-400 hidden md:block">Tracking the carbon footprint of sports</p>
                  </div>
                </div>

                <nav className="hidden md:flex items-center space-x-1">
                  {navItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <Button
                        variant="ghost"
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none ${activeTab === item.id ? `${item.activeColor} hover:bg-transparent` : "text-gray-300 hover:text-white hover:bg-[#1e293b]"}`}
                        onClick={() => handleTabClick(item.id)}
                      >
                        <span className={activeTab === item.id ? item.activeColor : "text-gray-400"}>{item.icon}</span>
                        {item.name}
                        {item.hasDropdown && <ChevronDown className="ml-1 h-4 w-4 opacity-70" />}
                      </Button>

                      {item.hasDropdown && (
                        <div className="absolute left-0 mt-1 w-48 origin-top-left rounded-md bg-[#1E293B] border border-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="py-1">
                            {item.dropdownItems?.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.name}
                                href={dropdownItem.path}
                                onClick={() => handleDropdownItemClick(item.id, dropdownItem.name)}
                              >
                                <button className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#2D3748] hover:text-white focus:outline-none">
                                  {dropdownItem.name}
                                </button>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="hidden md:flex items-center space-x-3">
                  <span className="text-gray-300 text-sm">
                    <span className="text-emerald-400">{displayName}</span>
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full p-0 h-10 w-10 overflow-hidden border-2 border-emerald-500"
                      >
                        <Image
                          src={profilePic ? profilePic : bydefault}
                          alt="User profile"
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1e293b] border-gray-800 text-white">
                      {user && (
                        <DropdownMenuItem
                          className="hover:bg-[#2d3748] cursor-pointer flex items-center"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Details
                        </DropdownMenuItem>
                      )}
                      {user && (
                        <DropdownMenuItem
                          className="hover:bg-[#2d3748] cursor-pointer flex items-center text-red-400 hover:text-red-300"
                          onClick={signOut}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      )}
                      {!user && (
                        <DropdownMenuItem className="hover:bg-[#2d3748] cursor-pointer flex items-center">
                          <Link href="/auth/login" className="flex items-center w-full">
                            <LogIn className="h-4 w-4 mr-2" />
                            Login
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex md:hidden items-center space-x-2">
                  <div className="flex items-center mr-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full p-0 h-8 w-8 overflow-hidden border-2 border-emerald-500"
                        >
                          <Image
                            src={profilePic ? profilePic : bydefault}
                            alt="User profile"
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1e293b] border-gray-800 text-white">
                        <DropdownMenuItem
                          className="hover:bg-[#2d3748] cursor-pointer flex items-center"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Details
                        </DropdownMenuItem>
                        {user && (
                          <DropdownMenuItem
                            className="hover:bg-[#2d3748] cursor-pointer flex items-center text-red-400 hover:text-red-300"
                            onClick={signOut}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMobileMenu}
                    className="text-gray-300 hover:text-white hover:bg-[#1e293b] rounded-full"
                  >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-md z-40 border-t border-gray-800 shadow-lg shadow-emerald-500/10"
          >
            <div className="container mx-auto p-4">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.id}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start py-3 focus:outline-none ${activeTab === item.id ? item.activeColor : "text-gray-300 hover:text-white hover:bg-[#1e293b]"}`}
                      onClick={() => {
                        setActiveTab(prev => (item.hasDropdown ? (prev === item.id ? "" : item.id) : item.id))
                        if (!item.hasDropdown) {
                          toggleMobileMenu()
                          handleTabClick(item.id)
                        }
                      }}
                    >
                      <span className={`mr-3 ${activeTab === item.id ? item.activeColor : "text-gray-400"}`}>
                        {item.icon}
                      </span>
                      {item.name}
                      {item.hasDropdown && (
                        <motion.div
                          animate={{ rotate: activeTab === item.id ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="ml-auto"
                        >
                          <ChevronDown className="h-4 w-4 opacity-70" />
                        </motion.div>
                      )}
                    </Button>

                    {item.hasDropdown && activeTab === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="ml-8 mt-1 space-y-1 overflow-hidden"
                      >
                        {item.dropdownItems?.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.path}
                            onClick={() => {
                              handleDropdownItemClick(item.id, dropdownItem.name);
                              toggleMobileMenu();
                            }}
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start py-2 text-sm text-gray-300 hover:bg-[#2D3748] hover:text-white focus:outline-none"
                            >
                              {dropdownItem.name}
                            </Button>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex items-center">
                  <span className="text-gray-300 text-sm">
                    <span className="text-emerald-400">{displayName}</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#1e293b] text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Profile Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Tabs value={activeImageTab} onValueChange={setActiveImageTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#2d3748]">
                <TabsTrigger value="edit" className="data-[state=active]:bg-[#4a5568]">
                  Edit Photo
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-[#4a5568]">
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-4">
                {newProfilePic ? (
                  <div
                    className="cropper-container"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <Cropper
                      image={newProfilePic}
                      crop={crop}
                      zoom={zoom}
                      aspect={aspectRatio}
                      rotation={rotation}
                      cropShape={cropShape}
                      showGrid={true}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      style={{
                        containerStyle: {
                          width: "100%",
                          height: "100%",
                          borderRadius: cropShape === "round" ? "50%" : "8px",
                        },
                      }}
                    />

                    <div className="zoom-controls">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                        className="text-white"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        className="w-24 mx-2"
                        onValueChange={(value) => setZoom(value[0])}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                        className="text-white"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button variant="ghost" size="icon" onClick={handleRotate} className="rotate-button text-white">
                      <RotateCw className="h-4 w-4" />
                    </Button>

                    <div className="aspect-ratio-selector">
                      <div className="flex space-x-1">
                        <Button
                          variant={cropShape === "round" ? "default" : "ghost"}
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={() => handleShapeChange("round")}
                        >
                          <div className="h-4 w-4 rounded-full bg-current" />
                        </Button>
                        <Button
                          variant={cropShape === "rect" ? "default" : "ghost"}
                          size="sm"
                          className="h-8 w-8 p-0 rounded-md"
                          onClick={() => handleShapeChange("rect")}
                        >
                          <div className="h-4 w-4 rounded-sm bg-current" />
                        </Button>
                        {cropShape === "rect" && (
                          <>
                            <Button
                              variant={aspectRatio === 1 ? "default" : "ghost"}
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => handleAspectRatioChange("1:1")}
                            >
                              1:1
                            </Button>
                            <Button
                              variant={aspectRatio === 4 / 3 ? "default" : "ghost"}
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => handleAspectRatioChange("4:3")}
                            >
                              4:3
                            </Button>
                            <Button
                              variant={aspectRatio === 16 / 9 ? "default" : "ghost"}
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => handleAspectRatioChange("16:9")}
                            >
                              16:9
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-emerald-500">
                      <Image
                        src={profilePic ? profilePic : bydefault}
                        alt="Profile picture"
                        width={96}
                        height={96}
                        className="object-contain"
                      />
                    </div>
                    <Label htmlFor="picture" className="cursor-pointer text-sm text-emerald-500 hover:text-emerald-400">
                      Upload new picture
                    </Label>
                    <Input id="picture" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </div>
                )}

                {newProfilePic && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewProfilePic(null)
                        setPreviewImage(null)
                      }}
                      className="mr-2 border-gray-600 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setActiveImageTab("preview")}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Preview
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="preview-container">
                  {previewImage ? (
                    <>
                      <div className={cropShape === "round" ? "preview-circle" : "preview-square"}>
                        <Image
                          src={previewImage || "/placeholder.svg"}
                          alt="Preview"
                          width={120}
                          height={120}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p className="text-sm text-gray-300">This is how your profile picture will look</p>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          onClick={() => setActiveImageTab("edit")}
                          className="border-gray-600 text-gray-300"
                        >
                          Edit Again
                        </Button>
                        <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600">
                          Save
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 flex justify-center items-center flex-col">
                      {
                        profilePic ? <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-emerald-500">
                          <Image
                            src={profilePic || "/placeholder.svg?height=100&width=100"}
                            alt="Profile picture"
                            width={96}
                            height={96}
                            className="object-contain"
                          />
                        </div> : <p className="text-gray-400">Upload your photo first to see a preview</p>
                      }




                      <Button
                        variant="outline"
                        onClick={() => setActiveImageTab("edit")}
                        className="mt-4 border-gray-600 text-gray-300"
                      >
                        Go to Editor
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-[#2d3748] text-white border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-[#2d3748] text-white border-gray-600"
              />
            </div> */}

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  setNewProfilePic(null)
                  setPreviewImage(null)
                }}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="h-16 md:h-20"></div>
    </>
  )
}