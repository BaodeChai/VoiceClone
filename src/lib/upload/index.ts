import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { createId } from '@paralleldrive/cuid2';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// 支持的音频格式
const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
];

// 确保上传目录存在
export async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// 验证文件类型和大小
export function validateAudioFile(file: File) {
  if (!SUPPORTED_AUDIO_FORMATS.includes(file.type)) {
    throw new Error(`Unsupported file format: ${file.type}`);
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${file.size} bytes. Max size: ${MAX_FILE_SIZE} bytes`);
  }
  
  // 检查文件名安全性
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    throw new Error('Invalid file name: contains unsafe characters');
  }
}

// 保存音频文件
export async function saveAudioFile(file: File): Promise<string> {
  await ensureUploadDir();
  
  validateAudioFile(file);
  
  const fileExtension = path.extname(file.name) || '.mp3';
  const fileName = `${createId()}${fileExtension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  
  return filePath;
}

// 获取文件扩展名对应的 MIME 类型
export function getAudioMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.mp3':
      return 'audio/mpeg';
    case '.wav':
      return 'audio/wav';
    case '.flac':
      return 'audio/flac';
    default:
      return 'audio/mpeg';
  }
}