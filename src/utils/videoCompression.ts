
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { toast } from "sonner";

let ffmpeg: FFmpeg | null = null;
let isLoading = false;

const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  if (isLoading) {
    // Wait for existing load to complete
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return ffmpeg;
  }

  isLoading = true;
  ffmpeg = new FFmpeg();
  
  try {
    console.log('Loading FFmpeg...');
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    
    // Add timeout for loading FFmpeg
    const loadPromise = ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('FFmpeg loading timeout')), 30000);
    });
    
    await Promise.race([loadPromise, timeoutPromise]);
    console.log('FFmpeg loaded successfully');
    isLoading = false;
    return ffmpeg;
  } catch (error) {
    isLoading = false;
    console.error('Error loading FFmpeg:', error);
    throw new Error('Failed to load video processing library');
  }
};

export const compressVideo = async (file: File): Promise<File> => {
  // Validate file size (limit to 500MB to prevent memory issues)
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 500MB.');
  }

  console.log('Starting video processing:', {
    name: file.name,
    size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    type: file.type
  });

  try {
    const ffmpeg = await loadFFmpeg();
    if (!ffmpeg) {
      throw new Error('FFmpeg not available');
    }

    const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
    const outputFileName = 'output.mp4';

    console.log('Writing file to FFmpeg...');
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    // Enhanced compression settings for better performance at scale
    const ffmpegArgs = [
      '-i', inputFileName,
      '-c:v', 'libx264',
      '-preset', 'ultrafast', // Fastest compression for scale
      '-crf', '28',
      '-c:a', 'aac',
      '-strict', 'experimental',
      '-b:a', '128k',
      '-ar', '44100',
      '-ac', '2',
      '-movflags', '+faststart',
      '-pix_fmt', 'yuv420p',
      '-vf', 'scale=1280:720', // Limit resolution to reduce processing load
      '-r', '30', // Limit frame rate
      '-y',
      outputFileName
    ];

    console.log('Running FFmpeg with optimized settings...');
    
    // Add timeout for FFmpeg processing
    const processPromise = ffmpeg.exec(ffmpegArgs);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Video processing timeout')), 120000); // 2 minute timeout
    });
    
    await Promise.race([processPromise, timeoutPromise]);

    console.log('Reading processed file...');
    const data = await ffmpeg.readFile(outputFileName);
    
    // Clean up files to prevent memory leaks
    try {
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
    } catch (cleanupError) {
      console.warn('Cleanup warning:', cleanupError);
    }
    
    const processedBlob = new Blob([data], { type: 'video/mp4' });
    
    // Keep original filename but change extension to .mp4
    const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.mp4';
    const processedFile = new File([processedBlob], newFileName, {
      type: 'video/mp4'
    });

    console.log('Video processing complete:', {
      originalSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      processedSize: `${(processedFile.size / (1024 * 1024)).toFixed(2)}MB`,
      outputFormat: 'MP4',
      compressionRatio: `${((1 - processedFile.size / file.size) * 100).toFixed(1)}%`
    });

    return processedFile;
  } catch (error) {
    console.error('Video processing error:', error);
    
    // Provide more user-friendly error messages
    if (error.message.includes('timeout')) {
      throw new Error('Video processing is taking too long. Please try a smaller file.');
    } else if (error.message.includes('memory')) {
      throw new Error('Not enough memory to process this video. Please try a smaller file.');
    } else {
      throw new Error('Video processing failed. Please try again or use a different file.');
    }
  }
};
