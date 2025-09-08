import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { db, schema } from '@/lib/db';
import { getAudioMimeType } from '@/lib/upload';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 查找模型记录
    const modelRecord = await db
      .select()
      .from(schema.models)
      .where(eq(schema.models.id, id))
      .limit(1);
    
    if (!modelRecord.length) {
      return new NextResponse('Model not found', { status: 404 });
    }
    
    const { audioPath } = modelRecord[0];
    
    if (!audioPath) {
      console.error(`No audio path found for model ${id}`);
      return new NextResponse('Audio path not found for this model', { status: 404 });
    }
    
    console.log(`Attempting to serve audio file: ${audioPath}`);
    
    // 检查文件是否存在
    if (!existsSync(audioPath)) {
      console.error(`Audio file not found at path: ${audioPath}`);
      console.error(`Current working directory: ${process.cwd()}`);
      console.error(`Environment: ${process.env.NODE_ENV}`);
      return new NextResponse('Audio file not found', { status: 404 });
    }
    
    // 读取文件
    const audioBuffer = await readFile(audioPath);
    const mimeType = getAudioMimeType(audioPath);
    
    // 返回音频文件
    return new NextResponse(audioBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // 缓存一年
        'Accept-Ranges': 'bytes', // 支持音频播放器的范围请求
      },
    });
    
  } catch (error) {
    console.error('Model audio serving error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}