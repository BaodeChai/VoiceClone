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
    
    // 查找音频记录
    const audioRecord = await db
      .select()
      .from(schema.ttsHistory)
      .where(eq(schema.ttsHistory.id, id))
      .limit(1);
    
    if (!audioRecord.length) {
      return new NextResponse('Audio not found', { status: 404 });
    }
    
    const { audioPath } = audioRecord[0];
    
    // 检查文件是否存在
    if (!existsSync(audioPath)) {
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
      },
    });
    
  } catch (error) {
    console.error('Audio serving error:', error);
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}