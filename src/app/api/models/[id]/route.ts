import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

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
    const [model] = await db
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

    // TODO: 如果需要，也删除Fish Audio平台上的模型
    // 这需要调用Fish Audio API的删除接口
    if (model.fishModelId) {
      console.log(`Note: Fish Audio model ${model.fishModelId} should be deleted manually on the platform`);
      // try {
      //   await deleteFishModel(model.fishModelId);
      // } catch (fishError) {
      //   console.warn('Failed to delete Fish Audio model:', fishError);
      // }
    }

    // 从数据库删除模型记录
    await db.delete(schema.models).where(eq(schema.models.id, modelId));

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
    const [model] = await db
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