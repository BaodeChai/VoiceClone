import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
        }}
      >
        {/* 麦克风图标 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 麦克风主体 */}
            <rect x="9" y="2" width="6" height="11" rx="3" fill="white"/>
            {/* 麦克风支架 */}
            <path d="M12 18v3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            {/* 底座 */}
            <path d="M8 21h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            {/* 声音检测弧线 */}
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}