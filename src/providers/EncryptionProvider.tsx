
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { encryptionService } from "@/services/encryptionService";
import { toast } from "sonner";

interface EncryptionContextType {
  isEncryptionInitialized: boolean;
  initializeEncryption: (securityCode: string) => Promise<boolean>;
  encryptText: (text: string) => Promise<string | null>;
  decryptText: (encryptedText: string) => Promise<string | null>;
  encryptFile: (file: File) => Promise<{encryptedFile: File, metadata: string} | null>;
  decryptFile: (file: File | Blob, metadata: string) => Promise<File | null>;
  uploadEncryptedFile: (file: File, bucket: string, folder: string) => Promise<{filePath: string, metadata: string} | null>;
  downloadAndDecryptFile: (filePath: string, bucket: string, metadata: string) => Promise<File | null>;
  encryptConfig: (configData: Record<string, any>) => Promise<string | null>;
  decryptConfig: (encryptedConfig: string) => Promise<Record<string, any> | null>;
  secureStore: (key: string, value: string) => Promise<boolean>;
  secureRetrieve: (key: string) => Promise<string | null>;
}

const EncryptionContext = createContext<EncryptionContextType | null>(null);

export const useEncryption = () => {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error("useEncryption must be used within an EncryptionProvider");
  }
  return context;
};

export const EncryptionProvider = ({ children }: { children: ReactNode }) => {
  const [isEncryptionInitialized, setIsEncryptionInitialized] = useState(false);

  // Check if encryption is initialized on mount
  useEffect(() => {
    const checkEncryption = () => {
      const initialized = encryptionService.isInitialized();
      setIsEncryptionInitialized(initialized);
    };

    // Check encryption status
    checkEncryption();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // Reset encryption service on sign out
        encryptionService.reset();
        setIsEncryptionInitialized(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Initialize encryption with a security code
  const initializeEncryption = async (securityCode: string) => {
    try {
      const result = await encryptionService.initialize(securityCode);
      setIsEncryptionInitialized(result);
      return result;
    } catch (error) {
      console.error("Error initializing encryption:", error);
      toast.error("Failed to initialize encryption");
      return false;
    }
  };

  // Encryption methods that proxy to the encryptionService
  const encryptText = (text: string) => encryptionService.encryptText(text);
  const decryptText = (encryptedText: string) => encryptionService.decryptText(encryptedText);
  const encryptFile = (file: File) => encryptionService.encryptFile(file);
  const decryptFile = (file: File | Blob, metadata: string) => encryptionService.decryptFile(file, metadata);
  const uploadEncryptedFile = (file: File, bucket: string, folder: string) => 
    encryptionService.uploadEncryptedFile(file, bucket, folder);
  const downloadAndDecryptFile = (filePath: string, bucket: string, metadata: string) => 
    encryptionService.downloadAndDecryptFile(filePath, bucket, metadata);

  // New methods for encrypting configuration and sensitive data
  const encryptConfig = async (configData: Record<string, any>) => {
    try {
      const configStr = JSON.stringify(configData);
      return await encryptionService.encryptText(configStr);
    } catch (error) {
      console.error("Error encrypting configuration data:", error);
      toast.error("Failed to secure configuration data");
      return null;
    }
  };

  const decryptConfig = async (encryptedConfig: string) => {
    try {
      const decryptedStr = await encryptionService.decryptText(encryptedConfig);
      return decryptedStr ? JSON.parse(decryptedStr) : null;
    } catch (error) {
      console.error("Error decrypting configuration data:", error);
      toast.error("Failed to access secure configuration data");
      return null;
    }
  };

  // Secure local storage with encryption
  const secureStore = async (key: string, value: string) => {
    try {
      const encryptedValue = await encryptionService.encryptText(value);
      if (encryptedValue) {
        localStorage.setItem(`secure_${key}`, encryptedValue);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error securely storing data:", error);
      return false;
    }
  };

  const secureRetrieve = async (key: string) => {
    try {
      const encryptedValue = localStorage.getItem(`secure_${key}`);
      if (!encryptedValue) return null;
      return await encryptionService.decryptText(encryptedValue);
    } catch (error) {
      console.error("Error retrieving secure data:", error);
      return null;
    }
  };

  const value = {
    isEncryptionInitialized,
    initializeEncryption,
    encryptText,
    decryptText,
    encryptFile,
    decryptFile,
    uploadEncryptedFile,
    downloadAndDecryptFile,
    encryptConfig,
    decryptConfig,
    secureStore,
    secureRetrieve
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};
