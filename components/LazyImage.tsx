
import React, { useState, useEffect, useRef } from 'react';
import { ImageOff, RefreshCw } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  width?: number; 
  height?: number;
  quality?: number;
  title?: string; // 失败时显示的相关电影名称
}

/**
 * 核心功能：图片代理优化
 * 使用 wsrv.nl CDN 提供：
 * 1. 缓存加速
 * 2. 格式转换（自动切 WebP）
 * 3. 动态缩放（根据 w 参数减少下行流量）
 */
export const getOptimizedImageUrl = (url: string, width: number = 600, height?: number, quality: number = 85) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  
  const params = new URLSearchParams({
    url: url,
    w: width.toString(),
    q: quality.toString(),
    af: '1', // 自动格式转换
    il: '1', // 交错扫描（渐进式展示）
    fit: 'cover'
  });
  
  if (height) params.append('h', height.toString());
  return `https://wsrv.nl/?${params.toString()}`;
};

/**
 * 高级图片组件
 * 功能特点：
 * 1. 视口懒加载（Intersection Observer）
 * 2. 多级容错（CDN 失败退回到直链，直链失败显示占位）
 * 3. Referrer 策略绕过防盗链
 */
export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  title,
  className = '', 
  wrapperClassName = '',
  loading = 'lazy',
  width = 600,
  height,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  // errorStage 状态机：0: CDN 代理 | 1: 原始直链重试 | 2: 彻底不可用
  const [errorStage, setErrorStage] = useState<0 | 1 | 2>(0);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  
  const [isVisible, setIsVisible] = useState(loading === 'eager');
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 监听元素是否进入可视区域
   */
  useEffect(() => {
    if (loading === 'eager') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });
    }, { rootMargin: '200px', threshold: 0.01 });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [loading]);

  /**
   * 状态变化时同步 src 地址
   */
  useEffect(() => {
    if (isVisible) {
      if (errorStage === 0) {
        setCurrentSrc(getOptimizedImageUrl(src, width, height));
      } else if (errorStage === 1) {
        setCurrentSrc(src); // 退回原始地址
      }
    }
  }, [isVisible, src, width, height, errorStage]);

  /**
   * 容错处理逻辑
   */
  const handleError = () => {
    if (errorStage === 0) {
      setErrorStage(1); // 代理失效，尝试原图
    } else {
      setErrorStage(2); // 全部失效，放弃加载
      setIsLoaded(true);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-gray-900/40 flex items-center justify-center aspect-poster ${wrapperClassName}`}
    >
      {/* 骨架屏占位 */}
      {!isLoaded && errorStage < 2 && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse z-10" />
      )}
      
      {/* 错误提示界面 */}
      {errorStage === 2 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-0 p-4 text-center">
          <ImageOff size={32} className="text-gray-700 mb-3 relative z-10" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">海报暂不可用</span>
          {title && (
            <p className="text-xs font-medium text-gray-400 line-clamp-2 relative z-10 px-2">{title}</p>
          )}
          <button 
            onClick={() => { setErrorStage(0); setIsLoaded(false); }}
            className="mt-4 p-1 rounded-full hover:bg-white/10 text-gray-600 hover:text-white transition-colors relative z-10"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      ) : (
        isVisible && (
          <img
            src={currentSrc}
            alt={alt}
            loading="eager"
            onLoad={() => setIsLoaded(true)}
            onError={handleError}
            className={`block w-full h-full object-cover transition-all duration-700 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            referrerPolicy="no-referrer" // 关键：绕过某些域名的防盗链检测
            {...props}
          />
        )
      )}
    </div>
  );
};