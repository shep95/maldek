import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DraftPost {
  content: string;
  mediaFiles: File[];
  scheduledFor?: Date;
}

const DRAFT_KEY = 'post_drafts';

export const saveDraft = (draft: DraftPost) => {
  try {
    const drafts = JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]');
    drafts.push({
      ...draft,
      mediaFiles: [], // We can't store File objects in localStorage
      savedAt: new Date().toISOString()
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
    console.log('Draft saved successfully');
    toast.success('Draft saved');
  } catch (error) {
    console.error('Error saving draft:', error);
    toast.error('Failed to save draft');
  }
};

export const getDrafts = (): Omit<DraftPost, 'mediaFiles'>[] => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]');
  } catch (error) {
    console.error('Error loading drafts:', error);
    return [];
  }
};

export const processImageFile = async (file: File): Promise<File> => {
  // Check if the file is an image
  if (!file.type.startsWith('image/')) {
    return file;
  }

  try {
    // Create a canvas element to compress the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    // Create a promise to handle the image loading
    const loadedImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

    // Calculate new dimensions (max 2000px width/height)
    let width = loadedImage.width;
    let height = loadedImage.height;
    const maxDimension = 2000;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = (height / width) * maxDimension;
        width = maxDimension;
      } else {
        width = (width / height) * maxDimension;
        height = maxDimension;
      }
    }

    // Set canvas dimensions and draw image
    canvas.width = width;
    canvas.height = height;
    ctx?.drawImage(loadedImage, 0, 0, width, height);

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8);
    });

    // Create new file from blob
    const compressedFile = new File([blob], file.name, {
      type: 'image/jpeg',
    });

    console.log('Image compressed:', {
      originalSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      compressedSize: `${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`
    });

    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
};

export const handlePasteEvent = (e: ClipboardEvent): File | null => {
  const items = e.clipboardData?.items;
  if (!items) return null;

  for (const item of Array.from(items)) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) {
        console.log('File pasted:', file.name, file.type, file.size);
        return file;
      }
    }
  }
  return null;
};