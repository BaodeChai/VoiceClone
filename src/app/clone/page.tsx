'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RiUploadCloud2Line, RiFileMusicLine, RiCloseLine, RiLoader4Line, RiCpuLine, RiCheckLine, RiListCheck } from 'react-icons/ri';

export default function VoiceClonePage() {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelName, setModelName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件格式
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg'];
      if (!allowedTypes.includes(file.type)) {
        alert('请选择MP3、WAV或M4A格式的音频文件');
        return;
      }
      
      // 创建音频元素来检查时长
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      audio.src = url;
      
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        if (duration < 10 || duration > 90) {
          alert('音频时长必须在10-90秒之间');
          URL.revokeObjectURL(url);
          return;
        }
        setSelectedFile(file);
        URL.revokeObjectURL(url);
      };
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !modelName.trim()) {
      alert('请选择音频文件并输入模型名称');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 上传音频文件
      const formData = new FormData();
      formData.append('audio', selectedFile);
      formData.append('title', modelName);

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // 调用真实的 API
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('文件上传失败');
      }

      const uploadData = await uploadResponse.json();

      // 创建模型
      const createResponse = await fetch('/api/models/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: modelName,
          audioPath: uploadData.filePath,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('模型创建失败');
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);
      setShowSuccess(true);
      
      // 重置表单
      setTimeout(() => {
        setSelectedFile(null);
        setModelName('');
        setUploadProgress(0);
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      alert(error instanceof Error ? error.message : '上传失败，请重试');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('voiceClone')}</h1>
          <p className="text-xl text-gray-600">
            上传您的音频样本，创建专属的AI声音模型
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 上传区域 */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">{t('createVoiceModel')}</h2>
                
                {/* 文件上传 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('uploadAudioFile')} <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept=".mp3,.wav,.m4a,audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <RiUploadCloud2Line className="text-2xl text-blue-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        点击上传或拖拽文件至此处
                      </p>
                      <p className="text-sm text-gray-500">
                        支持 MP3、WAV、M4A 格式，时长10-90秒
                      </p>
                    </label>
                  </div>
                  
                  {selectedFile && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <RiFileMusicLine className="text-green-600 text-xl" />
                          <div>
                            <p className="font-medium text-green-900">{selectedFile.name}</p>
                            <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-green-600 hover:text-green-800 cursor-pointer"
                        >
                          <RiCloseLine className="text-xl" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 模型名称 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('modelName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="为您的声音模型起个名字..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">{modelName.length}/50</p>
                </div>

                {/* 上传进度 */}
                {isUploading && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">训练进度</span>
                      <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      正在分析音频特征并训练模型，请稍候...
                    </p>
                  </div>
                )}

                {/* 成功提示 */}
                {showSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <RiCheckLine className="text-green-600 text-xl" />
                      <div>
                        <p className="font-medium text-green-900">模型创建成功！</p>
                        <p className="text-sm text-green-600">您的声音模型&ldquo;{modelName}&rdquo;已成功创建并可用于语音合成</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex space-x-4">
                  <Button 
                    onClick={handleUpload}
                    disabled={!selectedFile || !modelName.trim() || isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <RiLoader4Line className="mr-2 animate-spin" />
                        创建中...
                      </>
                    ) : (
                      <>
                        <RiCpuLine className="mr-2" />
                        {t('createModel')}
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/system'}
                  >
                    <RiListCheck className="mr-2" />
                    查看模型
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏信息 */}
          <div className="flex flex-col h-full">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('uploadRequirements')}</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <RiCheckLine className="text-green-500 mt-0.5" />
                    <span>音频格式：MP3、WAV、M4A</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <RiCheckLine className="text-green-500 mt-0.5" />
                    <span>时长要求：10-90秒</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <RiCheckLine className="text-green-500 mt-0.5" />
                    <span>音质要求：清晰无杂音</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <RiCheckLine className="text-green-500 mt-0.5" />
                    <span>内容建议：正常语调朗读</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mt-auto">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('usageTips')}</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 选择清晰、自然的录音样本</li>
                  <li>• 避免背景噪音和回声</li>
                  <li>• 使用正常语速和音调</li>
                  <li>• 内容丰富有助于提高质量</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}