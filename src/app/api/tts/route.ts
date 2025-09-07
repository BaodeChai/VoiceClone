import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { createId } from '@paralleldrive/cuid2';
import { db, schema } from '@/lib/db';
import { generateTTS } from '@/lib/fish-audio';
import { ensureUploadDir } from '@/lib/upload';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('TTS request received:', JSON.stringify(body, null, 2));
    const { text, modelId, format = 'mp3' } = body;
    
    if (!text || !modelId) {
      console.log('TTS validation failed:', { hasText: !!text, hasModelId: !!modelId });
      return NextResponse.json(
        { error: 'Text and modelId are required' },
        { status: 400 }
      );
    }
    
    // 获取模型信息
    const model = await (db as any)
      .select()
      .from(schema.models)
      .where(eq(schema.models.id, modelId))
      .limit(1);
    
    if (!model.length || !model[0].fishModelId) {
      console.log('Model not found or not ready:', { 
        modelFound: model.length > 0, 
        hasFishModelId: model.length > 0 && !!model[0].fishModelId 
      });
      return NextResponse.json(
        { error: 'Model not found or not ready' },
        { status: 404 }
      );
    }
    
    console.log('Generating TTS with:', { 
      text: text.substring(0, 50) + '...', 
      fishModelId: model[0].fishModelId,
      format 
    });
    
    // 生成语音
    const audioBuffer = await generateTTS(
      text,
      model[0].fishModelId,
      format as 'mp3' | 'wav' | 'opus'
    );
    
    // 保存生成的音频文件 - 生产环境使用 /tmp 目录
    const fileName = `tts_${createId()}.${format}`;
    let filePath: string;
    
    if (process.env.NODE_ENV === 'production') {
      // Vercel 生产环境，使用 /tmp 目录
      filePath = path.join('/tmp', fileName);
    } else {
      // 本地开发环境
      await ensureUploadDir();
      const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
      filePath = path.join(uploadDir, fileName);
    }
    
    await writeFile(filePath, audioBuffer);
    
    // 保存到历史记录
    const [ttsRecord] = await (db as any).insert(schema.ttsHistory).values({
      modelId,
      text,
      audioPath: filePath,
      audioFormat: format
    }).returning();
    
    const result = {
      success: true,
      audioId: ttsRecord.id,
      audioPath: `/api/audio/${ttsRecord.id}`,
      text,
      format
    };
    
    console.log('TTS generation successful:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('TTS generation error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'TTS generation failed'
      },
      { status: 500 }
    );
  }
}