
import { encryptionService } from "@/services/encryptionService";

interface SecureLogOptions {
  level: 'info' | 'warn' | 'error' | 'debug';
  sanitize?: boolean;
  encrypt?: boolean;
  sendRemote?: boolean;
}

const DEFAULT_OPTIONS: SecureLogOptions = {
  level: 'info',
  sanitize: true,
  encrypt: false,
  sendRemote: false
};

/**
 * Secure logging utility to prevent leaking sensitive information
 */
export const secureLog = (
  message: string | Error | unknown,
  options: Partial<SecureLogOptions> = {}
) => {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  let logMessage = typeof message === 'string' ? message : 
    message instanceof Error ? 
      `${message.name}: ${message.message}` : 
      JSON.stringify(message);
  
  // Sanitize sensitive data
  if (settings.sanitize) {
    logMessage = encryptionService.obfuscateSensitiveData(logMessage);
  }
  
  // Log locally
  switch (settings.level) {
    case 'error':
      console.error('[Secure]', logMessage);
      break;
    case 'warn':
      console.warn('[Secure]', logMessage);
      break;
    case 'debug':
      console.debug('[Secure]', logMessage);
      break;
    default:
      console.info('[Secure]', logMessage);
  }
  
  // Encrypt and potentially send to server if needed
  if (settings.encrypt && settings.sendRemote && encryptionService.isInitialized()) {
    encryptionService.encryptText(logMessage).then(encryptedLog => {
      if (encryptedLog) {
        // Here we could send to a secure logging service
        // Note: This is just a placeholder - no actual implementation to avoid
        // creating a new dependency on a logging service
        console.debug('[Encrypted log prepared for remote storage]');
      }
    }).catch(err => {
      console.error('Failed to encrypt log:', err);
    });
  }
  
  return logMessage;
};

/**
 * Wraps any function to catch and securely log errors
 */
export function withSecureErrorHandling<T extends (...args: any[]) => any>(
  fn: T, 
  options: Partial<SecureLogOptions> = {}
): (...funcArgs: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    try {
      return fn(...args);
    } catch (error) {
      secureLog(error, { 
        ...options, 
        level: 'error' 
      });
      return undefined;
    }
  };
}

/**
 * Wraps async functions to catch and securely log errors
 */
export function withSecureAsyncErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T, 
  options: Partial<SecureLogOptions> = {}
): (...funcArgs: Parameters<T>) => Promise<ReturnType<T> | undefined> {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      secureLog(error, { 
        ...options, 
        level: 'error' 
      });
      return undefined;
    }
  };
}

/**
 * Secure fetch wrapper that prevents leaking sensitive data in requests
 */
export const secureFetch = async (
  url: string,
  options: RequestInit & { 
    secureOptions?: Partial<SecureLogOptions> 
  } = {}
): Promise<Response> => {
  const { secureOptions, ...fetchOptions } = options;
  
  try {
    // Sanitize the URL before logging
    const sanitizedUrl = encryptionService.obfuscateSensitiveData(url);
    secureLog(`Fetching from ${sanitizedUrl}`, 
      secureOptions || { level: 'info', sanitize: true });
    
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    secureLog(error, { 
      ...secureOptions,
      level: 'error'
    });
    throw error;
  }
};
