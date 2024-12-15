import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { toast } from "sonner";

let ffmpeg: FFmpeg | null = null;

const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  try {
    console.log('Loading FFmpeg...');
    toast.info('Initializing video processor...');
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    toast.error('Failed to initialize video processor');
    throw new Error('Failed to load video compression library');
  }
};

export const compressVideo = async (file: File): Promise<File> => {
  console.log('Starting video compression for file:', {
    name: file.name,
    size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    type: file.type
  });
  
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB

  if (file.size <= MAX_SIZE) {
    console.log('File already under size limit, skipping compression');
    return file;
  }

  try {
    console.log('Initializing compression...');
    toast.info('Preparing to compress video... This may take a few minutes.');
    
    const ffmpeg = await loadFFmpeg();
    const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
    const outputFileName = 'output.mp4';

    console.log('Writing file to FFmpeg filesystem...');
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    // Calculate target bitrate based on desired file size
    const targetSize = MAX_SIZE * 0.95; // Aim for 95% of max size to be safe
    const duration = await getVideoDuration(file);
    const targetBitrateKbps = Math.floor((targetSize * 8) / (duration * 1024));

    console.log('Compressing video with settings:', {
      targetBitrateKbps,
      duration: `${duration.toFixed(2)}s`,
      targetSize: `${(targetSize / (1024 * 1024)).toFixed(2)}MB`
    });

    toast.info('Compressing video... Please wait.');

    // Run FFmpeg compression
    await ffmpeg.exec([
      '-i', inputFileName,
      '-c:v', 'libx264',
      '-b:v', `${targetBitrateKbps}k`,
      '-preset', 'medium',
      '-pass', '1',
      '-f', 'mp4',
      outputFileName
    ]);

    console.log('Reading compressed file...');
    const data = await ffmpeg.readFile(outputFileName);
    const compressedBlob = new Blob([data], { type: 'video/mp4' });
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '') + '_compressed.mp4', {
      type: 'video/mp4'
    });

    console.log('Compression complete:', {
      originalSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      compressedSize: `${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`,
      compressionRatio: `${(compressedFile.size / file.size * 100).toFixed(2)}%`
    });

    toast.success('Video compression complete!');
    return compressedFile;
  } catch (error) {
    console.error('Video compression error:', error);
    toast.error('Failed to compress video. Please try a smaller file.');
    throw error;
  }
};

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      reject('Error loading video metadata');
    };
    video.src = URL.createObjectURL(file);
  });
};