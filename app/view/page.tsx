'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  RefreshCw,
  X,
  ImageIcon,
  Calendar,
  Tag,
  Globe,
  ChevronLeft,
} from 'lucide-react';

export default function ViewPage() {
  const router = useRouter();

  // State Management
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [postsPerPage] = useState(9); // Adjusted for a full-width layout
  const [availableCategories, setAvailableCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoryRefreshTrigger, setCategoryRefreshTrigger] = useState(0);

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, categoriesName')
          .order('categoriesName', { ascending: true });

        if (error) throw error;
        setAvailableCategories(
          data.map((cat: any) => ({
            id: cat.id.toString(),
            name: cat.categoriesName,
          })) || []
        );
      } catch (error: any) {
        setCategoriesError(error.message || 'Failed to fetch categories');
        toast.error(error.message || 'Failed to fetch categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [categoryRefreshTrigger]);

  // Fetch Posts with Pagination
  const fetchPosts = async (page: number = 1) => {
    setPostsLoading(true);
    setPostsError(null);
    try {
      let queryBuilder = supabase
        .from('blogs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .eq('isPublished', true) // Only fetch published blogs
        .range((page - 1) * postsPerPage, page * postsPerPage - 1);

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      setPosts(data || []);
      setTotalPages(Math.ceil((count || 0) / postsPerPage));
      setCurrentPage(page);
    } catch (error: any) {
      setPostsError(error.message || 'Failed to fetch posts');
      toast.error(error.message || 'Failed to fetch posts');
    } finally {
      setPostsLoading(false);
    }
  };

  // Fetch Blogs on Mount
  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const renderPostsListTab = () => {
    const getCategoryNames = (categoryData: string | string[]): string[] => {
      try {
        const categoryIds: string[] =
          typeof categoryData === 'string' ? JSON.parse(categoryData) : categoryData || [];
        return categoryIds
          .map((id: string) => {
            const category = availableCategories.find((cat: { id: string; name: string }) => cat.id === id.toString());
            return category ? category.name : 'Unknown';
          })
          .filter((name: string) => name !== 'Unknown');
      } catch {
        return [];
      }
    };

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
      const maxPagesToShow = 5;
      const pageNumbers: (number | string)[] = [];
      const ellipsis = '...';

      if (totalPages <= maxPagesToShow) {
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);

        if (currentPage <= 3) {
          endPage = maxPagesToShow - 1;
        } else if (currentPage >= totalPages - 2) {
          startPage = totalPages - (maxPagesToShow - 2);
        }

        if (startPage > 2) {
          pageNumbers.push(ellipsis);
        }

        for (let i = startPage; i <= endPage; i++) {
          pageNumbers.push(i);
        }

        if (endPage < totalPages - 1) {
          pageNumbers.push(ellipsis);
        }

        if (totalPages > 1) {
          pageNumbers.push(totalPages);
        }
      }

      return pageNumbers;
    };

    return (
      <div className="space-y-6 sm:p-4 bg-gray-950 rounded-xl">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm sm:text-base text-emerald-400 hover:text-emerald-300 bg-gray-800/50 hover:bg-gray-800/75 px-4 py-2 rounded-lg transition-all duration-200 group"
        >
          <ChevronLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Blogs
        </button>
        <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
          Published Blogs
        </h3>
        <div className="w-full">
          {postsLoading && (
            <div className="flex justify-center py-8">
              <RefreshCw className="animate-spin h-6 w-6 text-emerald-500" />
            </div>
          )}

          {postsError && (
            <p className="text-red-400 text-sm flex items-center">
              <X className="h-4 w-4 mr-1" />
              {postsError}
            </p>
          )}

          {!postsLoading && !postsError && posts.length === 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">No published blogs found.</p>
            </div>
          )}

          {!postsLoading && !postsError && posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => {
                const descriptionpiece = post.description
                  ? post.description.replace(/<[^>]+>/g, '').substring(0, 150) + (post.description.length > 150 ? '...' : '')
                  : '';

                return (
                  <Link href={`/view/${post.id}`} key={post.id}>
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group relative">
                      <div className="flex flex-col">
                        {/* Image */}
                        <div className="relative w-full h-48 overflow-hidden">
                          {post.cover_image ? (
                            <img
                              src={post.cover_image}
                              alt={`Cover for ${post.title}`}
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <ImageIcon className="h-12 w-12 text-gray-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h4 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300 line-clamp-1">
                            {post.title}
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-400 items-center">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 mr-1 text-emerald-400" />
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            <Separator orientation="vertical" className="h-4 bg-gray-700" />
                            <span className="flex items-center gap-1">
                              <Tag className="h-4 w-4 mr-1 text-emerald-400" />
                              {post.type}
                            </span>
                            <Separator orientation="vertical" className="h-4 bg-gray-700" />
                            <span className="flex items-center gap-1">
                              <Globe className="h-4 w-4 mr-1 text-emerald-400" />
                              Published
                            </span>
                          </div>
                          <p className="text-gray-300 mt-3">{descriptionpiece}</p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {getCategoryNames(post.categories).map((categoryName, index) => (
                              <span
                                key={index}
                                className="bg-emerald-900/25 text-emerald-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-emerald-700/50 group-hover:bg-emerald-900/75 transition-colors duration-300"
                              >
                                {categoryName}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {!postsLoading && !postsError && posts.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {getPageNumbers().map((page, index) =>
                  typeof page === 'number' ? (
                    <Button
                      key={index}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? 'default' : 'outline'}
                      className={`${currentPage === page
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                        } min-w-[40px]`}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="text-gray-400 flex items-center">
                      {page}
                    </span>
                  )
                )}
              </div>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {renderPostsListTab()}
    </div>
  );
}