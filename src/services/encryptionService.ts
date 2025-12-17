
import {
  generateEncryptionKey,
  exportKey,
  importKey,
  encryptData,
  decryptData,
  decryptText,
  encryptFile,
  decryptFile,
  secureKeyWithPassword,
  recoverKeyWithPassword,
  bufferToBase64,
  base64ToBuffer
} from "@/utils/encryptionUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// localStorage key for storing the encrypted master key
const ENCRYPTED_KEY_STORAGE = "bosley_encrypted_master_key";
const KEY_SALT_STORAGE = "bosley_key_salt";

/**
 * Service for managing encryption operations and keys
 */
class EncryptionService {
  private masterKey: CryptoKey | null = null;
  private initialized = false;

  /**
   * Initialize the encryption service
   * This should be called when the user logs in
   */
  async initialize(securityCode?: string): Promise<boolean> {
    try {
      if (this.initialized) return true;
      
      // If the user has a stored encrypted key, try to recover it
      const encryptedKey = localStorage.getItem(ENCRYPTED_KEY_STORAGE);
      const salt = localStorage.getItem(KEY_SALT_STORAGE);
      
      if (encryptedKey && salt && securityCode) {
        try {
          this.masterKey = await recoverKeyWithPassword(
            encryptedKey,
            securityCode,
            salt
          );
          this.initialized = true;
          console.log("Encryption service initialized with existing key");
          return true;
        } catch (error) {
          console.error("Failed to recover encryption key:", error);
          toast.error("Wrong security code. Could not decrypt your data.");
          return false;
        }
      } else if (securityCode) {
        // Generate a new master key if one doesn't exist
        this.masterKey = await generateEncryptionKey();
        
        // Secure it with the user's security code
        const { encryptedKey: newEncryptedKey, salt: newSalt } = 
          await secureKeyWithPassword(this.masterKey, securityCode);
        
        // Store the encrypted key
        localStorage.setItem(ENCRYPTED_KEY_STORAGE, newEncryptedKey);
        localStorage.setItem(KEY_SALT_STORAGE, newSalt);
        
        this.initialized = true;
        console.log("Encryption service initialized with new key");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error initializing encryption service:", error);
      toast.error("Could not initialize encryption. Please try again.");
      return false;
    }
  }

  /**
   * Check if the encryption service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset the encryption service (e.g., on logout)
   */
  reset(): void {
    this.masterKey = null;
    this.initialized = false;
    // Note: We don't clear localStorage as the encrypted key should remain
  }

  /**
   * Change the security code that protects the master key
   */
  async changeSecurityCode(
    currentCode: string, 
    newCode: string
  ): Promise<boolean> {
    try {
      // Verify the current code by attempting to recover the key
      const encryptedKey = localStorage.getItem(ENCRYPTED_KEY_STORAGE);
      const salt = localStorage.getItem(KEY_SALT_STORAGE);
      
      if (!encryptedKey || !salt) {
        throw new Error("No encryption key found");
      }
      
      // Recover the master key with the current password
      const masterKey = await recoverKeyWithPassword(
        encryptedKey,
        currentCode,
        salt
      );
      
      // Re-encrypt with the new password
      const { encryptedKey: newEncryptedKey, salt: newSalt } = 
        await secureKeyWithPassword(masterKey, newCode);
      
      // Store the new encrypted key
      localStorage.setItem(ENCRYPTED_KEY_STORAGE, newEncryptedKey);
      localStorage.setItem(KEY_SALT_STORAGE, newSalt);
      
      this.masterKey = masterKey;
      this.initialized = true;
      
      return true;
    } catch (error) {
      console.error("Error changing security code:", error);
      toast.error("Failed to change security code. Please verify your current code.");
      return false;
    }
  }

  /**
   * Encrypt text data
   */
  async encryptText(text: string): Promise<string | null> {
    if (!this.initialized || !this.masterKey) {
      toast.error("Encryption service not initialized");
      return null;
    }

    try {
      const { encryptedData, iv } = await encryptData(text, this.masterKey);
      
      // Helper to convert Uint8Array to ArrayBuffer for base64 encoding
      const toArrayBuffer = (arr: Uint8Array): ArrayBuffer => 
        arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
      
      // Format: base64(iv) + '.' + base64(encryptedData)
      return bufferToBase64(toArrayBuffer(iv)) + '.' + bufferToBase64(encryptedData);
    } catch (error) {
      console.error("Error encrypting text:", error);
      toast.error("Failed to encrypt data");
      return null;
    }
  }

  /**
   * Decrypt text data
   */
  async decryptText(encryptedText: string): Promise<string | null> {
    if (!this.initialized || !this.masterKey) {
      toast.error("Encryption service not initialized");
      return null;
    }

    try {
      const [ivBase64, dataBase64] = encryptedText.split('.');
      const iv = base64ToBuffer(ivBase64);
      const encryptedData = base64ToBuffer(dataBase64);
      
      const decryptedBuffer = await decryptData(
        encryptedData, 
        this.masterKey, 
        new Uint8Array(iv)
      );
      
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error("Error decrypting text:", error);
      toast.error("Failed to decrypt data");
      return null;
    }
  }

  /**
   * Encrypt a file before uploading
   */
  async encryptFile(file: File): Promise<{ encryptedFile: File, metadata: string } | null> {
    if (!this.initialized || !this.masterKey) {
      toast.error("Encryption service not initialized");
      return null;
    }

    try {
      const { encryptedBlob, metadata } = await encryptFile(file, this.masterKey);
      
      // Create a File object from the encrypted Blob
      const encryptedFile = new File(
        [encryptedBlob], 
        `encrypted_${file.name}`, 
        { type: 'application/encrypted' }
      );
      
      return { encryptedFile, metadata };
    } catch (error) {
      console.error("Error encrypting file:", error);
      toast.error("Failed to encrypt file");
      return null;
    }
  }

  /**
   * Decrypt a file after downloading
   */
  async decryptFile(
    encryptedFile: File | Blob, 
    metadata: string
  ): Promise<File | null> {
    if (!this.initialized || !this.masterKey) {
      toast.error("Encryption service not initialized");
      return null;
    }

    try {
      return await decryptFile(
        encryptedFile, 
        metadata, 
        this.masterKey
      );
    } catch (error) {
      console.error("Error decrypting file:", error);
      toast.error("Failed to decrypt file");
      return null;
    }
  }

  /**
   * Upload and encrypt a file to Supabase
   * Returns the file path and metadata needed for decryption
   */
  async uploadEncryptedFile(
    file: File, 
    bucketName: string, 
    folderPath: string
  ): Promise<{ filePath: string, metadata: string } | null> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("User not authenticated");

      // Encrypt the file
      const encryptionResult = await this.encryptFile(file);
      if (!encryptionResult) return null;

      const { encryptedFile, metadata } = encryptionResult;

      // Generate a unique file path
      const fileExt = "enc"; // Use generic extension for encrypted files
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${userId}/${folderPath}/${fileName}`;

      // Upload the encrypted file
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, encryptedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      return { filePath, metadata };
    } catch (error) {
      console.error("Error uploading encrypted file:", error);
      toast.error("Failed to upload encrypted file");
      return null;
    }
  }

  /**
   * Download and decrypt a file from Supabase
   */
  async downloadAndDecryptFile(
    filePath: string,
    bucketName: string,
    metadata: string
  ): Promise<File | null> {
    try {
      // Download the encrypted file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (downloadError) throw downloadError;
      if (!fileData) throw new Error("No file data received");

      // Decrypt the file
      return await this.decryptFile(fileData, metadata);
    } catch (error) {
      console.error("Error downloading and decrypting file:", error);
      toast.error("Failed to download and decrypt file");
      return null;
    }
  }
}

// Create a singleton instance
export const encryptionService = new EncryptionService();
