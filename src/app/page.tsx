'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceCloneSection } from '@/components/voice-clone-section';
import { TextToSpeechSection } from '@/components/text-to-speech-section';

export default function Home() {
  const [models, setModels] = useState([]);

  // 获取模型列表
  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      if (data.success) {
        setModels(data.models);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">声音克隆网站</h1>
          <p className="text-muted-foreground">
            使用 Fish Audio 技术实现声音克隆和文本转语音
          </p>
        </header>

        <div className="grid gap-8">
          {/* 声音克隆区域 */}
          <Card>
            <CardHeader>
              <CardTitle>声音克隆</CardTitle>
              <CardDescription>
                上传音频文件来创建您的个人语音模型
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceCloneSection onModelCreated={fetchModels} />
            </CardContent>
          </Card>

          {/* 文本转语音区域 */}
          <Card>
            <CardHeader>
              <CardTitle>文本转语音</CardTitle>
              <CardDescription>
                选择语音模型并输入文本来生成语音
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TextToSpeechSection models={models} onModelDeleted={fetchModels} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}