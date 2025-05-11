
import { useToast as useShadcnToast } from "@/components/ui/toast";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

// Define a type for our custom toast functions
type CustomToastFunction = (title: string, description?: string) => void;

// Extend the base toast type
interface CustomToast {
  info: CustomToastFunction;
  success: CustomToastFunction;
  error: CustomToastFunction;
  // Include other original properties
  [key: string]: any;
}

export const useToast = () => {
  const toast = useShadcnToast();

  // Enhanced mobile-friendly toast
  const mobileToast = {
    ...toast,
    // Override with mobile-friendly variants
    info: (title: string, description?: string) => 
      toast.custom({
        title,
        description,
        className: "sm:w-full md:max-w-md fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
      }),
    success: (title: string, description?: string) => 
      toast.custom({
        title,
        description,
        variant: "default",
        className: "sm:w-full md:max-w-md bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
      }),
    error: (title: string, description?: string) => 
      toast.custom({
        title,
        description,
        variant: "destructive",
        className: "sm:w-full md:max-w-md fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
      })
  };

  return mobileToast as typeof toast & CustomToast;
};

// Get the original toast function
const originalToast = require("@/components/ui/toast").toast;

// Create our enhanced toast object with the custom methods
const enhancedToast = {
  // Spread the original toast function and its properties
  ...originalToast,
  
  // Enhanced mobile-friendly toast functions
  info: (title: string, description?: string) => 
    originalToast({
      title,
      description,
      className: "sm:w-full md:max-w-md fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
    }),
  success: (title: string, description?: string) => 
    originalToast({
      title,
      description,
      variant: "default",
      className: "sm:w-full md:max-w-md bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
    }),
  error: (title: string, description?: string) => 
    originalToast({
      title,
      description,
      variant: "destructive",
      className: "sm:w-full md:max-w-md fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
    })
};

// Export the enhanced toast with proper typing
export const toast = enhancedToast as typeof originalToast & CustomToast;
