
/**
 * 用户模型
 */
export interface User {
  id: string;
  username: string;
  password?: string;
  avatar?: string;
  role?: 'user' | 'admin';
}

/**
 * 电影类型枚举
 */
export enum MovieGenre {
  Action = '动作',
  Comedy = '喜剧',
  Romance = '爱情',
  SciFi = '科幻',
  Drama = '剧情',
  Horror = '恐怖',
  Animation = '动画',
  Crime = '犯罪'
}

/**
 * 电影制片地区枚举
 */
export enum MovieRegion {
  Hollywood = '好莱坞',
  Domestic = '国产',
  JapanKorea = '日韩',
  Europe = '欧美'
}

/**
 * 电影详细模型
 */
export interface Movie {
  id: string;
  title: string;
  coverUrl: string; // 海报地址
  genre: MovieGenre[]; // 多类型支持
  releaseDate: string; // YYYY-MM-DD
  region: MovieRegion;
  director: string;
  actors: string[];
  description: string;
  rating: number; // 评分 0-10
  collectCount: number; // 收藏数
  ratingDistribution: { // 评分星级分布统计
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  keywords: { text: string; value: number }[]; // 词云关键词及权重
}

/**
 * 评论模型
 */
export interface Comment {
  id: string;
  movieId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  timestamp: number;
  parentId?: string; // 父级评论 ID（用于回复功能）
  likes: number; // 点赞数
}

/**
 * 资讯新闻模型
 */
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  coverUrl: string;
  date: string;
  tag: string;
}