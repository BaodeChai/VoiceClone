'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Upload, 
  FileAudio, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Music,
  Sparkles,
  Waves,
  Play,
  Mic2
} from 'lucide-react';

interface VoiceCloneSectionProps {
  onModelCreated: () => void;
}

export function VoiceCloneSection({ onModelCreated }: VoiceCloneSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [audioPath, setAudioPath] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver] = useState(false);

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
    const fileInput = document.getElementById('audio-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // 格式化时长显示
  const formatDuration = (seconds: number): string => {
    return `${Math.round(seconds)}秒`;
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const isValidDuration = await validateAudioDuration(file);
    if (!isValidDuration) return;

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

  // 处理文件输入变化
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  // 拖拽处理
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('audio/')) {
        await handleFileUpload(file);
      } else {
        alert('请上传音频文件');
      }
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
    <div className="space-y-8">
      {/* 步骤指示器 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            uploadedFile ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <span className="text-sm font-medium">1</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            title ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <span className="text-sm font-medium">2</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            title && audioPath ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <span className="text-sm font-medium">3</span>
          </div>
        </div>
      </div>

      {/* 音频上传区域 */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FileAudio className="w-5 h-5 text-primary" />
            <Label className="text-base font-medium">上传音频文件</Label>
          </div>
          
          {/* 要求提示 */}
          <div className="glass-card p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">获得最佳克隆效果的建议</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>时长：10-90秒（推荐30秒）</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4 text-primary" />
                    <span>格式：MP3、WAV、M4A</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Waves className="w-4 h-4 text-primary" />
                    <span>质量：清晰、无背景噪音</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mic2 className="w-4 h-4 text-primary" />
                    <span>内容：多样化语音内容</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 上传区域 */}
          {!uploadedFile ? (
            <div 
              className={`upload-area ${dragOver ? 'dragover' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground mb-2">
                    拖拽音频文件到这里，或者
                  </p>
                  <label htmlFor="audio-upload" className="btn-primary cursor-pointer inline-flex items-center">
                    <FileAudio className="w-4 h-4 mr-2" />
                    选择文件
                  </label>
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/mp3,audio/wav,audio/m4a,audio/mpeg,audio/x-wav"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
                {isUploading && (
                  <div className="flex items-center space-x-2 text-primary">
                    <div className="loading-spinner" />
                    <span className="text-sm">上传中...</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{uploadedFile.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>时长: {formatDuration(audioDuration)}</span>
                      <span>大小: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteFile}
                  className="text-muted-foreground hover:text-error hover:bg-error/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 模型信息 */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <Label className="text-base font-medium">模型信息</Label>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model-title">模型名称 *</Label>
            <Input
              id="model-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="为您的声音模型起一个独特的名字"
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model-description">模型描述</Label>
            <Textarea
              id="model-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这个声音模型的特点，如音色、风格等"
              rows={3}
              className="textarea-field"
            />
            <p className="text-xs text-muted-foreground">
              好的描述有助于您和他人更好地识别和使用这个模型
            </p>
          </div>
        </div>
      </div>

      {/* 创建按钮 */}
      <div className="pt-4">
        <Button
          onClick={handleCreateModel}
          disabled={!title || !audioPath || isCreating}
          className="btn-primary w-full h-12 text-base"
        >
          {isCreating ? (
            <div className="flex items-center space-x-2">
              <div className="loading-spinner" />
              <span>正在创建模型...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>创建声音模型</span>
            </div>
          )}
        </Button>
        
        {!title || !audioPath ? (
          <p className="text-center text-sm text-muted-foreground mt-3">
            请完成上述步骤以创建您的声音模型
          </p>
        ) : (
          <p className="text-center text-sm text-success mt-3 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            一切就绪，点击创建您的专属声音模型
          </p>
        )}
      </div>
    </div>
  );
}