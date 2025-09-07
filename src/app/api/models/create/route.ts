import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { db, schema } from '@/lib/db';
import { createFishModel } from '@/lib/fish-audio';
import { getAudioMetadata } from '@/lib/audio-metadata';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Create model request received:', JSON.stringify(body, null, 2));
    
    const { title, description, audioPath } = body;
    
    if (!title || !audioPath) {
      console.log('Validation failed:', { title: !!title, audioPath: !!audioPath });
      return NextResponse.json(
        { 
          error: 'Title and audioPath are required',
          received: { title, audioPath, description }
        },
        { status: 400 }
      );
    }
    
    // 获取音频文件元数据
    const audioMetadata = await getAudioMetadata(audioPath);
    console.log('Audio metadata:', audioMetadata);
    
    // 创建数据库记录
    const [newModel] = await (db as any).insert(schema.models).values({
      title,
      description,
      audioPath,
      audioDuration: audioMetadata.duration,
      audioSize: audioMetadata.size,
      status: 'creating'
    }).returning();
    
    try {
      // 读取音频文件
      const audioBuffer = await readFile(audioPath);
      
      // 调用 Fish Audio API 创建模型
      const fishModel = await createFishModel(
        title,
        description || '',
        audioBuffer
      );
      
      // 更新数据库记录
      await (db as any).update(schema.models)
        .set({
          fishModelId: fishModel.id,
          status: 'ready',
          updatedAt: new Date()
        })
        .where(eq(schema.models.id, newModel.id));
      
      return NextResponse.json({
        success: true,
        model: {
          ...newModel,
          fishModelId: fishModel.id,
          status: 'ready'
        }
      });
      
    } catch (fishError) {
      // Fish Audio API 调用失败，更新状态为失败
      await (db as any).update(schema.models)
        .set({
          status: 'failed',
          updatedAt: new Date()
        })
        .where(eq(schema.models.id, newModel.id));
      
      console.error('Fish Audio API error:', fishError);
      throw new Error(
        fishError instanceof Error 
          ? `Fish Audio API 错误: ${fishError.message}` 
          : 'Fish Audio API 调用失败'
      );
    }
    
  } catch (error) {
    console.error('Model creation error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Model creation failed'
      },
      { status: 500 }
    );
  }
}