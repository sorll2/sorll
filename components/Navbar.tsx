
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Film, User as UserIcon, LogOut, Menu, X } from 'lucide-react';

/**
 * 顶部导航栏组件
 * 包含 Logo、菜单链接、用户状态显示及移动端适配
 */
export const Navbar: React.FC = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 控制移动端菜单显示
  const [isProfileOpen, setIsProfileOpen] = useState(false); // 控制用户下拉菜单

  /**
   * 退出登录：清空 Context 状态并重定向回首页
   */
  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: '首页', path: '/' },
    { name: '电影资讯', path: '/news' },
    { name: '分类浏览', path: '/category' },
    { name: '联系我们', path: '/contact' },
  ];

  return (
    <nav className="bg-black/95 backdrop-blur-md fixed w-full z-50 border-b border-gray-900 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo 区 */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <Film className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
              <span className="font-bold text-xl tracking-wider text-white">CINEMA<span className="text-primary">SCOPE</span></span>
            </Link>
            {/* 桌面端导航链接 */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="relative text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors group"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧用户状态区 */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="relative ml-3">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition"
                  >
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={user.avatar || "https://ui-avatars.com/api/?name=" + user.username}
                      alt=""
                    />
                    <span className="ml-2 pr-3 text-gray-200 font-medium">{user.username}</span>
                  </button>
                  {isProfileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in-down">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        当前： <strong>{user.username}</strong>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut size={14} /> 退出登录
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-x-2">
                  <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">登录</Link>
                  <Link to="/register" className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">注册</Link>
                </div>
              )}
            </div>
          </div>
          
          {/* 移动端菜单按钮 */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端下拉菜单内容 */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                {link.name}
              </Link>
            ))}
            {!user ? (
              <div className="mt-4 flex flex-col space-y-2 px-3">
                 <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center w-full block border border-gray-600 text-white py-2 rounded">登录</Link>
                 <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-center w-full block bg-primary text-white py-2 rounded">注册</Link>
              </div>
            ) : (
               <button onClick={handleLogout} className="text-left text-red-400 hover:text-red-300 block px-3 py-2 rounded-md text-base font-medium w-full">
                 退出登录 ({user.username})
               </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};