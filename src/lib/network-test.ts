// 网络连接测试工具
import { getFishModels } from './fish-audio';

export interface NetworkTestResult {
  success: boolean;
  message: string;
  details?: string;
}

// 测试与 Fish Audio API 的连接
export async function testFishAudioConnection(): Promise<NetworkTestResult> {
  try {
    console.log('开始测试Fish Audio API连接...');
    
    // 尝试获取模型列表 (最简单的API调用)
    const models = await getFishModels();
    
    return {
      success: true,
      message: '成功连接到Fish Audio API',
      details: `获取到 ${models?.items?.length || 0} 个模型`
    };
  } catch (error) {
    console.error('Fish Audio连接测试失败:', error);
    
    if (error && typeof error === 'object') {
      const err = error as { code?: string; cause?: { code?: string }; status?: number };
      
      if (err.code === 'ETIMEDOUT' || err.cause?.code === 'ETIMEDOUT') {
        return {
          success: false,
          message: '网络连接超时',
          details: '无法连接到Fish Audio服务器，请检查网络连接或稍后重试'
        };
      } else if (err.code === 'ECONNREFUSED') {
        return {
          success: false,
          message: '连接被拒绝',
          details: 'Fish Audio服务器拒绝连接，可能是网络限制或服务器维护'
        };
      } else if (err.status === 401) {
        return {
          success: false,
          message: 'API密钥无效',
          details: '请检查FISH_AUDIO_API_KEY环境变量是否设置正确'
        };
      } else if (err.status === 402) {
        return {
          success: false,
          message: '账户余额不足',
          details: '请检查Fish Audio账户余额'
        };
      }
    }
    
    return {
      success: false,
      message: '连接测试失败',
      details: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 测试基础网络连通性
export async function testBasicConnectivity(): Promise<NetworkTestResult> {
  try {
    // 测试是否能连接到一个公共服务
    const response = await fetch('https://httpbin.org/status/200', {
      signal: AbortSignal.timeout(5000) // 5秒超时
    });
    
    if (response.ok) {
      return {
        success: true,
        message: '基础网络连接正常'
      };
    } else {
      return {
        success: false,
        message: '基础网络连接异常',
        details: `HTTP状态码: ${response.status}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: '无法进行网络连接',
      details: error instanceof Error ? error.message : '网络连接失败'
    };
  }
}