
import React, { useState } from 'react';
import { useApp } from '../App';
import { Trash2, ShieldAlert, CheckCircle, Activity, Search, RefreshCw } from 'lucide-react';

/**
 * 管理员后台界面
 * 功能涵盖：
 * 1. 管理员登录验证
 * 2. 全站电影海报资源存活检测（实时并发扫描）
 * 3. 评论内容违规删除管理
 */
export const Admin: React.FC = () => {
  const { user, login, comments, deleteComment, movies } = useApp();
  const [password, setPassword] = useState('');
  const [scanning, setScanning] = useState(false); // 扫描状态锁
  const [scanResults, setScanResults] = useState<Record<string, 'ok' | 'error' | 'testing'>>({});

  /**
   * 管理员身份模拟验证
   */
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
       login({ id: '0', username: '超级管理员', role: 'admin', avatar: '' });
    } else {
      alert('管理员密码错误');
    }
  };

  /**
   * 核心功能：全站海报健康检查
   * 采用浏览器原生 Image 对象探测网络连通性
   */
  const runHealthCheck = async () => {
    setScanning(true);
    const results: Record<string, 'ok' | 'error' | 'testing'> = {};
    
    for (const movie of movies) {
      setScanResults(prev => ({ ...prev, [movie.id]: 'testing' }));
      try {
        const isOk = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = movie.coverUrl;
          setTimeout(() => resolve(false), 5000); // 5秒超时
        });
        results[movie.id] = isOk ? 'ok' : 'error';
      } catch {
        results[movie.id] = 'error';
      }
      // 实时步进更新 UI
      setScanResults(prev => ({ ...prev, [movie.id]: results[movie.id] }));
    }
    setScanning(false);
  };

  // 权限守卫：非管理员显示登录
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-black">
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-96 border border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-center text-white">后台管理入口</h2>
          <form onSubmit={handleAdminLogin}>
            <input
              type="password"
              placeholder="输入管理员密码 (admin123)"
              className="w-full bg-black border border-gray-700 rounded p-3 mb-4 text-white focus:border-primary outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-primary hover:bg-red-700 text-white py-3 rounded-lg font-bold">
              进入后台
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
           <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Activity className="text-primary" /> 管理员仪表盘
           </h1>
           <button 
              onClick={runHealthCheck}
              disabled={scanning}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition ${
                scanning ? 'bg-gray-800 text-gray-500' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
           >
              {scanning ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
              {scanning ? '正在检测资源...' : '检测所有海报链接'}
           </button>
        </div>
        
        {/* 指标看板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
           <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">电影总数</span>
              <div className="text-3xl font-bold text-white mt-1">{movies.length}</div>
           </div>
           <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">失效海报</span>
              <div className="text-3xl font-bold text-red-500 mt-1">
                 {Object.values(scanResults).filter(v => v === 'error').length}
              </div>
           </div>
        </div>

        {/* 资源检查实时报表 */}
        {Object.keys(scanResults).length > 0 && (
           <section className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 mb-8">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">资源检查报告</h2>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                 <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-black text-gray-200 sticky top-0 font-bold">
                      <tr>
                        <th className="px-6 py-3">电影名称</th>
                        <th className="px-6 py-3">可用状态</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {movies.map(movie => (
                         <tr key={movie.id} className="hover:bg-gray-800/30 transition">
                            <td className="px-6 py-4 text-white font-medium">{movie.title}</td>
                            <td className="px-6 py-4">
                               {scanResults[movie.id] === 'ok' && <span className="text-green-500">正常</span>}
                               {scanResults[movie.id] === 'error' && <span className="text-red-500 font-bold">链接失效</span>}
                               {scanResults[movie.id] === 'testing' && <span className="text-blue-400 animate-pulse">检测中...</span>}
                            </td>
                         </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
           </section>
        )}

        {/* 评论审计 */}
        <section className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">评论审计管理</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-black text-gray-200 font-bold">
                <tr>
                  <th className="px-6 py-3">日期</th>
                  <th className="px-6 py-3">用户</th>
                  <th className="px-6 py-3">内容预览</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {comments.map(comment => (
                  <tr key={comment.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4">{new Date(comment.timestamp).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{comment.username}</td>
                    <td className="px-6 py-4 truncate max-w-xs">{comment.content}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => deleteComment(comment.id)}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1 rounded transition-all text-xs"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};