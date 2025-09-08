import { NextRequest, NextResponse } from 'next/server';

// 直接传递文件数据而不存储到磁盘的上传方案
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // 验证文件类型和大小
    const supportedTypes = [
      // MP3 格式
      'audio/mpeg', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3',
      // WAV 格式
      'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/x-pn-wav',
      // FLAC 格式
      'audio/flac', 'audio/x-flac',
      // M4A/MP4 格式 (包括 AAC)
      'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/x-aac',
      // OGG 格式
      'audio/ogg', 'audio/x-ogg', 'audio/ogg; codecs=vorbis',
      // WebM 格式
      'audio/webm'
    ];

    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `不支持的文件格式: ${file.type}` },
        { status: 400 }
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大支持: 50MB` },
        { status: 400 }
      );
    }

    // 将文件转换为 Base64 或直接传递 ArrayBuffer
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    return NextResponse.json({
      success: true,
      fileData: base64,
      originalName: file.name,
      size: file.size,
      type: file.type,
      duration: null // 将在创建模型时计算
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Upload failed'
      },
      { status: 500 }
    );
  }
}