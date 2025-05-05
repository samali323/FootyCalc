'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, X, ChevronLeft, Calendar, Tag, Globe, Lock } from 'lucide-react';

const BlogPost: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
        toast.error(error.message || 'Failed to fetch categories', {
          position: 'top-center',
          style: { marginTop: '20px' },
        });
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Blog not found');
        setBlog(data);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch blog post');
        toast.error(error.message || 'Failed to fetch blog post', {
          position: 'top-center',
          style: { marginTop: '20px' },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  // Function to toggle isPublished status
  const handleTogglePublish = async () => {
    if (!blog) return;

    setIsUpdating(true);
    try {
      const newIsPublished = !blog.isPublished;
      const { error } = await supabase
        .from('blogs')
        .update({ isPublished: newIsPublished })
        .eq('id', blog.id);

      if (error) throw error;

      // Update local state
      setBlog((prev: any) => ({ ...prev, isPublished: newIsPublished }));
      toast.success(
        newIsPublished ? 'Blog is now public!' : 'Blog is now private!',
        {
          position: 'top-center',
          style: { marginTop: '20px' },
        }
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to update blog status', {
        position: 'top-center',
        style: { marginTop: '20px' },
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Map category IDs to names using availableCategories
  const getCategoryNames = (categoryData: string | string[]): string[] => {
    try {
      const categoryIds: string[] = typeof categoryData === 'string' ? JSON.parse(categoryData) : categoryData || [];
      return categoryIds
        .map((id: string) => {
          const category = availableCategories.find((cat: { id: string; name: string }) => cat.id === id.toString());
          return category ? category.name : 'Unknown';
        })
        .filter((name: string) => name !== 'Unknown');
    } catch (error) {
      return [];
    }
  };

  if (loading || categoriesLoading) {
    return (
      <div className="flex justify-center p-4">
        <RefreshCw className="animate-spin h-5 w-5 text-emerald-500" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="p-4">
        <p className="text-red-400 text-sm flex items-center">
          <X className="h-4 w-4 mr-1" />
          {error || 'Blog post not found'}
        </p>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="p-4">
        <p className="text-red-400 text-sm flex items-center">
          <X className="h-4 w-4 mr-1" />
          {categoriesError}
        </p>
      </div>
    );
  }

  // Parse tags if they are stored as a JSON string
  const parsedTags = typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags || [];

  return (
    <div className="p-6 space-y-6 mx-auto">
      {/* Back Button and Toggle Publish Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/editor")}
          className="flex items-center text-emerald-400 hover:text-emerald-300 bg-gray-800/50 hover:bg-gray-800/75 px-4 py-2 rounded-lg transition-all duration-200 group"
        >
          <ChevronLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Blog Management
        </button>
        <button
          onClick={handleTogglePublish}
          disabled={isUpdating}
          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${blog.isPublished
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {blog.isPublished ? (
            <>
              <Lock className="h-5 w-5 mr-2" />
              Make Private
            </>
          ) : (
            <>
              <Globe className="h-5 w-5 mr-2" />
              Make Public
            </>
          )}
        </button>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
        {blog.title}
      </h1>

      {/* Meta Information */}
      <div className="flex flex-wrap items-center space-x-4 text-gray-400 text-sm">
        <p className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-emerald-400" />
          Published: <span className="text-gray-300 ml-2">{new Date(blog.created_at).toLocaleDateString()}</span>
        </p>
        <div className="h-4 w-px bg-gray-600"></div>
        <p className="flex items-center">
          <Tag className="h-4 w-4 mr-2 text-emerald-400" />
          Type: <span className="text-gray-300 ml-2">{blog.type}</span>
        </p>
        <div className="h-4 w-px bg-gray-600"></div>
        <p className="flex items-center">
          <Tag className="h-4 w-4 mr-2 text-emerald-400" />
          Categories:
          {getCategoryNames(blog.categories).length > 0 ? (
            getCategoryNames(blog.categories).map((categoryName: string, index: number) => (
              <span
                key={index}
                className="bg-emerald-900/25 text-emerald-300 text-xs font-medium px-2.5 py-0.5 rounded-full border border-emerald-700/50 hover:bg-emerald-900/75 transition-colors duration-300 ml-2"
              >
                {categoryName}
              </span>
            ))
          ) : (
            <span className="text-gray-300 ml-2">None</span>
          )}
        </p>
        <div className="h-4 w-px bg-gray-600"></div>
        <p className="flex items-center">
          {blog.isPublished ? (
            <Globe className="h-4 w-4 mr-2 text-emerald-400" />
          ) : (
            <Lock className="h-4 w-4 mr-2 text-red-400" />
          )}
          Status: <span className="text-gray-300 ml-2">{blog.isPublished ? 'Published' : 'Private'}</span>
        </p>
      </div>

      {/* Cover Image */}
      {blog.cover_image && (
        <div className="relative rounded-xl overflow-hidden shadow-lg m-8">
          <img
            src={blog.cover_image}
            alt={`Cover for ${blog.title}`}
            className="w-full max-h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert max-w-none text-gray-200 space-y-6">
        <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2 ml-10">
          <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
          Blog Description
        </h3>
        <div dangerouslySetInnerHTML={{ __html: blog.description }} />
      </div>

      {/* Tags */}
      <hr className="border-emerald-800/90" />
      {parsedTags && parsedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-gray-200 text-sm font-medium">Tags:</span>
          {parsedTags.map((tag: string, index: number) => (
            <span
              key={index}
              className="bg-emerald-900/50 text-emerald-300 text-xs font-medium px-3 py-1 rounded-full border border-emerald-700/50 hover:bg-emerald-800/70 transition-colors duration-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPost;