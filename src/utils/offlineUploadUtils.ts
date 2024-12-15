import { toast } from "sonner";

// Register background sync
const registerBackgroundSync = async () => {
  try {
    if ('serviceWorker' in navigator && 'sync' in window.registration) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('video-upload');
      console.log('Background sync registered for video upload');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error registering background sync:', error);
    return false;
  }
};

// Store upload data in IndexedDB
const storeForOfflineUpload = async (file: File, userId: string, metadata: any) => {
  try {
    const db = await openDB();
    await db.put('pendingUploads', {
      id: crypto.randomUUID(),
      file,
      userId,
      metadata,
      timestamp: Date.now(),
    });
    console.log('Video stored for offline upload');
    toast.info("Video will be uploaded when you're back online");
    return true;
  } catch (error) {
    console.error('Error storing video for offline upload:', error);
    return false;
  }
};

// Open IndexedDB database
const openDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offlineUploads', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingUploads')) {
        db.createObjectStore('pendingUploads', { keyPath: 'id' });
      }
    };
  });
};

// Process pending uploads
export const processPendingUploads = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction('pendingUploads', 'readwrite');
    const store = transaction.objectStore('pendingUploads');
    const pendingUploads = await store.getAll();

    console.log('Processing pending uploads:', pendingUploads.length);

    for (const upload of pendingUploads) {
      try {
        // Attempt to upload the file
        const { file, userId, metadata } = upload;
        
        // Your existing upload logic here
        console.log('Processing offline upload:', {
          fileName: file.name,
          userId,
          metadata
        });

        // After successful upload, remove from IndexedDB
        await store.delete(upload.id);
        toast.success('Offline video upload completed');
      } catch (error) {
        console.error('Error processing offline upload:', error);
        toast.error('Failed to upload offline video');
      }
    }
  } catch (error) {
    console.error('Error processing pending uploads:', error);
  }
};

export const handleOfflineUpload = async (file: File, userId: string, metadata: any = {}) => {
  if (!navigator.onLine) {
    console.log('Device is offline, storing video for later upload');
    const stored = await storeForOfflineUpload(file, userId, metadata);
    if (stored) {
      const syncRegistered = await registerBackgroundSync();
      if (syncRegistered) {
        toast.info("Video will be uploaded automatically when you're back online");
      } else {
        toast.info('Video will be uploaded when you return to the app online');
      }
    }
    return false;
  }
  return true;
};