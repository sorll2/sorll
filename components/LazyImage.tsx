
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
  title?: string;
}

/**
 * 图片代理优化：
 * 注意：wsrv.nl 在国内部分地区可能无法直接访问。
 */
export const getOptimizedImageUrl = (url: string, width: number = 600, height?: number, quality: number = 85) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  
  const params = new URLSearchParams({
    url: url,
    w: width.toString(),
    q: quality.toString(),
    af: '1',
    il: '1',
    fit: 'cover'
  });
  
  if (height) params.append('h', height.toString());
  return `https://wsrv.nl/?${params.toString()}`;
};

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
  const [errorStage, setErrorStage] = useState<0 | 1 | 2>(0);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isVisible, setIsVisible] = useState(loading === 'eager');
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (isVisible) {
      if (errorStage === 0) {
        setCurrentSrc(getOptimizedImageUrl(src, width, height));
        // 超时判定缩短至 1.5 秒，以适应国内网络环境
        timeoutRef.current = window.setTimeout(() => {
          if (!isLoaded) {
            handleError();
          }
        }, 1500);
      } else if (errorStage === 1) {
        setCurrentSrc(src);
      }
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isVisible, src, width, height, errorStage, isLoaded]);

  const handleError = () => {
    if (errorStage === 0) {
      setErrorStage(1);
    } else {
      setErrorStage(2);
      setIsLoaded(true);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-gray-900/40 flex items-center justify-center aspect-poster ${wrapperClassName}`}
    >
      {!isLoaded && errorStage < 2 && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse z-10" />
      )}
      
      {errorStage === 2 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-0 p-4 text-center">
          <ImageOff size={32} className="text-gray-700 mb-3" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 text-wrap px-2">海报加载超时</span>
          {title && <p className="text-xs font-medium text-gray-400 line-clamp-2">{title}</p>}
          <button 
            onClick={() => { setErrorStage(0); setIsLoaded(false); }}
            className="mt-4 p-1 rounded-full hover:bg-white/10 text-gray-600 hover:text-white"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      ) : (
        isVisible && (
          <img
            src={currentSrc}
            alt={alt}
            onLoad={() => {
              setIsLoaded(true);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onError={handleError}
            className={`block w-full h-full object-cover transition-all duration-700 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            referrerPolicy="no-referrer"
            {...props}
          />
        )
      )}
    </div>
  );
};
