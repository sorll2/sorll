
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './views/Home';
import { MovieDetails } from './views/MovieDetails';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { Contact } from './views/Contact';
import { Admin } from './views/Admin';
import { News } from './views/News';
import { Category } from './views/Category';
import { User, Movie, Comment, NewsItem } from './types';
import { MOCK_MOVIES, MOCK_COMMENTS, MOCK_USERS, MOCK_NEWS } from './constants';

/**
 * 全局状态上下文定义
 * 包含用户信息、电影库、评论、资讯以及相关操作方法
 */
interface AppContextType {
  user: User | null; // 当前登录用户
  login: (user: User) => void; // 登录函数
  logout: () => void; // 退出登录函数
  movies: Movie[]; // 电影列表数据
  comments: Comment[]; // 全局评论列表
  news: NewsItem[]; // 资讯列表
  addComment: (comment: Comment) => void; // 添加评论
  deleteComment: (id: string) => void; // 删除评论（管理员权限）
  likeComment: (commentId: string) => void; // 评论点赞
  users: User[]; // 已注册用户列表
  registerUser: (user: User) => boolean; // 用户注册逻辑
  toggleFavorite: (movieId: string) => void; // 切换收藏状态
  isFavorite: (movieId: string) => boolean; // 检查是否已收藏
}

// 创建 Context 容器
export const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * 自定义 Hook：方便子组件快速获取全局状态
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp 必须在 AppProvider 内部使用');
  return context;
};

const App: React.FC = () => {
  // --- 核心状态声明 ---
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>(MOCK_MOVIES);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [news] = useState<NewsItem[]>(MOCK_NEWS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  // 收藏夹存储结构: userId -> [movieId1, movieId2...]
  const [favorites, setFavorites] = useState<Record<string, string[]>>({});

  /**
   * 登录：设置全局用户信息
   */
  const login = (userData: User) => {
    setUser(userData);
  };

  /**
   * 退出：清空全局用户信息
   */
  const logout = () => {
    setUser(null);
  };

  /**
   * 注册：验证用户名是否存在，成功则存入内存
   */
  const registerUser = (newUser: User) => {
    if (users.some(u => u.username === newUser.username)) {
      return false;
    }
    setUsers([...users, newUser]);
    return true;
  };

  /**
   * 添加评论：新评论置顶
   */
  const addComment = (newComment: Comment) => {
    setComments([newComment, ...comments]);
  };

  /**
   * 删除评论：根据 ID 过滤（后台管理使用）
   */
  const deleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
  };

  /**
   * 评论点赞：不可撤销累加
   */
  const likeComment = (commentId: string) => {
    if (!user) {
      alert("请先登录后点赞");
      return;
    }
    setComments(prevComments => prevComments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: c.likes + 1 };
      }
      return c;
    }));
  };

  /**
   * 收藏切换：
   * 1. 更新用户的收藏列表
   * 2. 更新电影对象的 collectCount (收藏总数)
   */
  const toggleFavorite = (movieId: string) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    const userFavs = favorites[user.id] || [];
    const isFav = userFavs.includes(movieId);
    
    let newFavs;
    if (isFav) {
      newFavs = userFavs.filter(id => id !== movieId);
    } else {
      newFavs = [...userFavs, movieId];
    }
    setFavorites({ ...favorites, [user.id]: newFavs });

    setMovies(prevMovies => prevMovies.map(m => {
      if (m.id === movieId) {
        return { 
          ...m, 
          collectCount: isFav ? Math.max(0, m.collectCount - 1) : m.collectCount + 1 
        };
      }
      return m;
    }));
  };

  /**
   * 辅助方法：检查当前用户是否收藏了某电影
   */
  const isFavorite = (movieId: string) => {
    if (!user) return false;
    return (favorites[user.id] || []).includes(movieId);
  };

  return (
    <AppContext.Provider value={{ 
      user, login, logout, 
      movies, comments, news, addComment, deleteComment, likeComment,
      users, registerUser,
      toggleFavorite, isFavorite
    }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
          <Navbar />
          {/* 页面主容器 */}
          <main className="flex-grow pt-16">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/news" element={<News />} />
              <Route path="/category" element={<Category />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

/**
 * 路由辅助组件：切换页面时自动将窗口滚动回顶部
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**
 * 通用页脚组件
 */
const Footer = () => (
  <footer className="bg-gray-950 py-8 mt-12 border-t border-gray-800">
    <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
      <p>&copy; 2024 CinemaScope. 保留所有权利。</p>
      <div className="mt-4 space-x-4">
        <a href="#/contact" className="hover:text-primary transition">联系我们</a>
        <span className="text-gray-700">|</span>
        <a href="#/admin" className="hover:text-primary transition">后台管理</a>
      </div>
    </div>
  </footer>
);

export default App;