import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// 数据库迁移脚本
export async function runMigration() {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is required for migration');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    console.log('Starting database migration...');
    
    // 创建 models 表
    await connection`
      CREATE TABLE IF NOT EXISTS "models" (
        "id" text PRIMARY KEY,
        "title" text NOT NULL,
        "description" text,
        "fish_model_id" text,
        "status" text NOT NULL DEFAULT 'creating',
        "audio_path" text,
        "audio_duration" integer,
        "audio_size" integer,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建 tts_history 表
    await connection`
      CREATE TABLE IF NOT EXISTS "tts_history" (
        "id" text PRIMARY KEY,
        "model_id" text,
        "text" text NOT NULL,
        "audio_path" text NOT NULL,
        "audio_format" text NOT NULL DEFAULT 'mp3',
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE
      )
    `;

    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}