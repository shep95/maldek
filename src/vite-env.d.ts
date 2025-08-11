/// <reference types="vite/client" />

declare global {
  interface Window {
    setIsCreatingPost?: (value: boolean) => void;
  }
}
