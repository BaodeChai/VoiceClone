import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fish Audio Clone - 最自然的 AI 语音克隆",
    template: "%s | Fish Audio Clone"
  },
  description: "使用先进的 Fish Audio 技术，轻松创建高质量的声音模型，实现自然流畅的语音合成。支持声音克隆和文本转语音功能。",
  keywords: ["AI语音", "声音克隆", "文本转语音", "TTS", "Fish Audio", "语音合成", "人工智能"],
  authors: [{ name: "Fish Audio Clone Team" }],
  creator: "Fish Audio Clone",
  publisher: "Fish Audio Clone",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://voice-clone.app",
    title: "Fish Audio Clone - 最自然的 AI 语音克隆",
    description: "使用先进的 Fish Audio 技术，轻松创建高质量的声音模型，实现自然流畅的语音合成",
    siteName: "Fish Audio Clone",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fish Audio Clone - AI语音克隆平台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fish Audio Clone - 最自然的 AI 语音克隆",
    description: "使用先进的 Fish Audio 技术，轻松创建高质量的声音模型",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#3b82f6",
      },
    ],
  },
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
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div id="root" className="relative">
          {children}
        </div>
        
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
