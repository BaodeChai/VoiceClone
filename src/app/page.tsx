'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RiMicLine, RiVolumeUpLine, RiDatabase2Line, RiCloudLine, RiCpuLine, RiPlayLine, RiEyeLine, RiSoundModuleLine } from 'react-icons/ri';

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

  const features = [
    {
      icon: RiMicLine,
      title: '声音克隆',
      description: '上传10-90秒音频样本，创建个人专属声音模型',
      color: 'text-blue-600'
    },
    {
      icon: RiVolumeUpLine,
      title: '语音合成',
      description: '将文本转换为和你的声音极高相似度的语音',
      color: 'text-green-600'
    },
    {
      icon: RiDatabase2Line,
      title: '模型管理',
      description: '管理所有声音模型，查看训练状态和使用情况',
      color: 'text-purple-600'
    },
    {
      icon: RiCloudLine,
      title: 'AI Technology',
      description: '基于先进AI技术，提供工业级声音克隆解决方案',
      color: 'text-orange-600'
    }
  ];

  const stats = [
    { number: '10,000+', label: '声音模型' },
    { number: '50,000+', label: '用户使用' },
    { number: '99.9%', label: '服务可用性' },
    { number: '< 30s', label: '平均响应时间' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ 
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 800"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgb(59,130,246);stop-opacity:0.1" /><stop offset="100%" style="stop-color:rgb(147,51,234);stop-opacity:0.1" /></linearGradient></defs><rect width="1920" height="800" fill="url(%23grad1)" /></svg>')` 
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                创造你的
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 专属声音</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                基于先进AI技术，只需简单的音频样本，即可创建高质量的个人声音模型，实现文本到语音的完美转换。
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/clone">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg font-semibold rounded-xl">
                    <RiCpuLine className="mr-3 text-xl" />
                    开始声音克隆
                  </Button>
                </Link>
                <Link href="/synthesis">
                  <Button variant="outline" size="lg" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold rounded-xl">
                    <RiPlayLine className="mr-3 text-xl" />
                    开始语音合成
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/studio-bg.jpg"
                alt="专业录音室 - AI声音克隆技术"
                className="rounded-2xl shadow-2xl object-cover w-full h-96"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <RiSoundModuleLine className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">AI 驱动</p>
                    <p className="text-sm text-gray-600">高质量声音克隆</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">强大的功能特性</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              从声音采集到语音合成的完整解决方案，让AI技术为您的创意赋能
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center ${feature.color}`}>
                      <IconComponent className="text-2xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">如何工作</h2>
            <p className="text-xl text-gray-600">简单三步，即可拥有专属数字声音</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">上传音频样本</h3>
              <p className="text-gray-600">上传10-90秒的清晰音频文件，支持MP3、WAV、M4A格式</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI 模型训练</h3>
              <p className="text-gray-600">系统自动分析音频特征，训练成专属你的声音克隆模型</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">生成语音</h3>
              <p className="text-gray-600">输入文本内容，即可生成极高相似度的个性化语音</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">准备好创造你的专属声音了吗？</h2>
          <p className="text-xl text-blue-100 mb-8">
            加入数万用户的行列，体验最先进的AI声音克隆技术
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/clone">
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-xl"
              >
                <RiMicLine className="mr-3 text-xl" />
                立即开始
              </Button>
            </Link>
            <Link href="/system">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent px-8 py-6 text-lg font-semibold rounded-xl"
              >
                <RiEyeLine className="mr-3 text-xl" />
                查看模型
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}