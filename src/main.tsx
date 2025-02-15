
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { toast } from "sonner";

// Extend ServiceWorkerRegistration type to include sync
declare global {
  interface ServiceWorkerRegistration {
    sync?: {
      register(tag: string): Promise<void>;
    };
  }
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful:', registration);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast.info("New version available!", {
                action: {
                  label: "Update",
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                },
              });
            }
          });
        }
      });
      
      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PROCESS_PENDING_UPLOADS') {
          import('./utils/offlineUploadUtils').then(module => {
            module.processPendingUploads();
          });
        }
      });

      // Handle offline/online status
      window.addEventListener('online', () => {
        toast.success("You're back online!");
        if (registration.sync) {
          registration.sync.register('pending-uploads');
        }
      });

      window.addEventListener('offline', () => {
        toast.error("You're offline. Some features may be limited.");
      });

    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

