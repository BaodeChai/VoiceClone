'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Volume2, 
  Play, 
  Download, 
  Trash2, 
  User,
  MessageSquare,
  Waves,
  Mic,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

interface Model {
  id: string;
  title: string;
  description?: string;
  status: string;
  fishModelId?: string;
  createdAt?: string;
}

interface TextToSpeechSectionProps {
  models: Model[];
  onModelDeleted: () => void;
}

export function TextToSpeechSection({ models, onModelDeleted }: TextToSpeechSectionProps) {
  const [text, setText] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // 格式化时间显示
  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 删除模型
  const handleDeleteModel = async (modelId: string, modelTitle: string) => {
    if (!confirm(`确定要删除模型"${modelTitle}"吗？此操作不可撤销。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/models/${modelId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('模型删除成功！');
        onModelDeleted();
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('删除失败');
    }
  };

  // 生成语音
  const handleGenerateSpeech = async () => {
    if (!text || !selectedModelId || selectedModelId === 'no-models') {
      alert('请输入文本并选择语音模型');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          modelId: selectedModelId,
          format: 'mp3',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAudioUrl(data.audioPath);
      } else {
        alert('生成失败: ' + data.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 过滤可用的模型
  const availableModels = models.filter(model => model.status === 'ready' && model.fishModelId);
  
  // 字符统计
  const textLength = text.length;
  const isTextValid = textLength >= 10 && textLength <= 500;

  return (
    <div className="space-y-8">
      {/* 步骤指示器 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            selectedModelId ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <span className="text-sm font-medium">1</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            isTextValid ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <span className="text-sm font-medium">2</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            audioUrl ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <span className="text-sm font-medium">3</span>
          </div>
        </div>
      </div>

      {/* 模型选择 */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-primary" />
          <Label className="text-base font-medium">选择语音模型</Label>
        </div>

        {availableModels.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">暂无可用的语音模型</h3>
            <p className="text-muted-foreground mb-4">
              请先切换到&ldquo;声音克隆&rdquo;标签页创建您的第一个语音模型
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-muted/50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-warning mr-2" />
              <span className="text-sm text-muted-foreground">需要至少一个已训练完成的模型</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableModels.map((model) => (
              <div
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`glass-card p-4 cursor-pointer transition-all duration-200 hover-lift ${
                  selectedModelId === model.id ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedModelId === model.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{model.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {model.description || '专业语音模型'}
                    </p>
                    <div className="flex items-center mt-2">
                      <CheckCircle className="w-3 h-3 text-success mr-1" />
                      <span className="text-xs text-success">已训练完成</span>
                    </div>
                  </div>
                  {selectedModelId === model.id && (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 文本输入 */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <Label className="text-base font-medium">输入要转换的文本</Label>
        </div>

        <div className="glass-card p-6">
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="在这里输入您想要转换为语音的文本内容..."
                rows={6}
                className="textarea-field resize-none"
                maxLength={500}
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <div className={`text-xs px-2 py-1 rounded ${
                  textLength === 0 ? 'text-muted-foreground' :
                  isTextValid ? 'text-success bg-success/10' : 'text-error bg-error/10'
                }`}>
                  {textLength}/500
                </div>
              </div>
            </div>

            {textLength > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">预估语音时长</p>
                  <p>约 {Math.ceil(textLength / 8)} 秒</p>
                  {!isTextValid && (
                    <p className="text-warning mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      建议文本长度：10-500 个字符
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 生成按钮 */}
      <div className="pt-4">
        <Button
          onClick={handleGenerateSpeech}
          disabled={!isTextValid || !selectedModelId || selectedModelId === 'no-models' || isGenerating || availableModels.length === 0}
          className="btn-primary w-full h-12 text-base"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="loading-spinner" />
              <span>正在生成语音...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>生成语音</span>
            </div>
          )}
        </Button>

        {!selectedModelId || !isTextValid ? (
          <p className="text-center text-sm text-muted-foreground mt-3">
            请选择模型并输入有效文本以生成语音
          </p>
        ) : (
          <p className="text-center text-sm text-success mt-3 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            准备就绪，点击生成您的专属语音
          </p>
        )}
      </div>

      {/* 音频播放器 */}
      {audioUrl && (
        <div className="audio-player animate-fade-in">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Waves className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">生成完成</h3>
              <p className="text-sm text-muted-foreground">您的语音已经准备好了</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <audio
              controls
              className="w-full h-12"
              src={audioUrl}
              preload="metadata"
            >
              您的浏览器不支持音频播放器
            </audio>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>MP3 格式，高质量音频</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = audioUrl;
                  link.download = `generated_speech_${Date.now()}.mp3`;
                  link.click();
                }}
                className="btn-secondary"
              >
                <Download className="w-4 h-4 mr-2" />
                下载音频
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 模型管理区域 */}
      {models.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-primary" />
              <Label className="text-base font-medium">模型管理</Label>
            </div>
            <span className="text-sm text-muted-foreground">{models.length} 个模型</span>
          </div>

          <div className="grid gap-4">
            {models.map((model) => (
              <div key={model.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      model.status === 'ready' ? 'bg-success/10' :
                      model.status === 'creating' ? 'bg-warning/10' : 'bg-error/10'
                    }`}>
                      {model.status === 'ready' ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : model.status === 'creating' ? (
                        <Clock className="w-4 h-4 text-warning" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-error" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{model.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {model.description && <span>{model.description}</span>}
                        {model.createdAt && <span>{formatDateTime(model.createdAt)}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`status-badge ${
                      model.status === 'ready' ? 'success' :
                      model.status === 'creating' ? 'warning' : 'error'
                    }`}>
                      {model.status === 'ready' ? '已完成' : 
                       model.status === 'creating' ? '创建中' : '失败'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModel(model.id, model.title)}
                      className="text-muted-foreground hover:text-error hover:bg-error/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}