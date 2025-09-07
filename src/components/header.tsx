'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
// 使用 RemixIcon CSS 类而不是 React Icons 来完全匹配 Readdy 设计

export default function Header() {
  const { t, i18n } = useTranslation();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const currentLang = i18n.language === 'zh' ? '中' : 'EN';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-mic-line text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">VoiceClone</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">{t('home')}</Link>
            <Link href="/clone" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">{t('clone')}</Link>
            <Link href="/synthesis" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">{t('synthesis')}</Link>
            <Link href="/models" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">{t('models')}</Link>
            
            {/* 语言切换按钮 */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 border border-gray-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-global-line"></i>
                <span className="text-sm font-medium">{currentLang}</span>
                <i className={`ri-arrow-down-s-line transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => toggleLanguage('zh')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors cursor-pointer flex items-center ${
                      i18n.language === 'zh' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    <i className="ri-flag-2-line w-4 h-4 mr-2"></i>
                    {t('chinese')}
                  </button>
                  <button
                    onClick={() => toggleLanguage('en')}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors cursor-pointer flex items-center ${
                      i18n.language === 'en' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    <i className="ri-flag-line w-4 h-4 mr-2"></i>
                    {t('english')}
                  </button>
                </div>
              )}
            </div>
          </nav>
          
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-600 cursor-pointer">
              <i className="ri-menu-line text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}