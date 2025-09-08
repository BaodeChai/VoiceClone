import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { deleteFishModel } from '@/lib/fish-audio';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: modelId } = await params;
    
    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    // 查找要删除的模型
    const [model] = await (db as any)
      .select()
      .from(schema.models)
      .where(eq(schema.models.id, modelId));

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // 删除关联的音频文件（如果存在）
    if (model.audioPath && existsSync(model.audioPath)) {
      try {
        await unlink(model.audioPath);
        console.log(`Deleted audio file: ${model.audioPath}`);
      } catch (fileError) {
        console.warn(`Failed to delete audio file ${model.audioPath}:`, fileError);
        // 继续删除数据库记录，即使文件删除失败
      }
    }

    // 删除Fish Audio云端模型
    if (model.fishModelId) {
      try {
        console.log(`Attempting to delete Fish Audio model: ${model.fishModelId}`);
        await deleteFishModel(model.fishModelId);
        console.log(`Successfully deleted Fish Audio model: ${model.fishModelId}`);
      } catch (fishError) {
        console.warn('Failed to delete Fish Audio model:', fishError);
        // 记录错误但继续删除本地记录
        // 这样即使Fish Audio删除失败，本地记录仍会被清理
      }
    }

    // 从数据库删除模型记录
    await (db as any).delete(schema.models).where(eq(schema.models.id, modelId));

    return NextResponse.json({
      success: true,
      message: 'Model deleted successfully'
    });

  } catch (error) {
    console.error('Model deletion error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Model deletion failed'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: modelId } = await params;
    
    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    // 查找指定模型
    const [model] = await (db as any)
      .select()
      .from(schema.models)
      .where(eq(schema.models.id, modelId));

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      model: model
    });

  } catch (error) {
    console.error('Model fetch error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch model'
      },
      { status: 500 }
    );
  }
}