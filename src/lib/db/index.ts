import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import * as schema from './schema';

// 创建数据库连接
const dbPath = process.env.DATABASE_URL?.replace('sqlite:', '') || path.join(process.cwd(), 'voice_clone.db');
const sqlite = new Database(dbPath);

// 启用外键支持
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// 导出 schema 供外部使用
export { schema };