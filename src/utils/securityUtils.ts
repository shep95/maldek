
import { supabase } from "@/integrations/supabase/client";

// Rate limiting for security operations
const securityAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Enhanced security code validation with rate limiting
 */
export const validateSecurityCode = async (code: string, userId: string): Promise<boolean> => {
  const attemptKey = `security_${userId}`;
  const now = Date.now();
  
  // Check rate limiting
  const attempts = securityAttempts.get(attemptKey);
  if (attempts) {
    if (attempts.count >= MAX_ATTEMPTS) {
      const timeSinceLastAttempt = now - attempts.lastAttempt;
      if (timeSinceLastAttempt < LOCKOUT_DURATION) {
        throw new Error(`Security lockout. Try again in ${Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 60000)} minutes.`);
      } else {
        // Reset attempts after lockout period
        securityAttempts.delete(attemptKey);
      }
    }
  }
  
  // Enhanced security code validation
  if (!/^\d{6}$/.test(code)) {
    throw new Error("Security code must be exactly 6 digits");
  }
  
  try {
    const { data, error } = await supabase.rpc('verify_security_code_enhanced', {
      user_uuid: userId,
      code: code,
      client_ip: await getClientIP(),
      user_agent: navigator.userAgent
    });
    
    if (error) throw error;
    
    if (data) {
      // Clear attempts on success
      securityAttempts.delete(attemptKey);
      return true;
    } else {
      // Increment failed attempts
      const currentAttempts = securityAttempts.get(attemptKey) || { count: 0, lastAttempt: 0 };
      securityAttempts.set(attemptKey, {
        count: currentAttempts.count + 1,
        lastAttempt: now
      });
      return false;
    }
  } catch (error) {
    console.error('Security code validation error:', error);
    throw new Error('Security validation failed');
  }
};

/**
 * Generate cryptographically secure random code
 */
export const generateSecureCode = (length: number = 6): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => (byte % 10).toString()).join('');
};

/**
 * Get client IP address (for security logging)
 */
export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate file upload security
 */
export const validateFileUpload = (file: File): boolean => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/ogg'
  ];
  
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }
  
  if (file.size > maxSize) {
    throw new Error('File size too large');
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.js', '.vbs'];
  if (suspiciousPatterns.some(pattern => file.name.toLowerCase().includes(pattern))) {
    throw new Error('Suspicious file detected');
  }
  
  return true;
};

/**
 * Enhanced email validation
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Additional security checks
  const domain = email.split('@')[1];
  if (domain.length > 253) {
    return false;
  }
  
  return true;
};

/**
 * Content Security Policy headers
 */
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://yridaehdhtmdtasnbsrn.supabase.co https://hcaptcha.com https://*.hcaptcha.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
});
