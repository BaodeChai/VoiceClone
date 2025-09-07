import { drizzle as drizzleBetterSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import path from 'path';

// 动态导入schema
const isProduction = process.env.NODE_ENV === 'production' && process.env.POSTGRES_URL;

let schema: any;
let db: any;

if (isProduction) {
  // 生产环境使用 PostgreSQL
  const postgresSchema = require('./schema-postgres');
  const connectionString = process.env.POSTGRES_URL!;
  const client = postgres(connectionString, { max: 1 });
  
  db = drizzlePostgres(client, { schema: postgresSchema });
  schema = postgresSchema;
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

export { db };

// 导出 schema 供外部使用
export { schema };