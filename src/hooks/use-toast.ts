
import * as React from "react";
import {
  useToast as useToastOriginal,
  type ToastActionElement,
  type ToastProps,
} from "@/components/ui/toast";

import { toast as toastOriginal } from "sonner";

// Export the original useToast hook
export const useToast = useToastOriginal;

// Export the toast function with additional convenience methods
export const toast = Object.assign(toastOriginal, {
  error: (message: string) => toastOriginal({ title: "Error", description: message, variant: "destructive" }),
  success: (message: string) => toastOriginal({ title: "Success", description: message }),
  info: (message: string) => toastOriginal({ title: "Info", description: message }),
});
