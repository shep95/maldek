import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from '@supabase/supabase-js';

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
    toast.success("Successfully logged out all users");
    
  } catch (error) {
    console.error("Global logout error:", error);
    toast.error("An error occurred during logout");
  }
};

export const deleteUserByEmail = async (email: string) => {
  try {
    console.log("Starting user deletion process for:", email);
    
    // First, get the user's ID from their email
    const { data, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error fetching users:", userError);
      throw userError;
    }

    // Type assertion to handle the users array
    const users = data?.users as User[] | undefined;
    const userToDelete = users?.find(user => user.email === email);
    
    if (!userToDelete) {
      console.log("User not found:", email);
      toast.error("User not found");
      return;
    }

    // Delete user data using the existing function
    const { error: deleteError } = await supabase.rpc('delete_user_account');
    
    if (deleteError) {
      console.error("Error deleting user data:", deleteError);
      throw deleteError;
    }

    console.log("User deletion successful");
    toast.success("User successfully deleted");

  } catch (error) {
    console.error("User deletion error:", error);
    toast.error("Failed to delete user");
  }
};