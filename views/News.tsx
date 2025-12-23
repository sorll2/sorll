import React from 'react';
import { useApp } from '../App';
import { LazyImage } from '../components/LazyImage';
import { Calendar, Tag } from 'lucide-react';

export const News: React.FC = () => {
  const { news } = useApp();

  return (
    <div className="bg-black min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8 border-l-8 border-primary pl-4">
          影视资讯
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map(item => (
            <div key={item.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group hover:border-gray-700 transition shadow-lg">
              <div className="h-48 overflow-hidden relative">
                 <LazyImage 
                    src={item.coverUrl} 
                    alt={item.title} 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                 />
                 <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                    {item.tag}
                 </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                   <Calendar size={12} />
                   <span>{item.date}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
                <button className="mt-4 text-primary text-sm font-bold hover:underline">
                   阅读全文 &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};