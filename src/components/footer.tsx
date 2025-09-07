import { RiMicLine, RiTwitterFill, RiGithubFill, RiMailLine } from 'react-icons/ri';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <RiMicLine className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VoiceClone</span>
            </div>
            <p className="text-gray-600 mb-4">
              基于先进AI技术的声音克隆平台，让每个人都能拥有专属的数字声音。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
                <RiTwitterFill className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
                <RiGithubFill className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer">
                <RiMailLine className="text-xl" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">功能</h3>
            <ul className="space-y-2">
              <li><Link href="/clone" className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">声音克隆</Link></li>
              <li><Link href="/synthesis" className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">语音合成</Link></li>
              <li><Link href="/system" className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">模型管理</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">支持</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">使用文档</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">常见问题</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">联系我们</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8 mt-8">
          <p className="text-center text-gray-500">
            © 2025 VoiceClone. 版权所有 | 基于先进的AI技术构建
          </p>
        </div>
      </div>
    </footer>
  );
}