'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface VoiceCloneSectionProps {
  onModelCreated: () => void;
}

// interface Model {
//   id: string;
//   title: string;
//   description?: string;
//   status: string;
//   createdAt: string;
// }

export function VoiceCloneSection({ onModelCreated }: VoiceCloneSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioPath, setAudioPath] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // const [models, setModels] = useState<Model[]>([]);

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadedFile(file);
        setAudioPath(data.filePath);
      } else {
        alert('上传失败: ' + data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  // 创建声音模型
  const handleCreateModel = async () => {
    if (!title || !audioPath) {
      alert('请填写标题并上传音频文件');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/models/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          audioPath,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('声音模型创建成功！');
        // 重置表单
        setTitle('');
        setDescription('');
        setUploadedFile(null);
        setAudioPath('');
        // 刷新模型列表
        onModelCreated();
      } else {
        alert('创建失败: ' + data.error);
      }
    } catch (error) {
      console.error('Creation error:', error);
      alert('创建失败');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 音频上传 */}
      <div className="space-y-2">
        <Label htmlFor="audio-upload">上传音频文件</Label>
        <div className="flex items-center space-x-2">
          <Input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {isUploading && <span className="text-sm text-muted-foreground">上传中...</span>}
        </div>
        {uploadedFile && (
          <p className="text-sm text-green-600">
            已上传: {uploadedFile.name}
          </p>
        )}
      </div>

      {/* 模型信息 */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model-title">模型标题</Label>
          <Input
            id="model-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="为您的声音模型起一个名字"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model-description">描述 (可选)</Label>
          <Textarea
            id="model-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这个声音模型的特点"
            rows={3}
          />
        </div>
      </div>

      {/* 创建按钮 */}
      <Button
        onClick={handleCreateModel}
        disabled={!title || !audioPath || isCreating}
        className="w-full"
      >
        {isCreating ? '创建中...' : '创建声音模型'}
      </Button>
    </div>
  );
}