
import { useToast as useShadcnToast, toast as shadcnToast } from "@/components/ui/toast";

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

  return mobileToast;
};

export const toast = {
  ...shadcnToast,
  // Enhanced mobile-friendly toast functions
  info: (title: string, description?: string) => 
    shadcnToast({
      title,
      description,
      className: "sm:w-full md:max-w-md fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
    }),
  success: (title: string, description?: string) => 
    shadcnToast({
      title,
      description,
      variant: "default",
      className: "sm:w-full md:max-w-md bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
    }),
  error: (title: string, description?: string) => 
    shadcnToast({
      title,
      description,
      variant: "destructive",
      className: "sm:w-full md:max-w-md fixed bottom-4 sm:bottom-auto sm:top-4 z-50 left-0 right-0 mx-auto",
    })
};
