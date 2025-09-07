import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { createFishModel } from '@/lib/fish-audio';
import path from 'path';
import { createId } from '@paralleldrive/cuid2';

// 云端模型创建 - 支持 Base64 文件数据
export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    const body = await request.json();
    console.log('Create model request received:', {
      title: body.title,
      hasFileData: !!body.fileData,
      originalName: body.originalName,
      size: body.size
    });
    
    const { title, description, fileData, originalName, size } = body;
    
    if (!title || !fileData) {
      return NextResponse.json(
        { 
          error: 'Title and file data are required',
        },
        { status: 400 }
      );
    }

    // 创建临时文件目录
    const tempDir = '/tmp';
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // 创建临时文件
    const fileExtension = path.extname(originalName) || '.mp3';
    const tempFileName = `${createId()}${fileExtension}`;
    tempFilePath = path.join(tempDir, tempFileName);
    
    // 将 Base64 数据写入临时文件
    const buffer = Buffer.from(fileData, 'base64');
    await writeFile(tempFilePath, buffer);
    
    console.log('Temporary file created:', tempFilePath);
    
    // 估算音频时长（简单计算，可能不准确）
    const estimatedDuration = Math.round(size / 16000); // 假设 16kbps
    
    // 创建数据库记录
    const [newModel] = await db.insert(schema.models).values({
      title,
      description: description || '',
      status: 'creating',
      audioPath: '', // 云端不存储路径
      audioDuration: estimatedDuration,
      audioSize: size,
    }).returning();
    
    console.log('Model record created:', newModel.id);
    
    // 使用临时文件创建 Fish Audio 模型
    try {
      console.log('Creating Fish Audio model...');
      // 读取临时文件为 Buffer
      const audioBuffer = await readFile(tempFilePath);
      const fishModel = await createFishModel(title, description || '', audioBuffer);
      const fishModelId = fishModel.id;
      console.log('Fish Audio model created:', fishModelId);
      
      // 更新模型状态
      await db
        .update(schema.models)
        .set({ 
          fishModelId,
          status: 'ready',
          audioPath: '', // 云端不保存文件路径
        })
        .where(eq(schema.models.id, newModel.id));
      
      return NextResponse.json({
        success: true,
        model: {
          ...newModel,
          fishModelId,
          status: 'ready'
        }
      });
      
    } catch (fishError) {
      console.error('Fish Audio model creation failed:', fishError);
      
      // 更新模型状态为失败
      await db
        .update(schema.models)
        .set({ status: 'failed' })
        .where(eq(schema.models.id, newModel.id));
      
      return NextResponse.json({
        error: `模型创建失败: ${fishError instanceof Error ? fishError.message : '未知错误'}`,
        modelId: newModel.id
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Create model error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Model creation failed'
      },
      { status: 500 }
    );
  } finally {
    // 清理临时文件
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log('Temporary file cleaned up:', tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary file:', cleanupError);
      }
    }
  }
}