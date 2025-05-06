"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "react-toastify"

export interface BlogPost {
  id: number
  created_at: string
  description: string
  title: string
  categories: string
  cover_image: string | null
  type: string
  tags: string
  isPublished: boolean
}

interface Category {
  id: string
  name: string
}

export function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true)
      setCategoriesError(null)
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, categoriesName")
          .order("categoriesName", { ascending: true })

        if (error) throw error
        setAvailableCategories(
          data.map((cat: any) => ({
            id: cat.id.toString(),
            name: cat.categoriesName,
          })) || []
        )
      } catch (error: any) {
        setCategoriesError(error.message || "Failed to fetch categories")
        toast.error(error.message || "Failed to fetch categories")
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const getCategoryNames = (categoryData: string | string[]): string[] => {
    try {
      const categoryIds: string[] =
        typeof categoryData === "string" ? JSON.parse(categoryData) : categoryData || []
      return categoryIds
        .map((id: string) => {
          const category = availableCategories.find((cat: { id: string; name: string }) => cat.id === id.toString())
          return category ? category.name : "Unknown"
        })
        .filter((name: string) => name !== "Unknown")
    } catch {
      return []
    }
  }

  const categoryNames = getCategoryNames(post.categories)
  const excerpt = post.description.replace(/<[^>]+>/g, "").substring(0, 100) + (post.description.length > 100 ? "..." : "")

  return (
    <Link href={`/view/${post.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        className="h-full cursor-pointer"
      >
        <Card className="bg-[#1e293b] border-gray-800 overflow-hidden h-full flex flex-col">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={post.cover_image || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-purple-500 hover:bg-purple-600">{post.type}</Badge>
            </div>
          </div>
          <CardHeader>
            <CardTitle className="text-white line-clamp-2 hover:text-emerald-400 transition-colors">
              {post.title}
            </CardTitle>
            <CardDescription className="text-gray-400 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {new Date(post.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-gray-300 line-clamp-3">{excerpt}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {categoryNames.map((category, idx) => (
                <Badge key={idx} variant="outline" className="text-emerald-400 border-emerald-400/50">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}