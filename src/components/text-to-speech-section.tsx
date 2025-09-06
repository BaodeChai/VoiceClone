'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* 模型选择 */}
      <div className="space-y-2">
        <Label htmlFor="model-select">选择语音模型</Label>
        <Select value={selectedModelId} onValueChange={setSelectedModelId}>
          <SelectTrigger>
            <SelectValue placeholder="选择一个语音模型" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.length === 0 ? (
              <SelectItem value="no-models" disabled>
                暂无可用模型，请先创建声音模型
              </SelectItem>
            ) : (
              availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.title}
                  {model.description && (
                    <span className="text-muted-foreground ml-2">
                      - {model.description}
                    </span>
                  )}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* 文本输入 */}
      <div className="space-y-2">
        <Label htmlFor="text-input">输入文本</Label>
        <Textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入您想要转换为语音的文本..."
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          建议文本长度: 10-500 个字符
        </p>
      </div>

      {/* 生成按钮 */}
      <Button
        onClick={handleGenerateSpeech}
        disabled={!text || !selectedModelId || selectedModelId === 'no-models' || isGenerating || availableModels.length === 0}
        className="w-full"
      >
        {isGenerating ? '生成中...' : '生成语音'}
      </Button>

      {/* 音频播放器 */}
      {audioUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">生成的语音</CardTitle>
            <CardDescription>点击播放按钮试听生成的语音</CardDescription>
          </CardHeader>
          <CardContent>
            <audio
              controls
              className="w-full"
              src={audioUrl}
              preload="metadata"
            >
              您的浏览器不支持音频播放器
            </audio>
            <div className="mt-4 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = audioUrl;
                  link.download = `generated_speech_${Date.now()}.mp3`;
                  link.click();
                }}
              >
                下载音频
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 已有模型展示 */}
      {models.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">我的语音模型</CardTitle>
            <CardDescription>您已创建的语音模型列表</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{model.title}</h4>
                        {model.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {model.description}
                          </p>
                        )}
                        {model.createdAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            创建时间: {formatDateTime(model.createdAt)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs ${
                            model.status === 'ready'
                              ? 'bg-green-100 text-green-800'
                              : model.status === 'creating'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {model.status === 'ready' ? '已完成' : 
                           model.status === 'creating' ? '创建中' : '失败'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteModel(model.id, model.title)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title="删除模型"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}