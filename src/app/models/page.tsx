'use client';

import { useState, useEffect } from 'react';
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

interface DebugLocalModel {
  localId: string;
  title: string;
  fishModelId: string;
  status: string;
}

interface DebugFishModel {
  fishId: string;
  title: string;
  description: string;
  created_at: string;
}

interface DebugConsistency {
  orphanedLocalModels: DebugLocalModel[];
  orphanedFishModels: DebugFishModel[];
}

interface LocalModelInfo {
  id: string;
  title: string;
  fishModelId: string | null;
  status: string;
}

interface FishModelInfo {
  id: string;
  title: string;
  status: string;
}

interface DebugResult {
  localModelsCount: number;
  fishModelsCount: number;
  localModels: LocalModelInfo[];
  fishModels: FishModelInfo[];
  consistency: DebugConsistency;
}

export default function ModelsPage() {
  const { t } = useTranslation();
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<{id: string, title: string} | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);


  // 获取模型列表
  const fetchModels = async () => {
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
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Fish Audio调试功能
  const handleFishAudioDebug = async () => {
    try {
      setDebugLoading(true);
      const response = await fetch('/api/debug/fish-models');
      const data = await response.json();
      
      if (data.success) {
        setDebugResult(data.analysis);
        setDebugDialogOpen(true);
      } else {
        alert(`调试失败: ${data.error}`);
      }
    } catch (error) {
      console.error('Debug request failed:', error);
      alert('调试请求失败，请检查网络连接');
    } finally {
      setDebugLoading(false);
    }
  };


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
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleFishAudioDebug}
                disabled={debugLoading}
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                <i className={`mr-2 ${debugLoading ? 'ri-loader-4-line animate-spin' : 'ri-bug-line'}`}></i>
                {debugLoading ? '调试中...' : 'Fish Audio调试'}
              </Button>
              <Button onClick={() => window.location.href = '/clone'}>
                <i className="ri-add-line mr-2"></i>
                创建新模型
              </Button>
            </div>
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
                      <div className="text-sm font-medium text-gray-900">
                        {model.usageCount} 次使用
                      </div>
                    </div>
                    
                    {/* 操作 */}
                    <div className="col-span-2 flex items-center space-x-2">
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
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
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

      {/* Fish Audio调试结果对话框 */}
      <Dialog open={debugDialogOpen} onOpenChange={setDebugDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <i className="ri-bug-line mr-2 text-purple-600"></i>
              Fish Audio 模型调试信息
            </DialogTitle>
            <DialogDescription>
              本地数据库与Fish Audio云端模型的同步状态分析
            </DialogDescription>
          </DialogHeader>
          
          {debugResult && (
            <div className="space-y-6">
              {/* 统计概览 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">本地数据库</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {debugResult.localModelsCount} 个模型
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Fish Audio云端</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {debugResult.fishModelsCount} 个模型
                  </div>
                </div>
              </div>

              {/* 数据一致性检查 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <i className="ri-shield-check-line mr-2"></i>
                  数据一致性检查
                </h3>
                
                {debugResult.consistency.orphanedLocalModels.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h4 className="font-medium text-yellow-800 mb-2">
                      ⚠️ 孤儿本地模型 ({debugResult.consistency.orphanedLocalModels.length}个)
                    </h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      这些模型在本地数据库中存在，但Fish Audio云端已不存在：
                    </p>
                    <div className="space-y-1">
                      {debugResult.consistency.orphanedLocalModels.map((model, index: number) => (
                        <div key={index} className="text-sm bg-white p-2 rounded border">
                          <span className="font-medium">{model.title}</span> 
                          <span className="text-gray-500 ml-2">(ID: {model.fishModelId})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {debugResult.consistency.orphanedFishModels.length > 0 && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
                    <h4 className="font-medium text-orange-800 mb-2">
                      🔄 孤儿Fish模型 ({debugResult.consistency.orphanedFishModels.length}个)
                    </h4>
                    <p className="text-sm text-orange-700 mb-2">
                      这些模型在Fish Audio云端存在，但本地数据库中没有记录：
                    </p>
                    <div className="space-y-1">
                      {debugResult.consistency.orphanedFishModels.map((model, index: number) => (
                        <div key={index} className="text-sm bg-white p-2 rounded border">
                          <span className="font-medium">{model.title || '未命名'}</span>
                          <span className="text-gray-500 ml-2">(ID: {model.fishId})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {debugResult.consistency.orphanedLocalModels.length === 0 && 
                 debugResult.consistency.orphanedFishModels.length === 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-700 flex items-center">
                      <i className="ri-check-line mr-2"></i>
                      数据一致性良好，本地和云端模型完全同步
                    </p>
                  </div>
                )}
              </div>

              {/* 详细模型列表 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">详细模型信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 本地模型 */}
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">本地数据库模型</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {debugResult.localModels.map((model, index: number) => (
                        <div key={index} className="text-sm p-2 bg-blue-50 rounded">
                          <div className="font-medium">{model.title}</div>
                          <div className="text-gray-600 text-xs">
                            Fish ID: {model.fishModelId || '无'} | 状态: {model.status}
                          </div>
                        </div>
                      ))}
                      {debugResult.localModels.length === 0 && (
                        <div className="text-gray-500 text-sm italic">无本地模型</div>
                      )}
                    </div>
                  </div>

                  {/* Fish Audio模型 */}
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">Fish Audio云端模型</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {debugResult.fishModels.map((model, index: number) => (
                        <div key={index} className="text-sm p-2 bg-green-50 rounded">
                          <div className="font-medium">{model.title || '未命名'}</div>
                          <div className="text-gray-600 text-xs">
                            ID: {model.id} | 状态: {model.status || '未知'}
                          </div>
                        </div>
                      ))}
                      {debugResult.fishModels.length === 0 && (
                        <div className="text-gray-500 text-sm italic">无云端模型</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDebugDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}