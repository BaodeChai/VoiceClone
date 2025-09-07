import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 语言资源
const resources = {
  zh: {
    translation: {
      home: '首页',
      clone: '声音克隆',
      synthesis: '语音合成',
      models: '模型管理',
      system: '系统状态',
      language: '语言',
      chinese: '中文',
      english: 'English',
      // 声音克隆页面
      voiceClone: '声音克隆',
      createVoiceModel: '创建声音模型',
      uploadAudioFile: '上传音频文件',
      modelName: '模型名称',
      createModel: '创建模型',
      uploadRequirements: '上传要求',
      trainingTime: '训练时间',
      usageTips: '使用提示',
      // 语音合成页面
      voiceSynthesis: '语音合成',
      selectVoiceModel: '选择声音模型',
      inputText: '输入文本内容',
      generateSpeech: '生成语音',
      generatedAudio: '生成的语音',
      download: '下载',
      reset: '重置'
    }
  },
  en: {
    translation: {
      home: 'Home',
      clone: 'Voice Clone',
      synthesis: 'Speech Synthesis',
      models: 'Model Management',
      system: 'System Status',
      language: 'Language',
      chinese: '中文',
      english: 'English',
      // 声音克隆页面
      voiceClone: 'Voice Clone',
      createVoiceModel: 'Create Voice Model',
      uploadAudioFile: 'Upload Audio File',
      modelName: 'Model Name',
      createModel: 'Create Model',
      uploadRequirements: 'Upload Requirements',
      trainingTime: 'Training Time',
      usageTips: 'Usage Tips',
      // 语音合成页面
      voiceSynthesis: 'Speech Synthesis',
      selectVoiceModel: 'Select Voice Model',
      inputText: 'Input Text Content',
      generateSpeech: 'Generate Speech',
      generatedAudio: 'Generated Audio',
      download: 'Download',
      reset: 'Reset'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'zh',
    fallbackLng: 'zh',
    debug: false,
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;