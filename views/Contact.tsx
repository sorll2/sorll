import React, { useState } from 'react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('请输入有效的邮箱地址');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 bg-black min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">联系我们</h1>
      
      {submitted ? (
        <div className="bg-green-900/20 border border-green-800 p-8 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-green-400 mb-2">感谢您, {formData.name}!</h3>
          <p className="text-gray-300">提交成功，我们将尽快与您联系！</p>
          <div className="mt-6 bg-gray-900 p-4 rounded text-left inline-block w-full">
            <p className="text-gray-400 text-sm"><strong>邮箱:</strong> {formData.email}</p>
            <p className="text-gray-400 text-sm"><strong>留言:</strong> {formData.message}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-900/50 p-8 rounded-2xl shadow-xl space-y-6 border border-gray-800">
          <div>
            <label className="block text-gray-400 mb-2 font-medium text-sm">姓名</label>
            <input 
              name="name"
              type="text" 
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2 font-medium text-sm">邮箱</label>
            <input 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2 font-medium text-sm">留言内容</label>
            <textarea 
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
              required
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-lg transition text-lg shadow-lg shadow-primary/20">
            提交留言
          </button>
        </form>
      )}
    </div>
  );
};