'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
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
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // const [models, setModels] = useState<Model[]>([]);

  // 验证音频时长并保存时长信息
  const validateAudioDuration = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        const duration = audio.duration;
        
        if (duration < 10) {
          alert('音频时长过短，请选择10-90秒的音频文件');
          resolve(false);
        } else if (duration > 90) {
          alert('音频时长过长，请选择10-90秒的音频文件');
          resolve(false);
        } else {
          // 保存音频时长
          setAudioDuration(duration);
          resolve(true);
        }
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        alert('无法读取音频文件，请确认文件格式正确');
        resolve(false);
      };
      
      audio.src = url;
    });
  };

  // 删除已上传的文件
  const handleDeleteFile = () => {
    setUploadedFile(null);
    setAudioPath('');
    setAudioDuration(0);
    // 清除文件输入框
    const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // 格式化时长显示 (直接显示秒数)
  const formatDuration = (seconds: number): string => {
    return `${Math.round(seconds)}秒`;
  };

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 先验证音频时长
    const isValidDuration = await validateAudioDuration(file);
    if (!isValidDuration) {
      // 清除文件选择
      event.target.value = '';
      return;
    }

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
        setAudioDuration(0);
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
        <div className="space-y-2">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">📝 音频文件要求：</div>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>时长：</strong>10-90秒之间（推荐30秒左右）</li>
                <li>• <strong>格式：</strong>支持 MP3、WAV、M4A 格式</li>
                <li>• <strong>质量：</strong>建议清晰、无背景噪音</li>
                <li>• <strong>内容：</strong>包含多样化的语音内容效果更佳</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              id="audio-upload"
              type="file"
              accept="audio/mp3,audio/wav,audio/m4a,audio/mpeg,audio/x-wav"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {isUploading && <span className="text-sm text-muted-foreground">上传中...</span>}
          </div>
          {uploadedFile && (
            <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <div className="text-sm">
                  <span className="text-green-700 font-medium">{uploadedFile.name}</span>
                  <span className="text-green-600 ml-2">
                    ({formatDuration(audioDuration)})
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteFile}
                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                title="删除文件"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
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