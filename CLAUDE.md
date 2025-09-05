# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

声音克隆网站 - 基于 Next.js 14 + Fish Audio SDK 的全栈应用，实现声音模型创建和文本转语音功能。

## 技术栈

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: SQLite + Drizzle ORM
- **Audio**: Fish Audio SDK
- **UI**: shadcn/ui components with Radix UI

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
│   ├── page.tsx        # 主页面 (声音克隆 + TTS)
│   └── api/            # API Routes
│       ├── upload/     # 音频文件上传
│       ├── models/     # 声音模型管理
│       ├── tts/        # 文本转语音生成
│       └── audio/[id]/ # 音频文件访问
├── components/         # React 组件
│   ├── ui/            # shadcn/ui 基础组件
│   ├── voice-clone-section.tsx    # 声音克隆功能
│   └── text-to-speech-section.tsx # TTS 功能
└── lib/               # 工具库和配置
    ├── db/            # 数据库配置和 schema
    ├── upload/        # 文件上传处理
    └── fish-audio.ts  # Fish Audio SDK 封装
```

### 数据库设计
- **models**: 声音模型表 (id, title, fishModelId, status, audioPath)
- **tts_history**: TTS 生成历史 (id, modelId, text, audioPath, format)

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

## 已知问题和修复点

### 关键问题 (需要修复)
1. **Fish Audio SDK 调用方式**: `new TTSRequest()` 应改为 `TTSRequest()`
2. **文件路径配置**: 使用相对路径可能导致问题，应使用绝对路径
3. **环境变量验证**: 模块加载时验证会导致应用无法启动

### 组件状态管理
- 使用 React Hook (useState, useEffect) 进行状态管理
- 父子组件通过 props 传递数据和回调函数
- 无全局状态管理库 (适合简单应用)

## 开发建议

### 文件操作
- 所有上传文件存储在 `./uploads` 目录
- 使用 CUID2 生成唯一文件名
- 支持 MP3, WAV, FLAC 格式

### 错误处理
- API Routes 统一错误格式: `{ error: string }`
- 前端组件使用 try-catch 和 alert 显示错误
- 后端错误记录到 console

### 类型安全
- 完整的 TypeScript 配置
- Drizzle ORM 自动生成类型
- Fish Audio SDK 类型定义