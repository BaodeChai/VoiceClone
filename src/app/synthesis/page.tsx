'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RiVolumeUpLine, RiRefreshLine, RiPlayLine, RiPauseLine, RiDownloadLine, RiVoiceRecognitionLine, RiAddLine, RiLoader4Line } from 'react-icons/ri';

interface VoiceModel {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

function VoiceSynthesisContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [selectedModel, setSelectedModel] = useState('');
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [models, setModels] = useState<VoiceModel[]>([]);

  // 获取模型列表
  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      if (data.success) {
        const readyModels = data.models.filter((model: VoiceModel) => model.status === 'ready');
        setModels(readyModels);
        
        // 检查URL参数中是否有指定的模型ID
        const modelId = searchParams.get('modelId');
        if (modelId && readyModels.find((model: VoiceModel) => model.id === modelId)) {
          setSelectedModel(modelId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchModels();
  }, [searchParams, fetchModels]);

  const handleGenerate = async () => {
    if (!selectedModel || !inputText.trim()) {
      alert('请选择声音模型并输入文本内容');
      return;
    }

    if (inputText.length < 10 || inputText.length > 500) {
      alert('文本长度必须在10-500字符之间');
      return;
    }

    setIsGenerating(true);
    setAudioUrl('');

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: selectedModel,
          text: inputText,
          format: 'mp3'
        }),
      });

      if (!response.ok) {
        throw new Error('语音生成失败');
      }

      const data = await response.json();
      setAudioUrl(data.audioPath);
    } catch (error) {
      console.error('TTS generation failed:', error);
      alert(error instanceof Error ? error.message : '语音生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    const audio = document.getElementById('generated-audio') as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `voice-synthesis-${Date.now()}.mp3`;
      link.click();
    }
  };

  const sampleTexts = [
    '欢迎使用AI声音克隆技术，这将为您带来全新的语音体验。',
    '今天天气真不错，阳光明媚，适合出门走走。',
    '人工智能正在改变我们的生活方式，让未来变得更加美好。',
    '学习是一个持续的过程，每天进步一点点就是成功。'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('voiceSynthesis')}</h1>
          <p className="text-xl text-gray-600">
            选择您的声音模型，将文本转换为高质量语音
          </p>
        </div>

        <div className="space-y-6">
          {/* 模型选择 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('selectVoiceModel')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedModel === model.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{model.title}</h3>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        已完成
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      创建时间：{new Date(model.createdAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit', 
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
              
              {models.length === 0 && (
                <div className="text-center py-8">
                  <RiVoiceRecognitionLine className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">暂无可用的声音模型</p>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/clone'}
                  >
                    <RiAddLine className="mr-2" />
                    创建声音模型
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 文本输入 */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('inputText')}</h2>
              <div className="space-y-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="请输入要转换为语音的文本内容（10-500字符）..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{inputText.length}/500 字符</p>
                  <div className="flex space-x-2">
                    {sampleTexts.map((text, index) => (
                      <button
                        key={index}
                        onClick={() => setInputText(text)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors cursor-pointer"
                      >
                        样本{index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 生成按钮 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedModel || !inputText.trim() || isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <RiLoader4Line className="mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <RiVolumeUpLine className="mr-2" />
                      {t('generateSpeech')}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setInputText('');
                    setSelectedModel('');
                    setAudioUrl('');
                  }}
                >
                  <RiRefreshLine className="mr-2" />
                  {t('reset')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 音频播放器 */}
          {audioUrl && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('generatedAudio')}</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <audio
                    id="generated-audio"
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handlePlayPause}
                        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                      >
                        {isPlaying ? <RiPauseLine className="text-xl" /> : <RiPlayLine className="text-xl" />}
                      </button>
                      <div>
                        <p className="font-medium text-gray-900">合成语音</p>
                        <p className="text-sm text-gray-500">点击播放试听</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                      >
                        <RiDownloadLine className="mr-2" />
                        {t('download')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function VoiceSynthesisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <VoiceSynthesisContent />
    </Suspense>
  );
}