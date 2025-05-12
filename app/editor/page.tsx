'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { RefreshCw, FileText, Archive, Settings, Image, Upload, X, PlusCircle, Trash2, Tag, MoreVertical, Eye, Calendar, Edit, ImageIcon, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
const JoditEditor = dynamic(() => import('jodit-react').then((mod) => mod.default), {
    ssr: false,
});

enum BlogType {
    Events = 'Events',
    Updates = 'Updates',
    News = 'News',
    Article = 'Article',
    BlogPosts = 'Blog Posts',
}

const Editor: React.FC = () => {
    const editorRef = useRef<any>(null);
    const router = useRouter();
    const { postId } = useParams<{ postId?: string }>();

    // Draft key for localStorage
    const draftKey = postId ? `blogDraft_${postId}` : 'blogDraft_new';

    // Load saved draft from localStorage
    const savedDraft = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem(draftKey) || '{}')
        : {};

    // State for Blog Editor
    const [title, setTitle] = useState(savedDraft.title || '');
    const [tags, setTags] = useState<{ id: number; value: string }[]>(
        savedDraft.tags?.map((tag: any, index: number) => ({
            id: tag.id || Date.now() + index,
            value: tag.value || tag
        })) || []
    );
    const [categories, setCategories] = useState<string[]>(savedDraft.categories || []);
    const [type, setType] = useState(savedDraft.type || '');
    const [description, setDescription] = useState(savedDraft.description || '');
    const [newTag, setNewTag] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(savedDraft.coverImagePreview || null);
    const [coverImageBase64, setCoverImageBase64] = useState<string | null>(savedDraft.coverImageBase64 || null);
    const [isDraggingCover, setIsDraggingCover] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // State for Categories
    const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string }[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);

    // State to trigger re-fetch of categories
    const [categoryRefreshTrigger, setCategoryRefreshTrigger] = useState(0);

    // State for Add Category dialog in Settings tab
    const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');

    // State for Delete Category confirmation dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    // State for Posts List
    const [posts, setPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const postsPerPage = 5;

    // State for Delete Post confirmation dialog
    const [isDeletePostDialogOpen, setIsDeletePostDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);

    // State for Tabs
    const [activeTab, setActiveTab] = useState('posts-list');

    // State to track which post's menu is open
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // State for selected categories for filtering
    const [selectedFilterCategories, setSelectedFilterCategories] = useState<string[]>([]);
    console.log("selectedFilterCategories", selectedFilterCategories)
    // Jodit Editor Configuration
    const config = {
        readonly: false,
        height: 'auto',
        toolbar: true,
        autofocus: !description,
        uploader: {
            insertImageAsBase64URI: true,
            imagesExtensions: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        },
        style: {
            background: '#1F2937',
            color: '#D1D5DB',
            border: '1px solid #374151',
        },
    };

    // Save draft to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const draft = {
            title,
            tags,
            categories,
            type,
            description,
            coverImagePreview,
            coverImageBase64,
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
    }, [
        title,
        tags,
        categories,
        type,
        description,
        coverImagePreview,
        coverImageBase64,
    ]);

    // Convert file to Base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Image handling for cover image
    const handleCoverDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingCover(true);
    };

    const handleCoverDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingCover(false);
    };

    const handleCoverDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingCover(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                toast.error('Only JPG, PNG, GIF, or WEBP images are allowed');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setCoverImage(file);
            const base64 = await fileToBase64(file);
            setCoverImagePreview(base64);
            setCoverImageBase64(base64);
        }
    };

    const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                toast.error('Only JPG, PNG, GIF, or WEBP images are allowed');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            setCoverImage(file);
            const base64 = await fileToBase64(file);
            setCoverImagePreview(base64);
            setCoverImageBase64(base64);
        }
    };

    // Tag and category handling
    const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTag(e.target.value);
    };

    const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmedTag = newTag.trim();
            if (trimmedTag && !tags.some((tag) => tag.value.toLowerCase() === trimmedTag.toLowerCase())) {
                setTags([...tags, { id: Date.now(), value: trimmedTag }]);
            }
            setNewTag('');
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCategoryId = e.target.value;
        if (selectedCategoryId && !categories.includes(selectedCategoryId)) {
            setCategories([...categories, selectedCategoryId]);
        }
        setNewCategory('');
    };

    const removeCategory = (categoryToRemove: string) => {
        setCategories(categories.filter((category) => category !== categoryToRemove));
    };

    const removeTag = (id: number) => {
        setTags(tags.filter((tag) => tag.id !== id));
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setType(e.target.value);
    };

    // Function to add a new category
    const handleAddCategory = async (categoryName: string, fromSettingsTab: boolean = false) => {
        if (!categoryName.trim()) {
            toast.error('Category name cannot be empty');
            return false;
        }

        try {
            const { data, error } = await supabase
                .from('categories')
                .insert({ categoriesName: categoryName.trim() })
                .select('id, categoriesName')
                .single();

            if (error) throw error;

            // Trigger re-fetch of categories
            setCategoryRefreshTrigger((prev) => prev + 1);

            if (fromSettingsTab) {
                setNewCategoryInput('');
                setIsAddCategoryDialogOpen(false);
            }

            toast.success('Category added successfully!', {
                position: 'top-center',
            });
            return true;
        } catch (error: any) {
            toast.error(`Failed to add category: ${error.message}`, {
                position: "top-center",
            });
            return false;
        }
    };

    // Function to delete a category
    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryToDelete);

            if (error) throw error;

            // Trigger re-fetch of categories
            setCategoryRefreshTrigger((prev) => prev + 1);
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
            toast.success('Category deleted successfully!', {
                position: 'top-center',
            });
        } catch (error: any) {
            toast.error(`Failed to delete category: ${error.message}`, {
                position: 'top-center',
            });
        }
    };

    // Function to clear all fields and localStorage
    const handleClearFields = () => {
        setTitle('');
        setTags([]);
        setCategories([]);
        setType('');
        setDescription('');
        setCoverImage(null);
        setCoverImagePreview(null);
        setCoverImageBase64(null);
        setNewTag('');
        setNewCategory('');
        setError(null);
        localStorage.removeItem(draftKey);
        localStorage.removeItem('editingPostId');
        toast.success('Fields cleared successfully!', {
            position: 'top-center',
        });
    };

    // Form submission
    const handleSubmit = async () => {
        // Validation with toast
        if (!title.trim()) {
            toast.error('Title is required');
            setError('Title is required');
            return;
        }
        if (!description.trim()) {
            toast.error('Description is required');
            setError('Description is required');
            return;
        }
        if (!type) {
            toast.error('Blog type is required');
            setError('Blog type is required');
            return;
        }
        if (categories.length === 0) {
            toast.error('At least one category is required');
            setError('At least one category is required');
            return;
        }
        setError(null);

        setIsLoading(true);

        const blogData = {
            title,
            description,
            cover_image: coverImageBase64 || null,
            categories,
            tags: tags.map((tag) => tag.value),
            type,
            isPublished: false
        };

        try {
            // Check if editing an existing post
            const editingPostId = typeof window !== 'undefined' ? localStorage.getItem('editingPostId') : null;

            if (editingPostId) {
                const { error } = await supabase
                    .from('blogs')
                    .update(blogData)
                    .eq('id', editingPostId);

                if (error) throw error;
                toast.success('Blog updated successfully!', {
                    position: 'top-center',
                });
                console.log('Blog updated successfully!');
                fetchPosts();
                setActiveTab('posts-list');
            } else {
                const { error } = await supabase.from('blogs').insert(blogData);

                if (error) throw error;
                toast.success('Blog created successfully!', {
                    position: 'top-center',
                });
                console.log('Blog created successfully!');
                fetchPosts();
            }

            // Clear draft and editing post ID from localStorage
            localStorage.removeItem(draftKey);
            localStorage.removeItem('editingPostId');

            // Reset form state
            setTitle('');
            setTags([]);
            setCategories([]);
            setType('');
            setDescription('');
            setCoverImage(null);
            setCoverImagePreview(null);
            setCoverImageBase64(null);
            setNewTag('');
            setNewCategory('');
            setError(null);

        } catch (error: any) {
            console.error('Supabase error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
            });
            toast.error(
                `Failed to ${editingPostId ? 'update' : 'create'} blog post: ${error.message} (Code: ${error.code || 'Unknown'})`,
                {
                    position: 'top-center',
                }
            );
            setError(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Function to delete a post
    const handleDeletePost = async () => {
        if (!postToDelete) return;

        try {
            const { error } = await supabase
                .from('blogs')
                .delete()
                .eq('id', postToDelete);

            if (error) throw error;

            // Refresh posts list
            setPosts((prev) => prev.filter((post) => post.id !== postToDelete));
            setIsDeletePostDialogOpen(false);
            setPostToDelete(null);
            toast.success('Post deleted successfully!', {
                position: 'top-center',
            });
            fetchPosts();
        } catch (error: any) {
            toast.error(`Failed to delete post: ${error.message}`, {
                position: 'top-center',
            });
        }
    };

    // Function to handle edit action
    const handleEditPost = (post: any) => {
        // Set the active tab to blog-editor
        setActiveTab('blog-editor');

        // Store post ID in localStorage for editing
        if (typeof window !== 'undefined') {
            localStorage.setItem('editingPostId', post.id);
        }

        // Populate form fields with post data
        setTitle(post.title || '');
        setDescription(post.description || '');
        setType(post.type || '');
        setCoverImagePreview(post.cover_image || null);
        setCoverImageBase64(post.cover_image || null);
        setCoverImage(null); // Clear file input since we don't have the original file

        // Handle categories
        const postCategories = typeof post.categories === 'string'
            ? JSON.parse(post.categories)
            : Array.isArray(post.categories)
                ? post.categories
                : [];
        setCategories(postCategories.map((id: any) => id.toString()) || []);

        // Handle tags
        let postTags: string[] = [];
        try {
            postTags = typeof post.tags === 'string'
                ? JSON.parse(post.tags)
                : Array.isArray(post.tags)
                    ? post.tags
                    : [];
        } catch (error) {
            console.error('Error parsing tags:', error);
            postTags = [];
        }
        setTags(postTags.map((tag: string, index: number) => ({
            id: Date.now() + index,
            value: tag
        })) || []);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenuId) {
                const menuElements = document.querySelectorAll(`[data-menu-id="${openMenuId}"]`);
                const buttonElements = document.querySelectorAll(`[data-button-id="${openMenuId}"]`);
                let isClickInside = false;

                menuElements.forEach((menu) => {
                    if (menu && menu.contains(event.target)) {
                        isClickInside = true;
                    }
                });

                buttonElements.forEach((button) => {
                    if (button && button.contains(event.target)) {
                        isClickInside = true;
                    }
                });

                if (!isClickInside) {
                    setOpenMenuId(null);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [openMenuId]);

    // Fetch categories from Supabase
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

    const fetchPosts = async (page: number = 1, query: string = '', categoryIds: string[] = []) => {
        setPostsLoading(true);
        setPostsError(null);
        try {
            let queryBuilder = supabase
                .from('blogs')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * postsPerPage, page * postsPerPage - 1);

            if (query.trim()) {
                queryBuilder = queryBuilder.ilike('title', `%${query}%`);
            }

            if (categoryIds.length > 0) {
                // Ensure categoryIds are quoted strings in a JSON array
                const formattedCategoryIds = categoryIds.map(id => id.toString());
                console.log('Filtering with categoryIds:', formattedCategoryIds);
                // Use the contains operator with a JSON string
                queryBuilder = queryBuilder.contains('categories', JSON.stringify(formattedCategoryIds));
            }

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
    // Fetch posts on mount and when search query, page, or categories change
    useEffect(() => {
        fetchPosts(currentPage, searchQuery, selectedFilterCategories);
    }, [currentPage, searchQuery, selectedFilterCategories]);

    // Toggle category selection for filtering
    const toggleCategoryFilter = (categoryId: string) => {
        setSelectedFilterCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Render Blog Editor Tab
    const renderBlogEditorTab = () => (
        <div className="sm:p-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Blog Title */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-emerald-500" />
                        Blog Title
                    </label>
                    <input
                        type="text"
                        placeholder="Enter blog title"
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Blog Tags */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-emerald-500" />
                        Blog Tags
                    </label>
                    <div className="border border-gray-700 rounded-lg p-3 bg-gray-800">
                        <input
                            type="text"
                            className="w-full outline-none bg-transparent text-sm text-gray-200"
                            value={newTag}
                            onChange={handleTagInput}
                            onKeyDown={handleTagKeyPress}
                            placeholder="Press enter to add tags"
                        />
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag) => (
                                    <div
                                        key={tag.id}
                                        className="bg-gray-700 px-2 py-1 flex items-center rounded-lg"
                                    >
                                        <span className="text-sm text-gray-300">{tag.value}</span>
                                        <button
                                            className="text-red-400 ml-1 hover:text-red-600"
                                            onClick={() => removeTag(tag.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Type */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-emerald-500" />
                        Type
                    </label>
                    <select
                        value={type}
                        onChange={handleTypeChange}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="" disabled>
                            Select Type
                        </option>
                        {Object.values(BlogType).map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Blog Category */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-emerald-500" />
                        Blog Category
                    </label>
                    {categoriesLoading && (
                        <div className="flex items-center">
                            <RefreshCw className="animate-spin h-4 w-4 text-emerald-500 mr-2" />
                            <span className="text-gray-400 text-sm">Loading categories...</span>
                        </div>
                    )}
                    {categoriesError && (
                        <p className="text-red-solemn text-sm flex items-center">
                            <X className="h-4 w-4 mr-1" />
                            {categoriesError}
                        </p>
                    )}
                    {!categoriesLoading && !categoriesError && (
                        <select
                            value={newCategory}
                            onChange={handleCategoryChange}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="">Select a category</option>
                            {availableCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((categoryId, index) => (
                            <div
                                key={index}
                                className="flex items-center bg-gray-700 px-2 py-1 rounded-lg"
                            >
                                <span className="text-sm text-gray-300">
                                    {availableCategories.find((cat) => cat.id === categoryId)?.name || 'Category'}
                                </span>
                                <button
                                    className="ml-2 text-red-400 hover:text-red-600"
                                    onClick={() => removeCategory(categoryId)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Cover Image */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 flex items-center">
                        <Image className="mr-2 h-4 w-4 text-emerald-500" />
                        Upload Cover Image
                    </label>
                    <div
                        className={`border-2 border-dashed ${isDraggingCover ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 bg-gray-800'
                            } p-4 text-center rounded-lg`}
                        onDragOver={handleCoverDragOver}
                        onDragLeave={handleCoverDragLeave}
                        onDrop={handleCoverDrop}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverImageChange}
                            id="cover-image-upload"
                            aria-label="Upload cover image"
                        />
                        <label htmlFor="cover-image-upload" className="cursor-pointer text-gray-400">
                            <Upload className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                            Click to upload or drag an image here
                        </label>
                        {coverImagePreview && (
                            <img
                                src={coverImagePreview}
                                alt={coverImage ? `Preview of ${coverImage.name}` : 'Cover image preview'}
                                className="mt-2 w-full h-auto rounded-lg"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-emerald-500" />
                    Blog Description
                </label>
                <JoditEditor
                    ref={editorRef}
                    value={description}
                    config={config}
                    onBlur={(content) => setDescription(content)}
                    className="border border-gray-700 rounded-lg"
                />
            </div>

            <div className="flex justify-end items-center space-x-4">
                {isLoading && <RefreshCw className="animate-spin h-5 w-5 text-emerald-500" />}
                <button
                    onClick={handleClearFields}
                    disabled={isLoading}
                    className="flex items-center justify-center text-sm sm:text-base px-4 py-2 bg-gray-600 text-white font-medium rounded-lg shadow hover:bg-gray-700 focus:ring-4 focus:ring-gray-500/50 transition-all duration-200"
                >
                    Clear Fields
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center justify-center text-sm sm:text-base px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg shadow hover:from-emerald-700 hover:to-emerald-800 focus:ring-4 focus:ring-emerald-500/50 transition-all duration-200"
                >
                    {isLoading ? 'Processing...' : localStorage.getItem('editingPostId') ? 'Update' : 'Publish'}
                </button>
            </div>

            {error && (
                <p className="text-red-400 text-sm flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );

    // Render Posts List Tab
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
            const maxPagesToShow = 5; // Maximum page numbers to display at once
            const pageNumbers: (number | string)[] = [];
            const ellipsis = '...';

            if (totalPages <= maxPagesToShow) {
                // If total pages are less than or equal to max, show all
                for (let i = 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                // Always show first page
                pageNumbers.push(1);

                // Calculate start and end pages to show around current page
                let startPage = Math.max(2, currentPage - 1);
                let endPage = Math.min(totalPages - 1, currentPage + 1);

                // Adjust start and end to ensure we show maxPagesToShow pages (including 1 and totalPages)
                if (currentPage <= 3) {
                    endPage = maxPagesToShow - 1;
                } else if (currentPage >= totalPages - 2) {
                    startPage = totalPages - (maxPagesToShow - 2);
                }

                // Add ellipsis after first page if needed
                if (startPage > 2) {
                    pageNumbers.push(ellipsis);
                }

                // Add middle page numbers
                for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(i);
                }

                // Add ellipsis before last page if needed
                if (endPage < totalPages - 1) {
                    pageNumbers.push(ellipsis);
                }

                // Always show last page
                if (totalPages > 1) {
                    pageNumbers.push(totalPages);
                }
            }

            return pageNumbers;
        };

        return (
            <div className="space-y-6 sm:p-4 bg-gray-950 rounded-xl">
                <h3 className="sm:text-xl font-bold text-lg text-white tracking-wide flex items-center gap-2">
                    <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
                    Private Blogs
                </h3>

                <div className="flex flex-col xl:flex-row gap-6">
                    {/* Post Cards Section (70%) */}
                    <div className="w-full xl:w-[70%] order-2 xl:order-1">
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
                                <p className="text-gray-400">No posts found.</p>
                            </div>
                        )}

                        {!postsLoading && !postsError && posts.length > 0 && (
                            <div className="grid grid-cols-1 gap-4">
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group relative"
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            {/* Image */}
                                            <div className="relative w-full md:w-48 h-48 md:h-auto overflow-hidden">
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
                                            <div className="flex-1 p-3 sm:p-4 md:p-5">
                                                <h4 className="text-base sm:text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300">
                                                    {post.title}
                                                </h4>
                                                <div className="flex text-xs flex-wrap gap-2 mt-2 sm:text-sm text-gray-400 items-center">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4 text-emerald-400" />
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </span>
                                                    <Separator orientation="vertical" className="h-4 bg-gray-700" />
                                                    <span className="flex items-center gap-1">
                                                        <Tag className="h-4 w-4 text-emerald-400" />
                                                        {post.type}
                                                    </span>
                                                    <Separator orientation="vertical" className="h-4 bg-gray-700" />
                                                    <span className="flex items-center gap-1">
                                                        {post.isPublished ? (
                                                            <Globe className="h-4 w-4 text-emerald-400" />
                                                        ) : (
                                                            <Lock className="h-4 w-4 text-red-400" />
                                                        )}
                                                        {post.isPublished ? 'Published' : 'Private'}
                                                    </span>
                                                </div>
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

                                            {/* Actions */}
                                            <div className="flex flex-row md:flex-col gap-2 p-3 sm:p-4 md:p-5 md:border-l border-gray-700 bg-gray-900/30">
                                                <Button
                                                    onClick={() => {
                                                        router.push(`/editor/${post.id}`);
                                                    }}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                                                    onClick={() => handleEditPost(post)}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-400 hover:text-white hover:bg-red-900/50"
                                                    onClick={() => {
                                                        setPostToDelete(post.id);
                                                        setIsDeletePostDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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

                    {/* Search and Category Filter Section (30%) */}
                    <div className="w-full xl:w-[30%] order-1 xl:order-2 bg-gray-900 border border-gray-800 rounded-lg p-4 h-fit">
                        <h4 className="text-white text-md font-semibold mb-2">Search</h4>
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                        />

                        <h4 className="text-white text-sm sm:text-md font-semibold mb-2">Filter by Category</h4>
                        {categoriesLoading && (
                            <div className="flex items-center">
                                <RefreshCw className="animate-spin h-4 w-4 text-emerald-500 mr-2" />
                                <span className="text-gray-400 text-sm">Loading categories...</span>
                            </div>
                        )}
                        {categoriesError && (
                            <p className="text-red-400 text-sm flex items-center">
                                <X className="h-4 w-4 mr-1" />
                                {categoriesError}
                            </p>
                        )}
                        {!categoriesLoading && !categoriesError && availableCategories.length === 0 && (
                            <p className="text-gray-400">No categories available.</p>
                        )}
                        {!categoriesLoading && !categoriesError && availableCategories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {availableCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => toggleCategoryFilter(category.id)}
                                        className={`px-3 py-1 rounded-full text-xs sm:text-sm transition-all duration-200 ${selectedFilterCategories.includes(category.id)
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                {isDeletePostDialogOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-0">
                        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-lg font-semibold text-white mb-2 sm:mb-4">Confirm Deletion</h3>
                            <p className="text-gray-300 mb-4">
                                Are you sure you want to delete the post "
                                {posts.find((post) => post.id === postToDelete)?.title}"?
                            </p>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => {
                                        setIsDeletePostDialogOpen(false);
                                        setPostToDelete(null);
                                    }}
                                    className="px-4 py-2 bg-gray-600 text-sm sm:text-base text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeletePost}
                                    className="px-4 py-2 bg-red-600 text-sm sm:text-base text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render Settings Tab
    const renderSettingsTab = () => (
        <div className="sm:px-4 space-y-4">
            <h3 className="text-lg font-semibold text-white mt-6">Manage Categories</h3>
            <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Categories</span>
                    <button
                        onClick={() => setIsAddCategoryDialogOpen(true)}
                        className="flex items-center text-sm sm:text-base px-2 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200"
                    >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Category
                    </button>
                </div>

                {categoriesLoading && (
                    <div className="flex items-center">
                        <RefreshCw className="animate-spin h-4 w-4 text-emerald-500 mr-2" />
                        <span className="text-gray-400 text-sm">Loading categories...</span>
                    </div>
                )}
                {categoriesError && (
                    <p className="text-red-400 text-sm flex items-center">
                        <X className="h-4 w-4 mr-1" />
                        {categoriesError}
                    </p>
                )}
                {!categoriesLoading && !categoriesError && availableCategories.length === 0 && (
                    <p className="text-gray-400">No categories found.</p>
                )}
                {!categoriesLoading && !categoriesError && availableCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {availableCategories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center bg-gray-700 px-3 py-1 rounded-lg"
                            >
                                <span className="text-xs sm:text-sm text-gray-300">{category.name}</span>
                                <button
                                    onClick={() => {
                                        setCategoryToDelete(category.id);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                    className="ml-2 text-red-400 hover:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Category Dialog */}
            {isAddCategoryDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-0">
                    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold text-white mb-2 sm:mb-4">Add New Category</h3>
                        <input
                            type="text"
                            placeholder="Enter category name"
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500 mb-4"
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setIsAddCategoryDialogOpen(false);
                                    setNewCategoryInput('');
                                }}
                                className="px-4 py-2 bg-gray-600 text-sm sm:text-base text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    const success = await handleAddCategory(newCategoryInput, true);
                                    if (success) {
                                        setIsAddCategoryDialogOpen(false);
                                        setNewCategoryInput('');
                                    }
                                }}
                                className="px-4 py-2 bg-emerald-600 text-sm sm:text-base text-white rounded-lg hover:bg-emerald-700 transition-all duration-200"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {isDeleteDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-0">
                    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold text-white mb-2 sm:mb-4">Confirm Deletion</h3>
                        <p className="text-gray-300 mb-4">
                            Are you sure you want to delete the category "
                            {availableCategories.find((cat) => cat.id === categoryToDelete)?.name}"?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setCategoryToDelete(null);
                                }}
                                className="px-4 py-2 bg-gray-600 text-sm sm:text-base text-white rounded-lg hover:bg-gray-700 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCategory}
                                className="px-4 py-2 bg-red-600 text-sm sm:text-base text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="lg:px-4 space-y-4 w-full">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Blog Management</h2>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-gray-700 pt-3 pb-4">
                <button
                    onClick={() => setActiveTab('posts-list')}
                    className={`flex text-xs items-center px-4 py-2 rounded-lg transition-all duration-200 sm:text-sm ${activeTab === 'posts-list'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    <Archive className="h-4 w-4 mr-2" />
                    Posts List
                </button>
                <button
                    onClick={() => setActiveTab('blog-editor')}
                    className={`flex text-xs items-center px-4 py-2 rounded-lg transition-all duration-200 sm:text-sm ${activeTab === 'blog-editor'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Blog Editor
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex text-xs items-center px-4 py-2 rounded-lg transition-all duration-200 sm:text-sm ${activeTab === 'settings'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                </button>
            </div>

            {/* Tabs Content */}
            {activeTab === 'blog-editor' && renderBlogEditorTab()}
            {activeTab === 'posts-list' && renderPostsListTab()}
            {activeTab === 'settings' && renderSettingsTab()}
        </div>
    );
};

export default Editor;