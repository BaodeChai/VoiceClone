import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { desc, sql } from 'drizzle-orm';

export async function GET() {
  try {
    // 获取模型及其使用统计
    const models = await (db as any)
      .select({
        id: schema.models.id,
        title: schema.models.title,
        description: schema.models.description,
        fishModelId: schema.models.fishModelId,
        status: schema.models.status,
        audioPath: schema.models.audioPath,
        audioDuration: schema.models.audioDuration,
        audioSize: schema.models.audioSize,
        createdAt: schema.models.createdAt,
        updatedAt: schema.models.updatedAt,
        usageCount: sql<number>`CAST(COALESCE(COUNT(${schema.ttsHistory.id}), 0) AS INTEGER)`,
        lastUsedAt: sql<number | null>`MAX(${schema.ttsHistory.createdAt})`
      })
      .from(schema.models)
      .leftJoin(schema.ttsHistory, sql`${schema.models.id} = ${schema.ttsHistory.modelId}`)
      .groupBy(schema.models.id)
      .orderBy(desc(schema.models.createdAt));
    
    // 确保数字类型正确，防止PostgreSQL返回字符串
    const processedModels = models.map((model: any) => ({
      ...model,
      usageCount: Number(model.usageCount || 0),
      audioDuration: model.audioDuration ? Number(model.audioDuration) : null,
      audioSize: model.audioSize ? Number(model.audioSize) : null,
      lastUsedAt: model.lastUsedAt ? Number(model.lastUsedAt) : null
    }));
    
    return NextResponse.json({
      success: true,
      models: processedModels
    });
    
  } catch (error) {
    console.error('Failed to fetch models:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch models'
      },
      { status: 500 }
    );
  }
}