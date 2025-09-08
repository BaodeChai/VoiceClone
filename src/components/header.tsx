'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
// 使用 RemixIcon CSS 类而不是 React Icons 来完全匹配 Readdy 设计

export default function Header() {
  const { t, i18n } = useTranslation();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const currentLang = i18n.language === 'zh' ? '中' : 'EN';

  // 点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header ref={headerRef} className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-600 cursor-pointer p-2"
            >
              <i className={`text-xl transition-transform ${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <i className="ri-home-line text-lg"></i>
                  <span>{t('home')}</span>
                </div>
              </Link>
              
              <Link 
                href="/clone" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <i className="ri-mic-line text-lg"></i>
                  <span>{t('clone')}</span>
                </div>
              </Link>
              
              <Link 
                href="/synthesis" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <i className="ri-volume-up-line text-lg"></i>
                  <span>{t('synthesis')}</span>
                </div>
              </Link>
              
              <Link 
                href="/models" 
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <i className="ri-cpu-line text-lg"></i>
                  <span>{t('models')}</span>
                </div>
              </Link>

              {/* 移动端语言切换 */}
              <div className="pt-3 border-t border-gray-100">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-500 mb-2">语言 / Language</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        toggleLanguage('zh');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        i18n.language === 'zh' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <i className="ri-flag-2-line text-lg mr-3"></i>
                      {t('chinese')}
                    </button>
                    <button
                      onClick={() => {
                        toggleLanguage('en');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 text-left text-sm rounded-md transition-colors ${
                        i18n.language === 'en' 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <i className="ri-flag-line text-lg mr-3"></i>
                      {t('english')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}