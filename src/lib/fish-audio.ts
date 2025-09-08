import { Session, TTSRequest, ModelEntity } from 'fish-audio-sdk';

// 获取 API Key 的函数
function getFishApiKey() {
  const key = process.env.FISH_AUDIO_API_KEY;
  if (!key) {
    throw new Error('FISH_AUDIO_API_KEY environment variable is required');
  }
  return key;
}

// 创建 Fish Audio 会话 (延迟初始化，添加超时配置)
function createFishSession() {
  const session = new Session(getFishApiKey());
  
  // 注意：Fish Audio SDK 目前不支持直接设置超时
  // 如果需要，可以在外层包装 Promise.race 来实现超时
  return session;
}

// 创建声音模型 (带超时机制)
export async function createFishModel(
  title: string,
  description: string,
  audioBuffer: Buffer
): Promise<ModelEntity> {
  try {
    const session = createFishSession();
    
    // 添加 30秒 超时机制
    const createModelPromise = session.createModel({
      title,
      description,
      voices: [audioBuffer],  // voices 数组
      coverImage: undefined   // coverImage 可选
    });
    
    const timeoutPromise = new Promise<ModelEntity>((_, reject) => {
      setTimeout(() => {
        reject(new Error('创建模型请求超时 (30秒)，请检查网络连接或稍后重试'));
      }, 30000);
    });
    
    const model = await Promise.race([createModelPromise, timeoutPromise]);
    return model;
  } catch (error) {
    console.error('Fish Audio model creation failed:', error);
    
    // 提供更友好的错误信息
    if (error && typeof error === 'object') {
      const err = error as { code?: string; cause?: { code?: string }; status?: number };
      if (err.code === 'ETIMEDOUT' || err.cause?.code === 'ETIMEDOUT') {
        throw new Error('网络连接超时，请检查网络连接后重试');
      } else if (err.code === 'ECONNREFUSED') {
        throw new Error('无法连接到Fish Audio服务器，请稍后重试');
      } else if (err.status === 401) {
        throw new Error('Fish Audio API密钥无效，请检查配置');
      } else if (err.status === 402) {
        throw new Error('Fish Audio账户余额不足');
      } else if (err.status === 429) {
        throw new Error('请求过于频繁，请稍后重试');
      }
    }
    
    throw error;
  }
}

// 文本转语音 (带超时机制)
export async function generateTTS(
  text: string,
  referenceId: string,
  format: 'mp3' | 'wav' | 'opus' = 'mp3'
): Promise<Buffer> {
  try {
    const session = createFishSession();
    const chunks: Buffer[] = [];
    
    // 创建 TTSRequest - 第一个参数是text，第二个参数是options
    const ttsRequest = new TTSRequest(text, {
      referenceId: referenceId,
      format: format,
      normalize: true
    });
    
    // 添加 60秒 超时机制 (TTS可能需要更长时间)
    const ttsPromise = (async () => {
      for await (const chunk of session.tts(ttsRequest)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    })();
    
    const timeoutPromise = new Promise<Buffer>((_, reject) => {
      setTimeout(() => {
        reject(new Error('语音生成请求超时 (60秒)，请检查网络连接或稍后重试'));
      }, 60000);
    });
    
    return await Promise.race([ttsPromise, timeoutPromise]);
  } catch (error) {
    console.error('Fish Audio TTS generation failed:', error);
    
    // 提供更友好的错误信息
    if (error && typeof error === 'object') {
      const err = error as { code?: string; cause?: { code?: string }; status?: number };
      if (err.code === 'ETIMEDOUT' || err.cause?.code === 'ETIMEDOUT') {
        throw new Error('网络连接超时，请检查网络连接后重试');
      } else if (err.code === 'ECONNREFUSED') {
        throw new Error('无法连接到Fish Audio服务器，请稍后重试');
      } else if (err.status === 401) {
        throw new Error('Fish Audio API密钥无效，请检查配置');
      } else if (err.status === 402) {
        throw new Error('Fish Audio账户余额不足');
      } else if (err.status === 404) {
        throw new Error('指定的声音模型不存在');
      } else if (err.status === 429) {
        throw new Error('请求过于频繁，请稍后重试');
      }
    }
    
    throw error;
  }
}

// 获取模型列表
export async function getFishModels() {
  try {
    const session = createFishSession();
    return await session.listModels();
  } catch (error) {
    console.error('Failed to fetch Fish Audio models:', error);
    throw error;
  }
}

// 删除Fish Audio云端模型
export async function deleteFishModel(modelId: string): Promise<void> {
  try {
    const session = createFishSession();
    
    // 添加 30秒 超时机制
    const deleteModelPromise = session.deleteModel(modelId);
    
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error('删除模型请求超时 (30秒)，请检查网络连接或稍后重试'));
      }, 30000);
    });
    
    await Promise.race([deleteModelPromise, timeoutPromise]);
    console.log(`Successfully deleted Fish Audio model: ${modelId}`);
  } catch (error) {
    console.error('Failed to delete Fish Audio model:', error);
    
    // 提供更友好的错误信息
    if (error && typeof error === 'object') {
      const err = error as { code?: string; cause?: { code?: string }; status?: number };
      if (err.code === 'ETIMEDOUT' || err.cause?.code === 'ETIMEDOUT') {
        throw new Error('网络连接超时，请检查网络连接后重试');
      } else if (err.code === 'ECONNREFUSED') {
        throw new Error('无法连接到Fish Audio服务器，请稍后重试');
      } else if (err.status === 401) {
        throw new Error('Fish Audio API密钥无效，请检查配置');
      } else if (err.status === 404) {
        throw new Error('指定的声音模型不存在或已被删除');
      } else if (err.status === 429) {
        throw new Error('请求过于频繁，请稍后重试');
      }
    }
    
    throw error;
  }
}

// 调试功能：获取Fish Audio账户下的所有模型
export async function debugFishModels() {
  try {
    const session = createFishSession();
    const models = await session.listModels();
    
    console.log('=== Fish Audio Models Debug Info ===');
    console.log(`Total models found: ${models.length}`);
    
    if (models.length === 0) {
      console.log('No models found in Fish Audio account');
    } else {
      models.forEach((model, index) => {
        console.log(`Model ${index + 1}:`, {
          id: model.id,
          title: model.title || 'No title',
          description: model.description || 'No description',
          created_at: model.created_at || 'Unknown',
          status: model.status || 'Unknown'
        });
      });
    }
    
    return {
      success: true,
      models: models,
      count: models.length
    };
  } catch (error) {
    console.error('Failed to debug Fish Audio models:', error);
    
    // 提供详细的错误信息用于调试
    if (error && typeof error === 'object') {
      const err = error as { code?: string; status?: number; message?: string };
      console.error('Debug error details:', {
        code: err.code,
        status: err.status,
        message: err.message
      });
    }
    
    throw error;
  }
}