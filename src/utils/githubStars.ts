// GitHub Star 数获取和缓存工具

const DB_NAME = 'leetcode-animation-db';
const DB_VERSION = 2; // 升级版本以创建所有需要的 store
const STARS_STORE = 'github-stars';
const PREFS_STORE = 'user-preferences';
const CACHE_KEY = 'stars-cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1小时

interface StarCache {
  stars: number;
  timestamp: number;
}

// 打开 IndexedDB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // 创建所有需要的 object store
      if (!db.objectStoreNames.contains(STARS_STORE)) {
        db.createObjectStore(STARS_STORE);
      }
      if (!db.objectStoreNames.contains(PREFS_STORE)) {
        db.createObjectStore(PREFS_STORE);
      }
    };
  });
};

// 从缓存获取 Star 数
const getFromCache = async (): Promise<StarCache | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STARS_STORE, 'readonly');
      const store = transaction.objectStore(STARS_STORE);
      const request = store.get(CACHE_KEY);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch {
    return null;
  }
};

// 保存到缓存
const saveToCache = async (stars: number): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STARS_STORE, 'readwrite');
      const store = transaction.objectStore(STARS_STORE);
      const cache: StarCache = { stars, timestamp: Date.now() };
      const request = store.put(cache, CACHE_KEY);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch {
    // 忽略缓存保存错误
  }
};

// 从 GitHub API 获取 Star 数
const fetchStarsFromAPI = async (owner: string, repo: string): Promise<number> => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!response.ok) {
    throw new Error('Failed to fetch stars');
  }
  const data = await response.json();
  return data.stargazers_count || 0;
};

// 获取 GitHub Star 数（带缓存）
export const getGitHubStars = async (owner: string, repo: string): Promise<number> => {
  // 先检查缓存
  const cached = await getFromCache();
  const now = Date.now();
  
  // 如果缓存有效（1小时内），直接返回
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.stars;
  }
  
  // 尝试从 API 获取
  try {
    const stars = await fetchStarsFromAPI(owner, repo);
    await saveToCache(stars);
    return stars;
  } catch {
    // API 获取失败，返回缓存值或默认值
    if (cached) {
      return cached.stars;
    }
    return 0;
  }
};
