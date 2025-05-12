"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Calendar, Globe, Tag } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "react-toastify"
import { Separator } from "@/components/ui/separator"

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
  const descriptionpiece = post.description.replace(/<[^>]+>/g, "").substring(0, 80) + (post.description.length > 80 ? "..." : "")
  const titlepiece = post.title.replace(/<[^>]+>/g, "").substring(0, 80) + (post.title.length > 80 ? "..." : "")

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
            <CardTitle className="text-white line-clamp-2 leading-6 hover:text-emerald-400 transition-colors">
              {titlepiece}
            </CardTitle>
            <CardDescription className="flex flex-wrap gap-2 pt-1 text-sm text-gray-400 items-center">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 mr-1 text-emerald-400" />
                {new Date(post.created_at).toLocaleDateString()}
              </span>
              <Separator orientation="vertical" className="h-4 bg-gray-700" />
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4 mr-1 text-emerald-400" />
                {post.type}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-gray-300 line-clamp-3">{descriptionpiece}</p>
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