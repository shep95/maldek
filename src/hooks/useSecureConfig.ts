
import { useState, useEffect } from 'react';
import { useEncryption } from "@/providers/EncryptionProvider";

type SecureConfigState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  saveConfig: (config: T) => Promise<boolean>;
  loadConfig: () => Promise<T | null>;
  clearConfig: () => void;
};

/**
 * Hook for securely storing and retrieving sensitive configuration
 */
export function useSecureConfig<T extends Record<string, any>>(
  configKey: string,
  initialData: T | null = null
): SecureConfigState<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const encryption = useEncryption();

  // Load the configuration on mount
  useEffect(() => {
    if (encryption.isEncryptionInitialized) {
      loadConfig();
    } else {
      setIsLoading(false);
    }
  }, [encryption.isEncryptionInitialized]);

  // Save configuration securely
  const saveConfig = async (config: T): Promise<boolean> => {
    try {
      if (!encryption.isEncryptionInitialized) {
        throw new Error("Encryption not initialized");
      }

      const encryptedConfig = await encryption.encryptConfig(config);
      if (!encryptedConfig) {
        throw new Error("Failed to encrypt configuration");
      }

      localStorage.setItem(`secure_config_${configKey}`, encryptedConfig);
      setData(config);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  // Load configuration securely
  const loadConfig = async (): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!encryption.isEncryptionInitialized) {
        setIsLoading(false);
        return null;
      }

      const encryptedConfig = localStorage.getItem(`secure_config_${configKey}`);
      if (!encryptedConfig) {
        setIsLoading(false);
        return null;
      }

      const decryptedConfig = await encryption.decryptConfig(encryptedConfig);
      setData(decryptedConfig as T);
      setIsLoading(false);
      return decryptedConfig as T;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
      return null;
    }
  };

  // Clear configuration
  const clearConfig = () => {
    localStorage.removeItem(`secure_config_${configKey}`);
    setData(null);
  };

  return {
    data,
    isLoading,
    error,
    saveConfig,
    loadConfig,
    clearConfig
  };
}

export default useSecureConfig;
