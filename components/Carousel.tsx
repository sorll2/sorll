
import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LazyImage } from './LazyImage';

interface CarouselProps {
  items: Movie[];
}

/**
 * 首页英雄轮播图组件
 * 展示评分最高的几部电影作为特色内容
 */
export const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // 鼠标悬停时暂停自动播放
  const navigate = useNavigate();

  // 筛选评分最高的前 5 部电影作为精选
  const featured = items.sort((a, b) => b.rating - a.rating).slice(0, 5);

  /**
   * 自动切换定时器
   */
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featured.length, isPaused]);

  /**
   * 上一张
   */
  const prev = () => {
    setCurrentIndex((curr) => (curr === 0 ? featured.length - 1 : curr - 1));
  };

  /**
   * 下一张
   */
  const next = () => {
    setCurrentIndex((curr) => (curr + 1) % featured.length);
  };

  if (featured.length === 0) return null;

  return (
    <div 
      className="relative w-full h-[400px] overflow-hidden group bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {featured.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* 大图展示：使用高分辨率优化配置 */}
          <LazyImage 
            src={movie.coverUrl}
            alt={movie.title}
            className="object-cover"
            loading={index === 0 ? "eager" : "lazy"}
            width={1200}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 pointer-events-none"></div>
          
          {/* 信息遮罩层 */}
          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 to-transparent z-20">
             <h2 className="text-3xl font-bold text-white drop-shadow-md cursor-pointer hover:text-primary transition inline-block" onClick={() => navigate(`/movie/${movie.id}`)}>
               {movie.title}
             </h2>
             <p className="text-gray-300 text-sm mt-2 line-clamp-2 max-w-2xl drop-shadow-sm">
               {movie.description}
             </p>
          </div>
        </div>
      ))}

      {/* 左右控制按钮 */}
      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full hover:bg-primary transition z-30">
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 text-white rounded-full hover:bg-primary transition z-30">
        <ChevronRight size={24} />
      </button>

      {/* 底部指示器 */}
      <div className="absolute bottom-4 right-4 z-30 flex gap-2">
        {featured.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-primary w-6' : 'bg-gray-500 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};