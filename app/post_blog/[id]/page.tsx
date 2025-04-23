'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, X } from 'lucide-react';

const BlogPost: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        toast.error(error.message || 'Failed to fetch blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
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

  // Parse tags if they are stored as a JSON string
  const parsedTags = typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags || [];
  // Parse categories if they are stored as a JSON string
  const parsedCategories = typeof blog.categories === 'string' ? JSON.parse(blog.categories) : blog.categories || [];

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center text-emerald-500 hover:text-emerald-400 mb-4"
      >
        ← Back to Blog Management
      </button>
      <h1 className="text-2xl font-bold text-white">{blog.title}</h1>
      <p className="text-gray-400 text-sm">
        Published on {new Date(blog.created_at).toLocaleDateString()}
      </p>
      <p className="text-gray-400 text-sm">
        Type: {blog.type} | Categories: {Array.isArray(parsedCategories) ? parsedCategories.join(', ') : parsedCategories || 'None'}
      </p>
      {blog.cover_image && (
        <img
          src={blog.cover_image}
          alt={`Cover for ${blog.title}`}
          className="w-full h-64 object-cover rounded-lg"
        />
      )}
      {blog.feature_image && (
        <img
          src={blog.feature_image}
          alt={`Feature image for ${blog.title}`}
          className="w-full h-64 object-cover rounded-lg mt-4"
        />
      )}
      <div className="text-gray-200">
        <div dangerouslySetInnerHTML={{ __html: blog.description }} />
      </div>
      {parsedTags && parsedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-gray-400 text-sm">Tags:</span>
          {parsedTags.map((tag: string, index: number) => (
            <span
              key={index}
              className="bg-gray-700 px-2 py-1 rounded-lg text-sm text-gray-300"
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