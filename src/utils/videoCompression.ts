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

  try {
    console.log('Initializing compression...');
    toast.info('Converting video format...');
    
    const ffmpeg = await loadFFmpeg();
    const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
    const outputFileName = 'output.mp4';

    console.log('Writing file to FFmpeg filesystem...');
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    // Enhanced MP4 conversion with better compatibility
    const ffmpegArgs = [
      '-i', inputFileName,
      '-c:v', 'libx264',     // Video codec: H.264
      '-preset', 'ultrafast', // Fastest encoding preset
      '-crf', '28',          // Slightly lower quality for faster encoding
      '-c:a', 'aac',         // Audio codec: AAC
      '-b:a', '128k',        // Audio bitrate
      '-movflags', '+faststart',  // Enable fast start for web playback
      '-pix_fmt', 'yuv420p', // Pixel format for better compatibility
      '-f', 'mp4',           // Force MP4 format
      '-y',                  // Overwrite output file
      outputFileName
    ];

    console.log('Running FFmpeg with args:', ffmpegArgs.join(' '));
    await ffmpeg.exec(ffmpegArgs);

    console.log('Reading compressed file...');
    const data = await ffmpeg.readFile(outputFileName);
    const compressedBlob = new Blob([data], { type: 'video/mp4' });
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, '') + '.mp4', {
      type: 'video/mp4'
    });

    console.log('Video conversion complete:', {
      originalSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      compressedSize: `${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`,
      outputFormat: 'MP4',
      mimeType: compressedFile.type
    });

    toast.success('Video converted successfully!');
    return compressedFile;
  } catch (error) {
    console.error('Video compression error:', error);
    toast.error('Failed to convert video. Please try again.');
    throw error;
  }
};