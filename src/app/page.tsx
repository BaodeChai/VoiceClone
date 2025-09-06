'use client';

import { useState, useEffect } from 'react';
import { VoiceCloneSection } from '@/components/voice-clone-section';
import { TextToSpeechSection } from '@/components/text-to-speech-section';
import { 
  Mic, 
  Waves, 
  Sparkles, 
  Volume2, 
  Download, 
  Zap, 
  Shield, 
  Cpu 
} from 'lucide-react';

export default function Home() {
  const [models, setModels] = useState([]);
  const [activeTab, setActiveTab] = useState<'clone' | 'tts'>('clone');

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
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo 区域 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Waves className="w-8 h-8 text-primary" />
                <span className="ml-3 text-xl font-bold text-foreground">
                  Fish Audio Clone
                </span>
              </div>
            </div>

            {/* 导航菜单 */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setActiveTab('clone')}
                className={`tab-button ${activeTab === 'clone' ? 'active' : ''}`}
              >
                <Mic className="w-4 h-4 mr-2" />
                声音克隆
              </button>
              <button 
                onClick={() => setActiveTab('tts')}
                className={`tab-button ${activeTab === 'tts' ? 'active' : ''}`}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                文本转语音
              </button>
            </div>

            {/* 右侧操作区 */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {models.length} 个模型
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hero 区域 */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">最自然的 AI 语音克隆</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            使用先进的 Fish Audio 技术，轻松创建高质量的声音模型，实现自然流畅的语音合成
          </p>
          
          {/* 功能特点 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="flex flex-col items-center p-6 glass-card hover-lift animate-fade-in">
              <Sparkles className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">声音克隆</h3>
              <p className="text-sm text-muted-foreground text-center">
                只需上传短音频，即可创建逼真的个人语音模型
              </p>
            </div>
            <div className="flex flex-col items-center p-6 glass-card hover-lift animate-fade-in">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">快速生成</h3>
              <p className="text-sm text-muted-foreground text-center">
                高效的AI算法，快速将文本转换为自然语音
              </p>
            </div>
            <div className="flex flex-col items-center p-6 glass-card hover-lift animate-fade-in">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">安全可靠</h3>
              <p className="text-sm text-muted-foreground text-center">
                本地处理，保护您的数据隐私和声音安全
              </p>
            </div>
          </div>
        </div>

        {/* 标签页导航 - 移动端 */}
        <div className="md:hidden flex justify-center mb-8">
          <div className="glass-card p-2 inline-flex space-x-2">
            <button 
              onClick={() => setActiveTab('clone')}
              className={`tab-button ${activeTab === 'clone' ? 'active' : ''}`}
            >
              <Mic className="w-4 h-4 mr-2" />
              声音克隆
            </button>
            <button 
              onClick={() => setActiveTab('tts')}
              className={`tab-button ${activeTab === 'tts' ? 'active' : ''}`}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              文本转语音
            </button>
          </div>
        </div>

        {/* 主要功能区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-3">
            <div className="glass-card p-8 animate-slide-up">
              {activeTab === 'clone' ? (
                <div>
                  <div className="flex items-center mb-6">
                    <Mic className="w-6 h-6 text-primary mr-3" />
                    <h2 className="text-2xl font-bold">创建声音模型</h2>
                  </div>
                  <VoiceCloneSection onModelCreated={fetchModels} />
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-6">
                    <Volume2 className="w-6 h-6 text-primary mr-3" />
                    <h2 className="text-2xl font-bold">文本转语音</h2>
                  </div>
                  <TextToSpeechSection models={models} onModelDeleted={fetchModels} />
                </div>
              )}
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Cpu className="w-5 h-5 text-primary mr-2" />
                我的模型
              </h3>
              
              {models.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Waves className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    还没有创建任何模型
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    开始上传音频来创建您的第一个声音模型
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {models.slice(0, 5).map((model: any) => (
                    <div key={model.id} className="p-3 bg-card/30 rounded-lg border border-white/5 hover:bg-card/50 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{model.title}</h4>
                          <div className="flex items-center mt-1">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              model.status === 'ready' ? 'bg-green-400' :
                              model.status === 'creating' ? 'bg-yellow-400' : 'bg-red-400'
                            }`} />
                            <span className="text-xs text-muted-foreground">
                              {model.status === 'ready' ? '已完成' :
                               model.status === 'creating' ? '创建中' : '失败'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {models.length > 5 && (
                    <div className="text-center">
                      <button className="text-xs text-primary hover:text-primary/80">
                        查看全部 {models.length} 个模型
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 使用提示 */}
            <div className="glass-card p-6 mt-6 animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Download className="w-5 h-5 text-primary mr-2" />
                使用提示
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>上传 10-90 秒的高质量音频文件</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>建议使用清晰、无背景噪音的录音</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>模型训练完成后即可生成语音</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}