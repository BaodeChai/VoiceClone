import { NextResponse } from 'next/server';
import { runMigration } from '@/lib/db/migrate';

export async function POST() {
  try {
    // 只在生产环境允许迁移
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { error: 'Migration is only allowed in production environment' },
        { status: 403 }
      );
    }

    if (!process.env.POSTGRES_URL) {
      return NextResponse.json(
        { error: 'POSTGRES_URL environment variable is required' },
        { status: 500 }
      );
    }

    await runMigration();

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully!'
    });

  } catch (error) {
    console.error('Migration error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Migration failed'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Migration endpoint. Use POST to run migration.',
    environment: process.env.NODE_ENV,
    hasPostgresUrl: !!process.env.POSTGRES_URL
  });
}