import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { toast } from "sonner";

let ffmpeg: FFmpeg | null = null;

const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  try {
    // Load FFmpeg
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    throw new Error('Failed to load video compression library');
  }
};

export const compressVideo = async (file: File): Promise<File> => {
  console.log('Starting video compression for file:', file.name);
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB

  if (file.size <= MAX_SIZE) {
    console.log('File already under size limit, skipping compression');
    return file;
  }

  try {
    const ffmpeg = await loadFFmpeg();
    const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
    const outputFileName = 'output.mp4';

    // Write the file to FFmpeg's virtual filesystem
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    // Calculate target bitrate based on desired file size
    const targetSize = MAX_SIZE * 0.95; // Aim for 95% of max size to be safe
    const duration = await getVideoDuration(file);
    const targetBitrateKbps = Math.floor((targetSize * 8) / (duration * 1024));

    console.log('Compressing video with target bitrate:', targetBitrateKbps, 'kbps');
    toast.info('Compressing video... This may take a moment.');

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

    // Read the compressed file
    const data = await ffmpeg.readFile(outputFileName);
    const compressedBlob = new Blob([data], { type: 'video/mp4' });
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '') + '_compressed.mp4', {
      type: 'video/mp4'
    });

    console.log('Compression complete:', {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: (compressedFile.size / file.size * 100).toFixed(2) + '%'
    });

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