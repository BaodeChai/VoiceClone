import { stat } from 'fs/promises';

export interface AudioMetadata {
  duration: number; // 时长（秒）
  size: number; // 文件大小（字节）
  sizeFormatted: string; // 格式化的文件大小
  durationFormatted: string; // 格式化的时长
}

/**
 * 获取音频文件元数据
 * @param filePath 音频文件路径
 * @returns 音频元数据
 */
export async function getAudioMetadata(filePath: string): Promise<AudioMetadata> {
  try {
    // 获取文件大小
    const stats = await stat(filePath);
    const size = stats.size;

    // 根据文件扩展名估算比特率
    const fileExtension = filePath.toLowerCase().split('.').pop();
    let estimatedBitrate: number;

    switch (fileExtension) {
      case 'wav':
        // WAV 无损格式，通常是 1411kbps (CD 质量: 44.1kHz * 16bit * 2 channels)
        estimatedBitrate = 1411 * 1000;
        break;
      case 'flac':
        // FLAC 无损压缩格式，通常是原始音频的 50-70%
        estimatedBitrate = 900 * 1000;
        break;
      case 'm4a':
      case 'aac':
        // M4A/AAC 通常比 MP3 效率更高，平均 128kbps
        estimatedBitrate = 128 * 1000;
        break;
      case 'ogg':
      case 'webm':
        // OGG/WebM 通常比 MP3 效率更高，平均 128kbps
        estimatedBitrate = 128 * 1000;
        break;
      case 'mp3':
      case 'mpeg':
      default:
        // MP3 默认平均比特率为 128kbps
        estimatedBitrate = 128 * 1000;
        break;
    }

    const duration = Math.round((size * 8) / estimatedBitrate);

    console.log(`Audio metadata for ${filePath}: size=${size}, format=${fileExtension}, estimated bitrate=${estimatedBitrate/1000}kbps, estimated duration=${duration}s`);

    return {
      duration,
      size,
      sizeFormatted: formatFileSize(size),
      durationFormatted: formatDuration(duration)
    };
  } catch (error) {
    console.error('Failed to get audio metadata:', error);
    return {
      duration: 0,
      size: 0,
      sizeFormatted: '0 B',
      durationFormatted: '0秒'
    };
  }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化的文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * 格式化音频时长
 * @param seconds 秒数
 * @returns 格式化的时长
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 
      ? `${minutes}分${remainingSeconds}秒` 
      : `${minutes}分钟`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let result = `${hours}小时`;
    if (minutes > 0) result += `${minutes}分`;
    if (remainingSeconds > 0) result += `${remainingSeconds}秒`;
    
    return result;
  }
}