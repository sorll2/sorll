import React, { useState } from 'react';
import { useApp } from '../App';
import { useNavigate, Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { users, login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username);
    
    if (!user) {
      setError('用户不存在');
      return;
    }
    
    if (user.password !== password) {
      setError('密码错误');
      return;
    }

    login(user);
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-black">
      <div className="max-w-md w-full bg-gray-900/80 p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">欢迎回来</h2>
        {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-sm text-center border border-red-800">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">用户名</label>
            <input 
              type="text" 
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">密码</label>
            <input 
              type="password" 
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-primary/20">
            登录
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          还没有账号? <Link to="/register" className="text-primary hover:underline">点击注册</Link>
        </p>
      </div>
    </div>
  );
};