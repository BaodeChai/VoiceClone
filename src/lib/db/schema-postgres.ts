import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// 声音模型表 (PostgreSQL)
export const models = pgTable('models', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  fishModelId: text('fish_model_id'), // Fish Audio 返回的模型 ID
  status: text('status').notNull().default('creating'), // creating, ready, failed
  audioPath: text('audio_path'), // 原始音频文件路径
  audioDuration: integer('audio_duration'), // 音频时长（秒）
  audioSize: integer('audio_size'), // 音频文件大小（字节）
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// TTS 生成历史记录表 (PostgreSQL)
export const ttsHistory = pgTable('tts_history', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  modelId: text('model_id').references(() => models.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  audioPath: text('audio_path').notNull(), // 生成的音频文件路径
  audioFormat: text('audio_format').notNull().default('mp3'), // mp3, wav, opus
  createdAt: timestamp('created_at').defaultNow(),
});

export type Model = typeof models.$inferSelect;
export type NewModel = typeof models.$inferInsert;
export type TTSHistory = typeof ttsHistory.$inferSelect;
export type NewTTSHistory = typeof ttsHistory.$inferInsert;