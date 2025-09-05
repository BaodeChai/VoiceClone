import { Session, TTSRequest } from 'fish-audio-sdk';

// 获取 API Key 的函数
function getFishApiKey() {
  const key = process.env.FISH_AUDIO_API_KEY;
  if (!key) {
    throw new Error('FISH_AUDIO_API_KEY environment variable is required');
  }
  return key;
}

// 创建 Fish Audio 会话 (延迟初始化)
function createFishSession() {
  return new Session(getFishApiKey());
}

// 创建声音模型
export async function createFishModel(
  title: string,
  description: string,
  audioBuffer: Buffer
) {
  try {
    const session = createFishSession();
    const voices = [audioBuffer];
    
    const model = await session.createModel({
      title,
      description,
      voices,
      coverImage: undefined
    });
    
    return model;
  } catch (error) {
    console.error('Fish Audio model creation failed:', error);
    throw error;
  }
}

// 文本转语音
export async function generateTTS(
  text: string,
  referenceId: string,
  format: 'mp3' | 'wav' | 'opus' = 'mp3'
): Promise<Buffer> {
  try {
    const session = createFishSession();
    const chunks: Buffer[] = [];
    
    // 根据类型定义创建 TTSRequest  
    const ttsRequest = new TTSRequest(text, {
      referenceId: referenceId,
      format: format,
      normalize: true
    });
    
    for await (const chunk of session.tts(ttsRequest)) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Fish Audio TTS generation failed:', error);
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