'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatFileSize, formatDuration } from '@/lib/audio-format';

interface VoiceModel {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  fishModelId?: string;
  audioPath?: string;
  audioDuration?: number;
  audioSize?: number;
  usageCount?: number;
  lastUsedAt?: number;
}

export default function ModelsPage() {
  const { t } = useTranslation();
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<{id: string, title: string} | null>(null);
  const [playingModelId, setPlayingModelId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioAvailability, setAudioAvailability] = useState<Record<string, boolean>>({});

  // 检查音频文件可用性
  const checkAudioAvailability = useCallback(async (models: VoiceModel[]) => {
    const availability: Record<string, boolean> = {};
    
    for (const model of models) {
      if (model.status === 'ready' && model.audioPath) {
        try {
          const response = await fetch(`/api/models/audio/check/${model.id}`);
          const data = await response.json();
          availability[model.id] = data.available;
          
          // 如果是云环境且文件不可用，记录信息
          if (data.isCloudEnvironment && !data.available) {
            console.log(`Audio file not available for model ${model.id} in cloud environment`);
          }
        } catch (error) {
          console.error(`Failed to check audio availability for model ${model.id}:`, error);
          availability[model.id] = false;
        }
      } else {
        availability[model.id] = false;
      }
    }
    
    setAudioAvailability(availability);
  }, []);

  // 获取模型列表
  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/models');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Models data received:', data);
      
      if (data.success && Array.isArray(data.models)) {
        // 确保每个模型都有必需的字段
        const safeModels = data.models.map((model: VoiceModel) => ({
          id: model.id || '',
          title: model.title || '未命名模型',
          status: model.status || 'unknown',
          createdAt: model.createdAt || new Date().toISOString(),
          fishModelId: model.fishModelId || null,
          audioPath: model.audioPath || null,
          audioDuration: model.audioDuration || 0,
          audioSize: model.audioSize || 0,
          usageCount: model.usageCount || 0,
          lastUsedAt: model.lastUsedAt || null
        }));
        setModels(safeModels);
        
        // 检查音频文件可用性
        checkAudioAvailability(safeModels);
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      // 在出错时设置空数组而不是保持loading状态
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [checkAudioAvailability]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // 清理音频播放器
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setPlayingModelId(null);
      }
    };
  }, [currentAudio]);

  // 打开删除确认对话框
  const handleDeleteClick = (modelId: string, modelTitle: string) => {
    setModelToDelete({id: modelId, title: modelTitle});
    setDeleteDialogOpen(true);
  };

  // 确认删除模型
  const confirmDeleteModel = async () => {
    if (!modelToDelete) return;

    try {
      const response = await fetch(`/api/models/${modelToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除模型失败');
      }

      // 关闭删除对话框
      setDeleteDialogOpen(false);
      setModelToDelete(null);
      
      // 重新获取模型列表
      fetchModels();
      
      // 显示成功对话框
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Delete model failed:', error);
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    }
  };

  // 播放/停止原音频
  const handlePlayPause = async (modelId: string) => {
    try {
      // 如果正在播放同一个模型的音频，则停止播放
      if (playingModelId === modelId && currentAudio) {
        currentAudio.pause();
        setPlayingModelId(null);
        setCurrentAudio(null);
        return;
      }

      // 如果有其他音频正在播放，先停止
      if (currentAudio) {
        currentAudio.pause();
      }

      // 创建新的音频实例
      const audio = new Audio(`/api/models/audio/${modelId}`);
      
      // 设置音频事件监听器
      audio.onloadstart = () => {
        console.log('开始加载音频...');
      };
      
      audio.oncanplay = () => {
        console.log('音频可以开始播放');
      };
      
      audio.onended = () => {
        setPlayingModelId(null);
        setCurrentAudio(null);
      };
      
      audio.onerror = (e) => {
        console.error('音频播放失败:', e);
        alert('音频播放失败，请检查文件是否存在');
        setPlayingModelId(null);
        setCurrentAudio(null);
      };

      // 开始播放
      await audio.play();
      setPlayingModelId(modelId);
      setCurrentAudio(audio);

    } catch (error) {
      console.error('播放音频时出错:', error);
      alert('播放失败，请重试');
      setPlayingModelId(null);
      setCurrentAudio(null);
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <i className="ri-check-line text-green-500 text-lg"></i>;
      case 'creating':
        return <i className="ri-time-line text-yellow-500 text-lg"></i>;
      case 'failed':
        return <i className="ri-close-line text-red-500 text-lg"></i>;
      default:
        return <i className="ri-time-line text-gray-500 text-lg"></i>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return '已完成';
      case 'creating':
        return '训练中';
      case 'failed':
        return '训练失败';
      default:
        return '未知状态';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('models')}</h1>
          <p className="text-xl text-gray-600">
            管理您的AI声音模型，查看训练状态和使用情况
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <i className="ri-cpu-line mr-3 text-blue-600"></i>
                我的声音模型
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {models.length} 个模型
              </span>
            </div>
            <Button onClick={() => window.location.href = '/clone'}>
              <i className="ri-add-line mr-2"></i>
              创建新模型
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">加载中...</p>
          </div>
        ) : models.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <i className="ri-cpu-line mx-auto text-6xl text-gray-400 mb-6"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">还没有创建任何声音模型</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                开始创建您的第一个AI声音模型，体验个性化的语音合成技术
              </p>
              <Button onClick={() => window.location.href = '/clone'}>
                <i className="ri-add-line mr-2"></i>
                创建第一个模型
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 桌面端表格视图 */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                {/* 表格头部 */}
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-gray-700">
                    <div className="col-span-3">模型信息</div>
                    <div className="col-span-2">状态</div>
                    <div className="col-span-2">创建时间</div>
                    <div className="col-span-3">使用情况</div>
                    <div className="col-span-2">操作</div>
                  </div>
                </div>
                
                {/* 表格内容 */}
                <div className="divide-y divide-gray-200">
                  {models.map((model) => (
                    <div key={model.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    {/* 模型信息 */}
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-mic-line text-blue-600 text-lg"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 break-words leading-5 mb-1">{model.title}</h3>
                          <p className="text-sm text-gray-500">
                            时长: {model.audioDuration ? formatDuration(model.audioDuration) : '未知'} | 大小: {model.audioSize ? formatFileSize(model.audioSize) : '未知'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* 状态 */}
                    <div className="col-span-2 flex items-center space-x-2">
                      {getStatusIcon(model.status)}
                      <span className="text-sm font-medium text-gray-900">
                        {getStatusText(model.status)}
                      </span>
                    </div>
                    
                    {/* 创建时间 */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-gray-900">
                        {(() => {
                          try {
                            return new Date(model.createdAt).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit', 
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          } catch {
                            return '时间未知';
                          }
                        })()}
                      </span>
                    </div>
                    
                    {/* 使用情况 */}
                    <div className="col-span-3 flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {model.usageCount} 次使用
                        </div>
                        <div className="text-xs text-gray-500">
                          最后使用: {(() => {
                            try {
                              const lastUsed = model.lastUsedAt ? model.lastUsedAt * 1000 : model.createdAt;
                              return new Date(lastUsed).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit', 
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                            } catch {
                              return '从未使用';
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    {/* 操作 */}
                    <div className="col-span-2 flex items-center space-x-2">
                      {model.status === 'ready' && model.audioPath && audioAvailability[model.id] && (
                        <Button
                          variant="ghost"
                          size="default"
                          onClick={() => handlePlayPause(model.id)}
                          className={`w-10 h-10 p-0 ${
                            playingModelId === model.id 
                              ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                              : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                          }`}
                          title="播放/停止原音频"
                        >
                          <i className={`text-lg ${
                            playingModelId === model.id 
                              ? 'ri-pause-line' 
                              : 'ri-play-line'
                          }`}></i>
                        </Button>
                      )}
                      {model.status === 'ready' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/synthesis?modelId=${model.id}`}
                          className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                        >
                          使用
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(model.id, model.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            </Card>

            {/* 移动端卡片视图 */}
            <div className="md:hidden space-y-4">
              {models.map((model) => (
                <Card key={model.id}>
                  <CardContent className="p-4">
                    {/* 模型标题和状态行 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-mic-line text-blue-600 text-xl"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base leading-5 mb-1 break-words">
                            {model.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(model.status)}
                            <span className="text-sm font-medium text-gray-700">
                              {getStatusText(model.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 音频信息 */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">时长:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {model.audioDuration ? formatDuration(model.audioDuration) : '未知'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">大小:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {model.audioSize ? formatFileSize(model.audioSize) : '未知'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 创建时间和使用情况 */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <i className="ri-time-line text-gray-400 mr-2"></i>
                        <span className="text-gray-600">创建于:</span>
                        <span className="ml-2 text-gray-900">
                          {(() => {
                            try {
                              return new Date(model.createdAt).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                            } catch {
                              return '时间未知';
                            }
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="ri-bar-chart-line text-gray-400 mr-2"></i>
                        <span className="text-gray-600">已使用:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {model.usageCount || 0} 次
                        </span>
                        {model.lastUsedAt && (
                          <>
                            <span className="text-gray-400 mx-2">•</span>
                            <span className="text-gray-600">
                              {(() => {
                                try {
                                  const lastUsed = model.lastUsedAt * 1000;
                                  return new Date(lastUsed).toLocaleString('zh-CN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                } catch {
                                  return '从未使用';
                                }
                              })()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {model.status === 'ready' && model.audioPath && audioAvailability[model.id] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlayPause(model.id)}
                            className={`${
                              playingModelId === model.id 
                                ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                                : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                            title="播放/停止原音频"
                          >
                            <i className={`text-lg ${
                              playingModelId === model.id 
                                ? 'ri-pause-line' 
                                : 'ri-play-line'
                            }`}></i>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(model.id, model.title)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </Button>
                      </div>
                      {model.status === 'ready' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => window.location.href = `/synthesis?modelId=${model.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                        >
                          <i className="ri-volume-up-line mr-2"></i>
                          使用
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* 统计信息 */}
        {models.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {models.filter(m => m.status === 'ready').length}
                </div>
                <p className="text-sm text-gray-600">可用模型</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {models.filter(m => m.status === 'creating').length}
                </div>
                <p className="text-sm text-gray-600">训练中</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {models.length}
                </div>
                <p className="text-sm text-gray-600">总模型数</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {models.reduce((total, model) => total + (model.usageCount || 0), 0)}
                </div>
                <p className="text-sm text-gray-600">总使用次数</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除模型 &ldquo;{modelToDelete?.title}&rdquo; 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDeleteModel}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除成功对话框 */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>删除成功</DialogTitle>
            <DialogDescription>
              模型已成功删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessDialogOpen(false)}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}