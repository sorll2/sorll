import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { useNavigate, Link } from 'react-router-dom';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [strength, setStrength] = useState('');
  const [error, setError] = useState('');
  
  const { registerUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!password) {
      setStrength('');
      return;
    }
    if (password.length < 8) {
      setStrength('密码强度较弱 (太短)');
      return;
    }
    const hasNum = /\d/.test(password);
    const hasChar = /[a-zA-Z]/.test(password);
    
    if (hasNum && hasChar) {
      setStrength('密码强度适中 (良好)');
    } else {
      setStrength('密码强度较弱 (需包含字母和数字)');
    }
  }, [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }
    if (!strength.includes('适中')) {
      setError('密码强度不足');
      return;
    }

    const success = registerUser({
      id: Date.now().toString(),
      username,
      password,
      role: 'user',
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`
    });

    if (success) {
      alert('注册成功！请登录。');
      navigate('/login');
    } else {
      setError('用户名已存在');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-black">
      <div className="max-w-md w-full bg-gray-900/80 p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-8 text-white">创建账号</h2>
        {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-sm text-center border border-red-800">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">用户名</label>
            <input 
              type="text" 
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">密码</label>
            <input 
              type="password" 
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
             {strength && (
              <div className={`text-xs mt-1 font-bold ${strength.includes('较弱') ? 'text-red-500' : 'text-green-500'}`}>
                {strength}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">确认密码</label>
            <input 
              type="password" 
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-lg transition mt-4 shadow-lg shadow-primary/20">
            立即注册
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          已有账号? <Link to="/login" className="text-primary hover:underline">点击登录</Link>
        </p>
      </div>
    </div>
  );
};