
import * as React from "react";
import {
  type ToastActionElement,
  type ToastProps,
} from "@/components/ui/toast";

import { toast as toastOriginal } from "sonner";

// Define the types for our toast functions
type ToastFunction = typeof toastOriginal;
interface ExtendedToastFunction extends ToastFunction {
  error: (message: string) => void;
  success: (message: string) => void;
  info: (message: string) => void;
}

// Define the type for the hook return value
type ToastReturnType = {
  toast: ExtendedToastFunction;
  toasts: any[];
};

// Create a custom useToast hook
export const useToast = (): ToastReturnType => {
  const [toasts, setToasts] = React.useState<any[]>([]);
  
  return {
    toast: toast as ExtendedToastFunction,
    toasts: toasts,
  };
};

// Export the toast function with additional convenience methods
export const toast = Object.assign(toastOriginal, {
  error: (message: string) => toastOriginal(message, { 
    style: { backgroundColor: 'rgb(var(--destructive))' },
    className: 'bg-destructive text-destructive-foreground'
  }),
  success: (message: string) => toastOriginal(message, { 
    style: { backgroundColor: 'rgb(var(--success))' },
    className: 'bg-success text-success-foreground'
  }),
  info: (message: string) => toastOriginal(message, { 
    style: { backgroundColor: 'rgb(var(--primary))' },
    className: 'bg-primary text-primary-foreground'
  }),
}) as ExtendedToastFunction;
