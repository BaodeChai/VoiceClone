import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { db, schema } from '@/lib/db';
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
      return NextResponse.json({ available: false, reason: 'Model not found' });
    }
    
    const { audioPath } = modelRecord[0];
    
    if (!audioPath) {
      return NextResponse.json({ available: false, reason: 'No audio path' });
    }
    
    // 检查文件是否存在
    const fileExists = existsSync(audioPath);
    
    return NextResponse.json({ 
      available: fileExists,
      reason: fileExists ? 'File available' : 'File not found',
      environment: process.env.NODE_ENV,
      isCloudEnvironment: !!(process.env.VERCEL || process.env.NETLIFY || process.env.CF_PAGES)
    });
    
  } catch (error) {
    console.error('Audio availability check error:', error);
    return NextResponse.json({ available: false, reason: 'Internal error' });
  }
}