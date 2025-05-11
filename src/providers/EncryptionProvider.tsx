
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

  const value = {
    isEncryptionInitialized,
    initializeEncryption,
    encryptText,
    decryptText,
    encryptFile,
    decryptFile,
    uploadEncryptedFile,
    downloadAndDecryptFile
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};
