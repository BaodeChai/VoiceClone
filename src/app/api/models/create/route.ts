import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { db, schema } from '@/lib/db';
import { createFishModel } from '@/lib/fish-audio';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, audioPath } = body;
    
    if (!title || !audioPath) {
      return NextResponse.json(
        { error: 'Title and audioPath are required' },
        { status: 400 }
      );
    }
    
    // 创建数据库记录
    const [newModel] = await db.insert(schema.models).values({
      title,
      description,
      audioPath,
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
      await db.update(schema.models)
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
      await db.update(schema.models)
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