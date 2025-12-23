
import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useApp } from '../App';
import { LazyImage, getOptimizedImageUrl } from '../components/LazyImage';
import { Comment, Movie } from '../types';
import { EMOJIS } from '../constants';
import { Star, Heart, ThumbsUp, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * 电影详情视图
 * 功能点：
 * 1. 动态模糊背景
 * 2. 评论发布与盖楼回复
 * 3. 收藏与互动操作
 * 4. 评分分布图表展示
 * 5. 关键词词云热力展示
 */
export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    movies, 
    user, 
    comments, 
    addComment, 
    deleteComment, 
    likeComment, 
    toggleFavorite, 
    isFavorite 
  } = useApp();
  
  const movie = movies.find(m => m.id === id);
  // 获取当前电影所有评论并按时间倒序排列
  const movieComments = comments.filter(c => c.movieId === id).sort((a, b) => b.timestamp - a.timestamp);
  
  const [newComment, setNewComment] = useState(''); // 新评论文本
  const [replyTo, setReplyTo] = useState<string | null>(null); // 指向正在回复的评论 ID

  useEffect(() => {
    setNewComment('');
    setReplyTo(null);
  }, [id]);
  
  if (!movie) return <Navigate to="/" />;

  const isFav = isFavorite(movie.id);

  /**
   * 发布评论/回复
   */
  const handlePostComment = () => {
    if (!newComment.trim() || !user) return;
    const comment: Comment = {
      id: Date.now().toString(),
      movieId: movie.id,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar || '',
      content: newComment,
      timestamp: Date.now(),
      likes: 0,
      parentId: replyTo || undefined // 如果是回复，绑定父评论 ID
    };
    addComment(comment);
    setNewComment('');
    setReplyTo(null);
  };

  /**
   * 格式化图表数据：将 1-5 星分布转换为数组
   */
  const chartData = Object.entries(movie.ratingDistribution)
    .map(([star, count]) => ({ star: `${star}星`, count }))
    .reverse();

  return (
    <div className="min-h-screen bg-black pb-20 pt-8 relative overflow-hidden">
      
      {/* 动态氛围背景：通过极小尺寸图片+大范围模糊实现 */}
      <div className="absolute top-0 left-0 w-full h-[70vh] z-0 select-none pointer-events-none overflow-hidden">
        <img 
          src={getOptimizedImageUrl(movie.coverUrl, 100)} 
          alt="" 
          className="w-full h-full object-cover opacity-30 blur-3xl scale-110 transform transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
      </div>

      <div className="relative z-10">
        {/* 顶部：海报与基本元数据 */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
           <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-[350px] flex-shrink-0">
                 <div className="rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden border border-gray-800 bg-gray-900 aspect-[2/3] relative group">
                    <LazyImage 
                      src={movie.coverUrl} 
                      alt={movie.title} 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="eager"
                      width={800}
                    />
                 </div>
              </div>

              <div className="flex-1 space-y-6">
                 <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">{movie.title}</h1>
                 
                 <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 border-b border-dashed border-gray-700 pb-6">
                    <span className="bg-primary px-2 py-0.5 rounded text-white font-bold shadow-lg shadow-primary/30">{movie.rating.toFixed(1)}</span>
                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                    <span>|</span>
                    <span>{movie.region}</span>
                    <span>|</span>
                    <span>{movie.genre.join(' / ')}</span>
                 </div>

                 <div className="space-y-3 text-sm text-gray-200">
                    <p><span className="text-white font-bold opacity-80">导演：</span>{movie.director}</p>
                    <p><span className="text-white font-bold opacity-80">主演：</span>{movie.actors.join(' / ')}</p>
                 </div>

                 <div className="border-t border-dashed border-gray-700 pt-6">
                    <h3 className="text-white font-bold mb-2 text-lg">剧情简介</h3>
                    <p className="text-gray-300 text-sm leading-7 opacity-90">
                       {movie.description}
                    </p>
                 </div>

                 {/* 互动操作按钮 */}
                 <div className="flex gap-4 pt-4">
                    <button 
                       onClick={() => toggleFavorite(movie.id)}
                       className={`flex items-center gap-2 px-6 py-2 border rounded transition backdrop-blur-sm ${
                          isFav ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-white/5 border-gray-600 text-white'
                       }`}
                    >
                       <Star size={18} fill={isFav ? "currentColor" : "none"} />
                       <span>{isFav ? '已收藏' : '收藏'} {movie.collectCount}</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* 下方：评论系统与数据分析 */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* 左侧：评论列表及相关推荐 */}
           <div className="lg:col-span-2 space-y-10">
              <section>
                 <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-5 bg-primary"></span> 用户评价
                 </h2>

                 {/* 评论输入框 */}
                 {user ? (
                    <div className="bg-gray-900/80 backdrop-blur p-4 rounded mb-6 border border-gray-800">
                       <textarea
                          className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white text-xs outline-none resize-none"
                          rows={3}
                          placeholder={replyTo ? "回复评论..." : "写下你的短评..."}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                       />
                       <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-2">
                             {EMOJIS.slice(0, 5).map(emoji => (
                                <button key={emoji} onClick={() => setNewComment(p => p + emoji)} className="hover:scale-125 transition">
                                   {emoji}
                                </button>
                             ))}
                          </div>
                          <button onClick={handlePostComment} className="bg-primary px-4 py-1 rounded text-xs">发布</button>
                       </div>
                    </div>
                 ) : (
                    <div className="bg-gray-900/80 p-4 rounded mb-6 text-center text-xs text-gray-500">
                       请 <a href="#/login" className="text-primary hover:underline">登录</a> 后发表评论
                    </div>
                 )}

                 {/* 递归层级评论渲染 */}
                 <div className="space-y-4">
                    {movieComments.filter(c => !c.parentId).map(comment => (
                       <div key={comment.id} className="bg-black/60 border border-gray-800 p-4 rounded backdrop-blur-sm">
                          <div className="flex gap-3">
                             <img src={comment.userAvatar} className="w-8 h-8 rounded-full" />
                             <div className="flex-1">
                                <div className="flex justify-between items-baseline mb-1">
                                   <span className="text-xs font-bold text-blue-400">{comment.username}</span>
                                   <span className="text-[10px] text-gray-500">{new Date(comment.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-gray-200 leading-5">{comment.content}</p>
                                
                                <div className="flex gap-4 mt-2 text-[10px] text-gray-500">
                                   <button onClick={() => likeComment(comment.id)} className="flex items-center gap-1 hover:text-primary transition-colors">
                                      <ThumbsUp size={10} /> {comment.likes}
                                   </button>
                                   {user && <button onClick={() => setReplyTo(comment.id)} className="hover:text-primary">回复</button>}
                                </div>

                                {/* 渲染回复楼层 */}
                                {movieComments.filter(r => r.parentId === comment.id).map(reply => (
                                   <div key={reply.id} className="mt-3 pt-3 border-t border-gray-700/50 pl-2">
                                      <span className="text-xs font-bold text-blue-400 block mb-1">{reply.username}</span>
                                      <p className="text-xs text-gray-300">{reply.content}</p>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>
           </div>

           {/* 右侧：统计分析侧边栏 */}
           <div className="space-y-6">
              {/* 基于 Recharts 的评分分布图 */}
              <div className="bg-gray-900/60 backdrop-blur p-5 rounded-lg border border-gray-800">
                 <h3 className="text-white font-bold text-sm mb-4">评分分布</h3>
                 <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={chartData} layout="vertical">
                          <XAxis type="number" hide />
                          <YAxis dataKey="star" type="category" width={30} tick={{ fill: '#d1d5db', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Bar dataKey="count" barSize={12} radius={[0, 4, 4, 0]}>
                             {chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === 0 ? '#e50914' : '#4b5563'} />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* 视觉词云展示 */}
              <div className="bg-gray-900/60 backdrop-blur p-5 rounded-lg border border-gray-800">
                 <h3 className="text-white font-bold text-sm mb-4">口碑关键词</h3>
                 <div className="flex flex-wrap gap-2 justify-center">
                    {movie.keywords.map((kw, idx) => {
                       const size = 12 + (kw.value / 100) * 12;
                       return (
                          <span 
                             key={idx}
                             className="transition-all hover:scale-110 inline-block"
                             style={{ fontSize: `${size}px`, opacity: 0.6 + (kw.value / 100) * 0.4 }}
                          >
                             {kw.text}
                          </span>
                       );
                    })}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};