
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

// Export a standalone toast object that can be used without hooks
export const toast: CustomToast = {
  // Re-export the basic shadcn toast function
  ...(require("@/components/ui/toast").toast),
  
  // Enhanced mobile-friendly toast functions
  info: (title: string, description?: string) => 
    require("@/components/ui/toast").toast({
      title,
      description,
      className: "sm:w-full md:max-w-md fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
    }),
  success: (title: string, description?: string) => 
    require("@/components/ui/toast").toast({
      title,
      description,
      variant: "default",
      className: "sm:w-full md:max-w-md bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
    }),
  error: (title: string, description?: string) => 
    require("@/components/ui/toast").toast({
      title,
      description,
      variant: "destructive",
      className: "sm:w-full md:max-w-md fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
    })
};
