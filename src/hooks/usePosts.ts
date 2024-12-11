import { useState, useEffect } from "react";
import { Post } from "@/utils/postUtils";

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = () => {
      setIsLoading(true);
      try {
        const savedPosts = localStorage.getItem("posts");
        console.log("Loading posts from localStorage:", savedPosts);
        if (savedPosts) {
          setPosts(JSON.parse(savedPosts));
        }
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  useEffect(() => {
    try {
      console.log("Saving posts to localStorage:", posts);
      localStorage.setItem("posts", JSON.stringify(posts));
    } catch (error) {
      console.error("Error saving posts:", error);
    }
  }, [posts]);

  return { posts, setPosts, isLoading };
};