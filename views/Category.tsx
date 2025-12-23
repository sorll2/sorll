
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { LazyImage } from '../components/LazyImage';
import { MovieGenre, MovieRegion } from '../types';
import { Link } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';

/**
 * 分类浏览视图
 * 功能：支持类型(Genre)、地区(Region)双重交叉过滤，以及评分/日期排序
 */
export const Category: React.FC = () => {
  const { movies } = useApp();
  const [selectedGenre, setSelectedGenre] = useState<string>('全部');
  const [selectedRegion, setSelectedRegion] = useState<string>('全部');
  const [sortBy, setSortBy] = useState<'rating' | 'date' | 'default'>('default');

  /**
   * 复杂筛选逻辑：将多种条件聚合后一次性计算结果集
   */
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // 1. 类型过滤
    if (selectedGenre !== '全部') {
      result = result.filter(m => m.genre.includes(selectedGenre as MovieGenre));
    }

    // 2. 地区过滤
    if (selectedRegion !== '全部') {
      result = result.filter(m => m.region === selectedRegion);
    }

    // 3. 排序执行
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    }

    return result;
  }, [movies, selectedGenre, selectedRegion, sortBy]);

  return (
    <div className="bg-black min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* 筛选控制面板 */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-8 sticky top-20 z-30 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
             <SlidersHorizontal className="text-primary" />
             <span>分类筛选</span>
          </div>
          
          <div className="space-y-4">
             {/* 类型行 */}
             <div className="flex flex-wrap items-center gap-3">
                <span className="text-gray-500 text-sm w-12 font-bold">类型:</span>
                <button 
                  onClick={() => setSelectedGenre('全部')}
                  className={`px-3 py-1 rounded text-sm transition ${selectedGenre === '全部' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                >
                  全部
                </button>
                {Object.values(MovieGenre).map(g => (
                   <button 
                     key={g}
                     onClick={() => setSelectedGenre(g)}
                     className={`px-3 py-1 rounded text-sm transition ${selectedGenre === g ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                   >
                     {g}
                   </button>
                ))}
             </div>

             {/* 地区行 */}
             <div className="flex flex-wrap items-center gap-3">
                <span className="text-gray-500 text-sm w-12 font-bold">地区:</span>
                <button 
                  onClick={() => setSelectedRegion('全部')}
                  className={`px-3 py-1 rounded text-sm transition ${selectedRegion === '全部' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                >
                  全部
                </button>
                {Object.values(MovieRegion).map(r => (
                   <button 
                     key={r}
                     onClick={() => setSelectedRegion(r)}
                     className={`px-3 py-1 rounded text-sm transition ${selectedRegion === r ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
                   >
                     {r}
                   </button>
                ))}
             </div>
             
             {/* 排序行 */}
             <div className="flex flex-wrap items-center gap-3 border-t border-gray-800 pt-4 mt-2">
                <span className="text-gray-500 text-sm w-12 font-bold">排序:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-black border border-gray-700 text-white text-sm rounded px-3 py-1 outline-none focus:border-primary"
                >
                   <option value="default">默认排序</option>
                   <option value="rating">最高评分</option>
                   <option value="date">最新上映</option>
                </select>
                <span className="text-gray-600 text-xs ml-auto">共找到 {filteredMovies.length} 部影片</span>
             </div>
          </div>
        </div>

        {/* 结果显示网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
           {filteredMovies.map(movie => (
              <Link to={`/movie/${movie.id}`} key={movie.id} className="group block">
                <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 relative hover:-translate-y-2 transition-transform duration-300">
                   <div className="aspect-poster relative overflow-hidden bg-gray-950">
                      <LazyImage src={movie.coverUrl} alt={movie.title} width={350} />
                      <div className="absolute top-2 right-2 bg-black/70 text-yellow-500 font-bold px-2 py-0.5 rounded text-xs border border-yellow-500/30">
                         {movie.rating.toFixed(1)}
                      </div>
                   </div>
                   <div className="p-3">
                      <h3 className="text-white font-bold text-sm truncate group-hover:text-primary transition-colors">{movie.title}</h3>
                      <p className="text-gray-500 text-[10px] mt-1">{new Date(movie.releaseDate).getFullYear()} · {movie.region}</p>
                   </div>
                </div>
              </Link>
           ))}
        </div>

        {/* 空结果展示 */}
        {filteredMovies.length === 0 && (
           <div className="text-center py-20 text-gray-500">
              <Filter size={48} className="mx-auto mb-4 opacity-50" />
              <p>没有找到符合条件的电影</p>
           </div>
        )}

      </div>
    </div>
  );
};