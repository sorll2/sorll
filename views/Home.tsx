
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { Carousel } from '../components/Carousel';
import { LazyImage } from '../components/LazyImage';
import { MovieGenre, MovieRegion, Movie } from '../types';
import { Link } from 'react-router-dom';
import { Star, Film, Tv, Video, Heart, Zap, Ghost, Smile, Skull } from 'lucide-react';

/**
 * 首页视图
 * 采用响应式多栏布局（侧边导航 + 主内容轮播网格 + 右侧实时口碑榜）
 */
export const Home: React.FC = () => {
  const { movies } = useApp();
  const [filterGenre, setFilterGenre] = useState<string>('全部'); // 侧边栏当前选中的分类

  /**
   * 过滤逻辑：根据侧边栏选项动态计算展示的电影
   */
  const recentMovies = useMemo(() => {
    return movies.filter(m => {
      const matchGenre = filterGenre === '全部' || m.genre.includes(filterGenre as MovieGenre);
      return matchGenre;
    });
  }, [movies, filterGenre]);

  /**
   * 排行榜逻辑：计算评分最高的前 10 名
   */
  const topRatedMovies = useMemo(() => {
    return [...movies].sort((a, b) => b.rating - a.rating).slice(0, 10);
  }, [movies]);

  // 风格化图标映射
  const genreIcons: Record<string, React.ReactNode> = {
    '动作': <Zap size={24} />,
    '喜剧': <Smile size={24} />,
    '爱情': <Heart size={24} />,
    '科幻': <Tv size={24} />,
    '剧情': <Film size={24} />,
    '恐怖': <Ghost size={24} />,
    '动画': <Video size={24} />,
    '犯罪': <Skull size={24} />
  };

  return (
    <div className="bg-black min-h-screen pt-4">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          
          {/* --- 左侧栏：分类筛选 --- */}
          <div className="hidden lg:block col-span-2">
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 sticky top-24">
              <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-primary pl-3">精彩发现</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilterGenre('全部')}
                  className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all group ${
                    filterGenre === '全部' ? 'bg-primary/20 text-white' : 'hover:bg-gray-800'
                  }`}
                >
                  <div className={`p-2 rounded-full ${filterGenre === '全部' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-500 group-hover:text-primary group-hover:bg-white'}`}>
                    <Film size={24} />
                  </div>
                  <span className={`font-bold text-sm ${filterGenre === '全部' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>全部影片</span>
                </button>

                {Object.values(MovieGenre).map(genre => (
                  <button
                    key={genre}
                    onClick={() => setFilterGenre(genre)}
                    className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all group ${
                      filterGenre === genre ? 'bg-primary/20 text-white' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className={`p-2 rounded-full transition-colors ${filterGenre === genre ? 'bg-primary text-white' : 'bg-gray-800 text-gray-500 group-hover:text-primary group-hover:bg-white'}`}>
                      {genreIcons[genre] || <Film size={24} />}
                    </div>
                    <span className={`font-bold text-sm ${filterGenre === genre ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{genre}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* --- 中间栏：内容主展示区 --- */}
          <div className="col-span-12 lg:col-span-7 space-y-8">
            {/* 特色轮播 */}
            <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-800">
              <Carousel items={movies} />
            </div>

            {/* 电影网格展示 */}
            <div>
               <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary"></span>
                  {filterGenre === '全部' ? '热门电影' : `${filterGenre}精品`}
               </h2>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {recentMovies.map(movie => (
                    <Link to={`/movie/${movie.id}`} key={movie.id} className="group block">
                      <div className="bg-black/90 rounded-lg overflow-hidden border border-gray-800 shadow-lg hover:shadow-primary/20 transition-all duration-300 relative">
                         <div className="relative aspect-poster overflow-hidden bg-gray-900">
                            <LazyImage 
                              src={movie.coverUrl} 
                              alt={movie.title} 
                              title={movie.title}
                              className="object-cover transition-transform duration-500 group-hover:scale-110" 
                              width={400} 
                            />
                            <div className="absolute top-0 right-0 bg-primary/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-bl-lg z-10">
                               {movie.rating.toFixed(1)}
                            </div>
                         </div>
                         <div className="p-3">
                            <h3 className="text-white font-bold text-base truncate mb-1 group-hover:text-primary transition-colors">{movie.title}</h3>
                            <p className="text-gray-500 text-[10px] mb-2">{new Date(movie.releaseDate).getFullYear()} / {movie.region}</p>
                         </div>
                      </div>
                    </Link>
                  ))}
               </div>
            </div>
          </div>

          {/* --- 右侧栏：口碑排行榜 --- */}
          <div className="col-span-12 lg:col-span-3">
             <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-800 sticky top-24">
                <h3 className="text-white font-bold text-sm mb-4 flex items-center justify-between border-b border-gray-700 pb-2">
                   <span>实时口碑榜</span>
                   <span className="text-primary text-xs cursor-pointer hover:underline">Top 250</span>
                </h3>
                <div className="space-y-4">
                   {topRatedMovies.map((movie, index) => (
                      <Link to={`/movie/${movie.id}`} key={movie.id} className="flex items-center gap-3 group border-b border-dashed border-gray-800 pb-3 last:border-0">
                         <div className={`text-xl font-bold italic w-6 text-center ${index < 3 ? 'text-primary' : 'text-gray-600'}`}>
                            {index + 1}
                         </div>
                         <div className="w-16 h-24 flex-shrink-0 overflow-hidden rounded bg-gray-900 shadow-md aspect-poster">
                            <LazyImage 
                              src={movie.coverUrl} 
                              alt={movie.title} 
                              title={movie.title}
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                              width={150} 
                            />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-sm truncate group-hover:text-primary transition-colors">{movie.title}</h4>
                            <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1 font-bold">
                               <Star size={10} fill="currentColor" /> {movie.rating}
                            </div>
                         </div>
                      </Link>
                   ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};