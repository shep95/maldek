import { useState, useEffect } from "react";
import { Post } from "@/utils/postUtils";
import { toast } from "sonner";

const POSTS_STORAGE_KEY = 'maldek_posts_v1';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  // Load posts from localStorage
  useEffect(() => {
    try {
      const savedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts).map((post: any) => ({
          ...post,
          timestamp: new Date(post.timestamp)
        }));
        console.log('Loading posts from localStorage:', parsedPosts);
        setPosts(parsedPosts);
      }
    } catch (error) {
      console.error('Error loading posts from localStorage:', error);
      toast.error('Error loading saved posts');
    }
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    try {
      const postsToSave = posts.map(post => ({
        ...post,
        timestamp: post.timestamp.toISOString() // Convert Date to string for storage
      }));
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(postsToSave));
      console.log('Saved posts to localStorage:', postsToSave);
    } catch (error) {
      console.error('Error saving posts to localStorage:', error);
      toast.error('Error saving posts');
    }
  }, [posts]);

  return { posts, setPosts };
};