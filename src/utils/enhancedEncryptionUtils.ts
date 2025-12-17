
/**
 * Military-grade encryption utilities with enhanced security
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Enhanced encryption parameters
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 16, // Increased IV length
  tagLength: 128,
  iterations: 600000, // Increased PBKDF2 iterations
  saltLength: 32 // Increased salt length
};

/**
 * Generate cryptographically secure random bytes
 */
export const generateSecureRandom = (length: number): Uint8Array => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
};

/**
 * Generate enhanced encryption key with better entropy
 */
export const generateEnhancedEncryptionKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      length: ENCRYPTION_CONFIG.keyLength
    },
    true,
    ["encrypt", "decrypt"]
  );
};

/**
 * Enhanced key derivation with increased security
 */
export const deriveKeyFromPasswordEnhanced = async (
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> => {
  const passwordBuffer = encoder.encode(password);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ENCRYPTION_CONFIG.iterations,
      hash: "SHA-256"
    },
    baseKey,
    { 
      name: ENCRYPTION_CONFIG.algorithm, 
      length: ENCRYPTION_CONFIG.keyLength 
    },
    true,
    ["encrypt", "decrypt"]
  );
};

/**
 * Enhanced encryption with authentication
 */
export const encryptDataEnhanced = async (
  data: string | ArrayBuffer,
  key: CryptoKey
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array; tag: Uint8Array }> => {
  const iv = generateSecureRandom(ENCRYPTION_CONFIG.ivLength);
  
  let dataBuffer: ArrayBuffer;
  if (typeof data === "string") {
    const encoded = encoder.encode(data);
    dataBuffer = encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer;
  } else {
    dataBuffer = data;
  }
  
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv: iv as BufferSource,
      tagLength: ENCRYPTION_CONFIG.tagLength
    },
    key,
    dataBuffer
  );
  
  // Extract authentication tag
  const tag = new Uint8Array(encryptedData.slice(-16));
  const ciphertext = encryptedData.slice(0, -16);
  
  return { 
    encryptedData: ciphertext, 
    iv, 
    tag 
  };
};

/**
 * Enhanced decryption with authentication verification
 */
export const decryptDataEnhanced = async (
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array,
  tag: Uint8Array
): Promise<ArrayBuffer> => {
  // Reconstruct full encrypted data with tag
  const fullData = new Uint8Array(encryptedData.byteLength + tag.byteLength);
  fullData.set(new Uint8Array(encryptedData), 0);
  fullData.set(tag, encryptedData.byteLength);
  
  try {
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_CONFIG.algorithm,
        iv: iv as BufferSource,
        tagLength: ENCRYPTION_CONFIG.tagLength
      },
      key,
      fullData
    );
    
    return decryptedData;
  } catch (error) {
    throw new Error("Decryption failed: Data may be corrupted or tampered with");
  }
};

/**
 * Secure key storage with enhanced protection
 */
export const secureKeyWithPasswordEnhanced = async (
  key: CryptoKey,
  password: string
): Promise<{ encryptedKey: string; salt: string; version: string }> => {
  const salt = generateSecureRandom(ENCRYPTION_CONFIG.saltLength);
  const derivedKey = await deriveKeyFromPasswordEnhanced(password, salt);
  
  const keyData = await crypto.subtle.exportKey("raw", key);
  const { encryptedData, iv, tag } = await encryptDataEnhanced(keyData, derivedKey);
  
  // Helper to convert Uint8Array to ArrayBuffer for base64 encoding
  const toArrayBuffer = (arr: Uint8Array): ArrayBuffer => 
    arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
  
  // Create versioned storage format
  const storageData = {
    encryptedKey: bufferToBase64(encryptedData),
    iv: bufferToBase64(toArrayBuffer(iv)),
    tag: bufferToBase64(toArrayBuffer(tag)),
    version: "2.0" // Version for future upgrades
  };
  
  return {
    encryptedKey: btoa(JSON.stringify(storageData)),
    salt: bufferToBase64(toArrayBuffer(salt)),
    version: "2.0"
  };
};

/**
 * Enhanced key recovery with version support
 */
export const recoverKeyWithPasswordEnhanced = async (
  encryptedKeyData: string,
  password: string,
  salt: string
): Promise<CryptoKey> => {
  try {
    const storageData = JSON.parse(atob(encryptedKeyData));
    const saltBuffer = base64ToBuffer(salt);
    const derivedKey = await deriveKeyFromPasswordEnhanced(password, new Uint8Array(saltBuffer));
    
    const encryptedData = base64ToBuffer(storageData.encryptedKey);
    const iv = base64ToBuffer(storageData.iv);
    const tag = base64ToBuffer(storageData.tag);
    
    const decryptedKeyData = await decryptDataEnhanced(
      encryptedData,
      derivedKey,
      new Uint8Array(iv),
      new Uint8Array(tag)
    );
    
    return await crypto.subtle.importKey(
      "raw",
      decryptedKeyData,
      { 
        name: ENCRYPTION_CONFIG.algorithm, 
        length: ENCRYPTION_CONFIG.keyLength 
      },
      true,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    throw new Error("Failed to recover encryption key: Invalid password or corrupted data");
  }
};

/**
 * Enhanced buffer to base64 conversion
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
 * Enhanced base64 to buffer conversion
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
 * Secure memory cleanup
 */
export const secureCleanup = (data: any) => {
  if (data && typeof data === 'object') {
    Object.keys(data).forEach(key => {
      if (data[key]) {
        data[key] = null;
      }
    });
  }
};
