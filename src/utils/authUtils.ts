import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const logoutAllUsers = async () => {
  try {
    console.log("Starting global logout process...");
    
    // Clear all Supabase-related items from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.')) {
        console.log('Removing localStorage item:', key);
        localStorage.removeItem(key);
      }
    });
    
    // Sign out the current user
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error during sign out:", error);
      throw error;
    }
    
    console.log("Global logout successful");
    toast.success("Successfully logged out");
    
    // Force reload the page to ensure clean state
    window.location.href = '/auth';
    
  } catch (error) {
    console.error("Global logout error:", error);
    toast.error("An error occurred during logout");
  }
};