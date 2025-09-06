import { NextResponse } from 'next/server';
import { testFishAudioConnection, testBasicConnectivity } from '@/lib/network-test';

export async function GET() {
  try {
    console.log('开始网络诊断...');
    
    // 并行测试基础连接和Fish Audio连接
    const [basicTest, fishTest] = await Promise.all([
      testBasicConnectivity(),
      testFishAudioConnection()
    ]);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        basicConnectivity: basicTest,
        fishAudioConnection: fishTest
      },
      summary: {
        allPassed: basicTest.success && fishTest.success,
        criticalIssues: !fishTest.success ? ['Fish Audio API连接失败'] : []
      }
    });
    
  } catch (error) {
    console.error('Network diagnostic failed:', error);
    
    return NextResponse.json(
      { 
        error: '网络诊断失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}