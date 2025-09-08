import { NextResponse } from 'next/server';
import { debugFishModels } from '@/lib/fish-audio';
import { db, schema } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== Fish Audio Debug API Called ===');
    
    // 获取Fish Audio云端模型列表
    const fishResult = await debugFishModels();
    
    // 获取本地数据库中的模型记录
    const localModels = await db.select().from(schema.models);
    
    // 确保fishResult.models是数组
    const fishModels = Array.isArray(fishResult.models) ? fishResult.models : [];
    
    // 分析数据一致性
    const analysis = {
      localModelsCount: localModels.length,
      fishModelsCount: fishResult.count,
      localModels: localModels.map((model: any) => ({
        id: model.id,
        title: model.title,
        fishModelId: model.fishModelId,
        status: model.status,
        createdAt: model.createdAt
      })),
      fishModels: fishModels.map((model: any) => ({
        id: model.id,
        title: model.title,
        description: model.description,
        created_at: model.created_at,
        status: model.status
      })),
      consistency: {
        orphanedLocalModels: [] as any[],
        orphanedFishModels: [] as any[]
      }
    };
    
    // 检查数据一致性
    const localFishIds = localModels.map((m: any) => m.fishModelId).filter(Boolean);
    const fishIds = fishModels.map((m: any) => m.id);
    
    // 找出本地有但Fish Audio没有的模型（孤儿本地模型）
    analysis.consistency.orphanedLocalModels = localModels.filter((local: any) => 
      local.fishModelId && !fishIds.includes(local.fishModelId)
    ).map((model: any) => ({
      localId: model.id,
      title: model.title,
      fishModelId: model.fishModelId,
      status: model.status
    }));
    
    // 找出Fish Audio有但本地没有的模型（孤儿Fish模型）
    analysis.consistency.orphanedFishModels = fishModels.filter((fish: any) => 
      !localFishIds.includes(fish.id)
    ).map((model: any) => ({
      fishId: model.id,
      title: model.title,
      description: model.description,
      created_at: model.created_at
    }));
    
    console.log('=== Debug Analysis Complete ===');
    console.log(`Local models: ${analysis.localModelsCount}`);
    console.log(`Fish models: ${analysis.fishModelsCount}`);
    console.log(`Orphaned local models: ${analysis.consistency.orphanedLocalModels.length}`);
    console.log(`Orphaned Fish models: ${analysis.consistency.orphanedFishModels.length}`);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      analysis: analysis
    });
    
  } catch (error) {
    console.error('Fish Audio debug API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Debug request failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}