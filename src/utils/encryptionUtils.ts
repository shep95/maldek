
/**
 * End-to-End Encryption Utilities
 * 
 * This module provides utilities for client-side encryption and decryption
 * of sensitive data like files, messages, and media content.
 */

// Use the Web Crypto API for strong encryption
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Generates a new encryption key for the user
 * @returns The generated encryption key
 */
export const generateEncryptionKey = async (): Promise<CryptoKey> => {
  try {
    // Generate a strong AES-GCM key for encryption
    return await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256
      },
      true, // Extractable so we can store it securely
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Error generating encryption key:", error);
    throw new Error("Could not generate secure encryption key");
  }
};

/**
 * Exports a CryptoKey to a base64 string that can be stored
 */
export const exportKey = async (key: CryptoKey): Promise<string> => {
  try {
    const exportedKey = await window.crypto.subtle.exportKey("raw", key);
    return bufferToBase64(exportedKey);
  } catch (error) {
    console.error("Error exporting key:", error);
    throw new Error("Could not export encryption key");
  }
};

/**
 * Imports a CryptoKey from a base64 string
 */
export const importKey = async (keyString: string): Promise<CryptoKey> => {
  try {
    const keyData = base64ToBuffer(keyString);
    return await window.crypto.subtle.importKey(
      "raw",
      keyData,
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Error importing key:", error);
    throw new Error("Could not import encryption key");
  }
};

/**
 * Encrypts a string or file with the provided key
 * @param data The data to encrypt (string or file)
 * @param key The CryptoKey to use for encryption
 * @returns An object containing the encrypted data and the IV used
 */
export const encryptData = async (
  data: string | File,
  key: CryptoKey
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> => {
  try {
    // Generate a random IV for this encryption
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    let dataBuffer: ArrayBuffer;
    
    if (typeof data === "string") {
      const encoded = encoder.encode(data);
      dataBuffer = encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer;
    } else {
      dataBuffer = await data.arrayBuffer();
    }
    
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      dataBuffer
    );
    
    return { encryptedData, iv };
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Could not encrypt data");
  }
};

/**
 * Decrypts encrypted data with the provided key and IV
 * @param encryptedData The encrypted data
 * @param key The CryptoKey to use for decryption
 * @param iv The IV used for encryption
 * @returns The decrypted data
 */
export const decryptData = async (
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> => {
  try {
    return await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource
      },
      key,
      encryptedData
    );
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Could not decrypt data. The data may be corrupted or you don't have the correct key.");
  }
};

/**
 * Decrypts text data and returns as a string
 */
export const decryptText = async (
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> => {
  const decryptedBuffer = await decryptData(encryptedData, key, iv);
  return decoder.decode(decryptedBuffer);
};

/**
 * Helper function to convert ArrayBuffer to Base64 string
 */
export const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Helper function to convert Base64 string to ArrayBuffer
 */
export const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Encrypts a file and returns an encrypted Blob
 * @param file The file to encrypt
 * @param key The encryption key
 * @returns An object with the encrypted blob and metadata
 */
export const encryptFile = async (
  file: File,
  key: CryptoKey
): Promise<{ encryptedBlob: Blob; metadata: string }> => {
  try {
    const { encryptedData, iv } = await encryptData(file, key);
    
    // Create metadata with IV and original file info
    const metadata = JSON.stringify({
      name: file.name,
      type: file.type,
      size: file.size,
      iv: bufferToBase64(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer)
    });
    
    return {
      encryptedBlob: new Blob([encryptedData], { type: 'application/encrypted' }),
      metadata
    };
  } catch (error) {
    console.error("Error encrypting file:", error);
    throw new Error("Could not encrypt file");
  }
};

/**
 * Decrypts an encrypted file blob
 * @param encryptedBlob The encrypted blob
 * @param metadata The file metadata including IV
 * @param key The decryption key
 * @returns The decrypted file
 */
export const decryptFile = async (
  encryptedBlob: Blob,
  metadata: string,
  key: CryptoKey
): Promise<File> => {
  try {
    const parsedMetadata = JSON.parse(metadata);
    const iv = base64ToBuffer(parsedMetadata.iv);
    
    const encryptedBuffer = await encryptedBlob.arrayBuffer();
    const decryptedBuffer = await decryptData(encryptedBuffer, key, new Uint8Array(iv));
    
    return new File(
      [decryptedBuffer], 
      parsedMetadata.name, 
      { type: parsedMetadata.type }
    );
  } catch (error) {
    console.error("Error decrypting file:", error);
    throw new Error("Could not decrypt file");
  }
};

/**
 * Hashes a password to derive an encryption key
 * @param password The user password to hash
 * @returns A derived key that can be used for encryption
 */
export const deriveKeyFromPassword = async (password: string): Promise<CryptoKey> => {
  try {
    // First, create a key from the password
    const passwordBuffer = encoder.encode(password);
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    // Use PBKDF2 to derive a strong key
    const salt = encoder.encode("Bosley-E2EE-Salt"); // Fixed salt for simplicity
    return await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Error deriving key from password:", error);
    throw new Error("Could not derive key from password");
  }
};

/**
 * Securely stores an encryption key using a password
 * @param key The encryption key to store
 * @param password The password to protect the key
 * @returns Encrypted key data for storage
 */
export const secureKeyWithPassword = async (
  key: CryptoKey, 
  password: string
): Promise<{ encryptedKey: string; salt: string }> => {
  try {
    // Generate a random salt for this encryption
    const saltArray = window.crypto.getRandomValues(new Uint8Array(16));
    const salt = bufferToBase64(saltArray.buffer.slice(saltArray.byteOffset, saltArray.byteOffset + saltArray.byteLength) as ArrayBuffer);
    
    // Derive a key from the password
    const passwordBuffer = encoder.encode(password);
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: base64ToBuffer(salt),
        iterations: 100000,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    
    // Export the key we want to secure
    const keyData = await window.crypto.subtle.exportKey("raw", key);
    
    // Encrypt the key with the derived key
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      derivedKey,
      keyData
    );
    
    // Return the encrypted key and metadata
    return {
      encryptedKey: bufferToBase64(encryptedKeyBuffer) + '.' + bufferToBase64(iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) as ArrayBuffer),
      salt
    };
  } catch (error) {
    console.error("Error securing key with password:", error);
    throw new Error("Could not secure encryption key");
  }
};

/**
 * Recovers a secured encryption key using a password
 * @param encryptedKeyData The encrypted key data
 * @param password The password used to protect the key
 * @param salt The salt used in key derivation
 * @returns The recovered CryptoKey
 */
export const recoverKeyWithPassword = async (
  encryptedKeyData: string,
  password: string,
  salt: string
): Promise<CryptoKey> => {
  try {
    // Split the encrypted key and IV
    const [encryptedKey, ivBase64] = encryptedKeyData.split('.');
    
    // Derive the key from the password using the stored salt
    const passwordBuffer = encoder.encode(password);
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: base64ToBuffer(salt),
        iterations: 100000,
        hash: "SHA-256"
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    
    // Decrypt the encrypted key
    const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64ToBuffer(ivBase64)
      },
      derivedKey,
      base64ToBuffer(encryptedKey)
    );
    
    // Import the decrypted key
    return await window.crypto.subtle.importKey(
      "raw",
      decryptedKeyBuffer,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Error recovering key with password:", error);
    throw new Error("Could not recover encryption key. Wrong password?");
  }
};
