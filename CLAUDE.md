# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

声音克隆网站 - 基于 Next.js 15 + Fish Audio SDK 的全栈应用，实现声音模型创建和文本转语音功能。

## 技术栈

- **Frontend**: Next.js 15.5.2, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes  
- **Database**: SQLite + Drizzle ORM
- **Audio**: Fish Audio SDK (v2025.6.8)
- **UI**: shadcn/ui components with Radix UI
- **Build Tool**: Turbopack (Next.js dev/build)

## 开发命令

### 基础开发命令
```bash
npm run dev          # 启动开发服务器 (Turbopack)
npm run build        # 构建生产版本
npm run start        # 启动生产服务器  
npm run lint         # 运行 ESLint 检查
```

### 数据库命令
```bash
npm run db:generate  # 生成数据库迁移文件
npm run db:push      # 推送 schema 变更到数据库
npm run db:migrate   # 运行数据库迁移
```

## 项目架构

### 核心架构模式
```
Next.js App Router 全栈应用
├── Frontend (React Components)
├── API Routes (Backend Logic)
├── SQLite Database (Drizzle ORM)
└── Fish Audio SDK Integration
```

### 关键目录结构
```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx        # 主页面 (首页营销页面)
│   ├── clone/          # 声音克隆页面
│   ├── synthesis/      # 文本转语音页面  
│   ├── system/         # 模型管理页面
│   ├── models/         # 模型列表页面
│   └── api/            # API Routes
│       ├── upload/     # 音频文件上传
│       ├── models/     # 声音模型管理
│       │   ├── create/ # 创建模型
│       │   └── [id]/   # 删除模型
│       ├── tts/        # 文本转语音生成
│       └── audio/[id]/ # 音频文件访问
├── components/         # React 组件
│   ├── ui/            # shadcn/ui 基础组件 (button, card, dialog 等)
│   ├── header.tsx     # 全局导航栏
│   └── footer.tsx     # 全局页脚
└── lib/               # 工具库和配置
    ├── db/            # 数据库配置和 schema
    ├── upload/        # 文件上传处理
    ├── audio-format.ts # 音频格式化工具
    └── fish-audio.ts  # Fish Audio SDK 封装
```

### 数据库设计
- **models**: 声音模型表 (id, title, fishModelId, status, audioPath, audioDuration, audioSize)
- **tts_history**: TTS 生成历史 (id, modelId, text, audioPath, format) - 用于实际使用统计

## 环境配置

### 必需环境变量 (.env.local)
```bash
FISH_AUDIO_API_KEY=your_fish_audio_api_key_here
DATABASE_URL=sqlite:./voice_clone.db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50MB
```

## 功能流程

### 声音克隆流程
1. 用户上传音频文件 → `/api/upload`
2. 创建声音模型 → `/api/models/create` 
3. Fish Audio API 训练模型
4. 模型状态更新 (creating → ready/failed)

### 文本转语音流程  
1. 选择已训练模型
2. 输入文本 → `/api/tts`
3. 调用 Fish Audio TTS API
4. 返回音频文件路径 → `/api/audio/[id]`

## Fish Audio SDK 集成

### 核心 API 封装 (`src/lib/fish-audio.ts`)
- `createFishModel()` - 创建声音模型
- `generateTTS()` - 文本转语音
- `getFishModels()` - 获取模型列表

### API 端点映射
- `/api/upload` ↔ 文件上传处理
- `/api/models/create` ↔ `fishSession.create_model()`
- `/api/tts` ↔ `fishSession.tts(TTSRequest())`

## 关键实现特性

### Fish Audio SDK 集成
- 使用 30秒超时机制防止长时间等待
- 延迟初始化 Session 避免启动时验证环境变量
- TTSRequest 正确调用方式 (不用 new)
- 支持音频格式: MP3, WAV, OPUS

### 实际使用统计
- 通过 `ttsHistory` 表记录每次 TTS 生成
- 使用 SQL JOIN 查询真实使用次数和最后使用时间
- 时间戳处理: 数据库返回秒级时间戳，前端需要 *1000 转换为毫秒

### UI/UX 优化
- 使用 shadcn/ui Dialog 组件替代原生 confirm/alert
- 自定义对话框居中显示，无浏览器 URL 信息干扰
- 响应式设计支持多设备访问

## 开发建议

### 文件操作
- 所有上传文件存储在 `./uploads` 目录
- 使用 CUID2 生成唯一文件名
- 支持 MP3, WAV, FLAC 格式

### 错误处理
- API Routes 统一错误格式: `{ error: string }`
- 使用自定义 Dialog 组件显示错误，避免使用 alert()
- 后端错误记录到 console，包含详细调试信息

### 类型安全  
- 完整的 TypeScript 配置
- Drizzle ORM 自动生成类型
- 前端接口定义包含可选字段 (usageCount?, lastUsedAt?)

## 重要技术细节

### 时间戳转换
```typescript
// 数据库返回秒级时间戳，需要转换为毫秒级
new Date((model.lastUsedAt ? model.lastUsedAt * 1000 : model.createdAt))
```

### Fish Audio API 调用
```typescript  
// 正确的 TTSRequest 调用方式
const request = TTSRequest({
  text, reference_id, format, chunk_length, normalize
});
```

### 使用统计查询
```sql
-- 使用 LEFT JOIN 和聚合函数计算实际使用次数
SELECT models.*, 
  COALESCE(COUNT(tts_history.id), 0) as usageCount,
  MAX(tts_history.createdAt) as lastUsedAt
FROM models 
LEFT JOIN tts_history ON models.id = tts_history.modelId
GROUP BY models.id;
```