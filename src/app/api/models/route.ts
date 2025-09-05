import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const models = await db
      .select()
      .from(schema.models)
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