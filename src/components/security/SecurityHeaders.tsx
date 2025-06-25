
import { useEffect } from 'react';
import { getSecurityHeaders } from '@/utils/securityUtils';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Apply security headers via meta tags for client-side protection
    const headers = getSecurityHeaders();
    
    // Content Security Policy
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = headers['Content-Security-Policy'];
    document.head.appendChild(cspMeta);
    
    // X-Frame-Options
    const frameMeta = document.createElement('meta');
    frameMeta.httpEquiv = 'X-Frame-Options';
    frameMeta.content = headers['X-Frame-Options'];
    document.head.appendChild(frameMeta);
    
    // Additional security measures
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        viewport.getAttribute('content') + ', user-scalable=no'
      );
    }
    
    // Prevent context menu on production
    if (import.meta.env.PROD) {
      const preventContextMenu = (e: MouseEvent) => {
        if (e.button === 2) {
          e.preventDefault();
          return false;
        }
      };
      
      document.addEventListener('contextmenu', preventContextMenu);
      
      return () => {
        document.removeEventListener('contextmenu', preventContextMenu);
        document.head.removeChild(cspMeta);
        document.head.removeChild(frameMeta);
      };
    }
  }, []);
  
  return null;
};
