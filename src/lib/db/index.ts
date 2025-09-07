import { drizzle as drizzleBetterSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import path from 'path';

// 动态导入schema
const isProduction = process.env.NODE_ENV === 'production' && process.env.POSTGRES_URL;

let schema: any;
let db: any;
let isInitialized = false;

async function initializeDatabase() {
  if (isInitialized) return;

  if (isProduction) {
    // 生产环境使用 PostgreSQL
    const postgresSchema = require('./schema-postgres');
    const connectionString = process.env.POSTGRES_URL!;
    const client = postgres(connectionString, { max: 1 });
    
    db = drizzlePostgres(client, { schema: postgresSchema });
    schema = postgresSchema;

    // 自动创建表结构
    try {
      await client`
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

      await client`
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
      
      console.log('PostgreSQL tables initialized successfully');
    } catch (error) {
      console.warn('Table initialization warning (may already exist):', error);
    }
    
  } else {
    // 开发环境使用 SQLite
    const sqliteSchema = require('./schema-sqlite');
    const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || path.join(process.cwd(), 'voice_clone.db');
    const sqlite = new Database(dbPath);
    
    // 启用外键支持
    sqlite.pragma('foreign_keys = ON');
    
    db = drizzleBetterSqlite(sqlite, { schema: sqliteSchema });
    schema = sqliteSchema;
  }
  
  isInitialized = true;
}

// 立即初始化数据库
initializeDatabase().catch(console.error);

export { db };

// 导出 schema 供外部使用
export { schema };