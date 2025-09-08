import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/i18n-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VoiceClone-最自然的AI语言克隆",
    template: "%s | VoiceClone"
  },
  description: "使用先进的 AI 技术，轻松创建高质量的声音模型，实现自然流畅的语音合成。支持声音克隆和文本转语音功能。",
  keywords: ["AI语音", "声音克隆", "文本转语音", "TTS", "AI", "语音合成", "人工智能"],
  authors: [{ name: "VoiceClone Team" }],
  creator: "VoiceClone",
  publisher: "VoiceClone",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://voice-clone.app",
    title: "VoiceClone - 最自然的 AI 语音克隆",
    description: "使用先进的 AI 技术，轻松创建高质量的声音模型，实现自然流畅的语音合成",
    siteName: "VoiceClone",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VoiceClone - AI语音克隆平台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoiceClone - 最自然的 AI 语音克隆",
    description: "使用先进的 AI 技术，轻松创建高质量的声音模型",
    images: ["/og-image.png"],
  },
  // icons 配置被 app/icon.tsx 自动处理
  manifest: "/site.webmanifest",
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <I18nProvider>
          <div id="root" className="relative">
            {children}
          </div>
        </I18nProvider>
        
        {/* 背景装饰元素 */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* 渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          {/* 动态光斑 */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
          
          {/* 网格图案 */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      </body>
    </html>
  );
}
