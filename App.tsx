
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar.tsx';
import { Home } from './views/Home.tsx';
import { MovieDetails } from './views/MovieDetails.tsx';
import { Login } from './views/Login.tsx';
import { Register } from './views/Register.tsx';
import { Contact } from './views/Contact.tsx';
import { Admin } from './views/Admin.tsx';
import { News } from './views/News.tsx';
import { Category } from './views/Category.tsx';
import { User, Movie, Comment, NewsItem } from './types.ts';
import { MOCK_MOVIES, MOCK_COMMENTS, MOCK_USERS, MOCK_NEWS } from './constants.ts';

interface AppContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  movies: Movie[];
  comments: Comment[];
  news: NewsItem[];
  addComment: (comment: Comment) => void;
  deleteComment: (id: string) => void;
  likeComment: (commentId: string) => void;
  users: User[];
  registerUser: (user: User) => boolean;
  toggleFavorite: (movieId: string) => void;
  isFavorite: (movieId: string) => boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp 必须在 AppProvider 内部使用');
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>(MOCK_MOVIES);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [news] = useState<NewsItem[]>(MOCK_NEWS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [favorites, setFavorites] = useState<Record<string, string[]>>({});

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  const registerUser = (newUser: User) => {
    if (users.some(u => u.username === newUser.username)) return false;
    setUsers([...users, newUser]);
    return true;
  };

  const addComment = (newComment: Comment) => setComments([newComment, ...comments]);
  const deleteComment = (id: string) => setComments(comments.filter(c => c.id !== id));
  const likeComment = (commentId: string) => {
    if (!user) return;
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
  };

  const toggleFavorite = (movieId: string) => {
    if (!user) return;
    const userFavs = favorites[user.id] || [];
    const isFav = userFavs.includes(movieId);
    const newFavs = isFav ? userFavs.filter(id => id !== movieId) : [...userFavs, movieId];
    setFavorites({ ...favorites, [user.id]: newFavs });
    setMovies(prev => prev.map(m => m.id === movieId ? { ...m, collectCount: isFav ? Math.max(0, m.collectCount - 1) : m.collectCount + 1 } : m));
  };

  const isFavorite = (movieId: string) => user ? (favorites[user.id] || []).includes(movieId) : false;

  return (
    <AppContext.Provider value={{ 
      user, login, logout, movies, comments, news, addComment, deleteComment, likeComment, users, registerUser, toggleFavorite, isFavorite
    }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
          <Navbar />
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

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const Footer = () => (
  <footer className="bg-gray-950 py-8 mt-12 border-t border-gray-800">
    <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
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
