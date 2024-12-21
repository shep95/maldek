import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { toast } from "sonner";

let ffmpeg: FFmpeg | null = null;

const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  try {
    console.log('Loading FFmpeg...');
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    throw new Error('Failed to load video processing library');
  }
};

export const compressVideo = async (file: File): Promise<File> => {
  console.log('Starting video processing:', {
    name: file.name,
    size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    type: file.type
  });

  try {
    const ffmpeg = await loadFFmpeg();
    const inputFileName = 'input' + file.name.substring(file.name.lastIndexOf('.'));
    const outputFileName = 'output.mp4';

    console.log('Writing file to FFmpeg...');
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    // Basic conversion to MP4 with H.264
    const ffmpegArgs = [
      '-i', inputFileName,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-c:a', 'aac',
      '-strict', 'experimental',
      '-b:a', '128k',
      '-ar', '44100',
      '-ac', '2',
      '-movflags', '+faststart',
      '-pix_fmt', 'yuv420p',
      '-y',
      outputFileName
    ];

    console.log('Running FFmpeg with args:', ffmpegArgs.join(' '));
    await ffmpeg.exec(ffmpegArgs);

    console.log('Reading processed file...');
    const data = await ffmpeg.readFile(outputFileName);
    const processedBlob = new Blob([data], { type: 'video/mp4' });
    
    // Keep original filename but change extension to .mp4
    const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.mp4';
    const processedFile = new File([processedBlob], newFileName, {
      type: 'video/mp4'
    });

    console.log('Video processing complete:', {
      originalSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      processedSize: `${(processedFile.size / (1024 * 1024)).toFixed(2)}MB`,
      outputFormat: 'MP4'
    });

    return processedFile;
  } catch (error) {
    console.error('Video processing error:', error);
    throw error;
  }
};
