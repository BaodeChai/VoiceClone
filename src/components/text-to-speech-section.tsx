'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Model {
  id: string;
  title: string;
  description?: string;
  status: string;
  fishModelId?: string;
}

interface TextToSpeechSectionProps {
  models: Model[];
}

export function TextToSpeechSection({ models }: TextToSpeechSectionProps) {
  const [text, setText] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');

  // 生成语音
  const handleGenerateSpeech = async () => {
    if (!text || !selectedModelId) {
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
              <SelectItem value="" disabled>
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
        disabled={!text || !selectedModelId || isGenerating || availableModels.length === 0}
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
                  <div>
                    <h4 className="font-medium">{model.title}</h4>
                    {model.description && (
                      <p className="text-sm text-muted-foreground">
                        {model.description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm">
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