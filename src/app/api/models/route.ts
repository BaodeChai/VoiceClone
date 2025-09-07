import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { desc, sql, count, max } from 'drizzle-orm';

export async function GET() {
  try {
    // 获取模型及其使用统计
    const models = await db
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
        usageCount: sql<number>`COALESCE(COUNT(${schema.ttsHistory.id}), 0)`,
        lastUsedAt: sql<string | null>`MAX(${schema.ttsHistory.createdAt})`
      })
      .from(schema.models)
      .leftJoin(schema.ttsHistory, sql`${schema.models.id} = ${schema.ttsHistory.modelId}`)
      .groupBy(schema.models.id)
      .orderBy(desc(schema.models.createdAt));
    
    return NextResponse.json({
      success: true,
      models
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