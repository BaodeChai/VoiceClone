'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatFileSize, formatDuration } from '@/lib/audio-format';
import { RiCpuLine, RiDeleteBinLine, RiAddLine, RiCheckLine, RiTimeLine, RiCloseLine } from 'react-icons/ri';

interface VoiceModel {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  fishModelId?: string;
  audioDuration?: number;
  audioSize?: number;
  usageCount?: number;
  lastUsedAt?: number;
}

export default function SystemPage() {
  const { t } = useTranslation();
  const [models, setModels] = useState<VoiceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<{id: string, title: string} | null>(null);

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
      // 这里也可以添加一个错误对话框，但为了简单起见，我们先用console.error
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <RiCheckLine className="text-green-500" />;
      case 'creating':
        return <RiTimeLine className="text-yellow-500" />;
      case 'failed':
        return <RiCloseLine className="text-red-500" />;
      default:
        return <RiTimeLine className="text-gray-500" />;
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('models')}</h1>
          <p className="text-xl text-gray-600">
            管理您的AI声音模型，查看训练状态和使用情况
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <RiCpuLine className="mr-3 text-blue-600" />
                我的声音模型
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {models.length} 个模型
              </span>
            </div>
            <Button onClick={() => window.location.href = '/clone'}>
              <RiAddLine className="mr-2" />
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
              <RiCpuLine className="mx-auto text-6xl text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">还没有创建任何声音模型</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                开始创建您的第一个AI声音模型，体验个性化的语音合成技术
              </p>
              <Button onClick={() => window.location.href = '/clone'}>
                <RiAddLine className="mr-2" />
                创建第一个模型
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
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
                          <RiCpuLine className="text-blue-600 text-lg" />
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
                          {model.usageCount || 0} 次使用
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
                        <RiDeleteBinLine />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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