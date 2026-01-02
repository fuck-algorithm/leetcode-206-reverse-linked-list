// 用户偏好设置存储工具

const DB_NAME = 'leetcode-animation-db';
const DB_VERSION = 2; // 与 githubStars.ts 保持一致
const STARS_STORE = 'github-stars';
const PREFS_STORE = 'user-preferences';

export interface UserPreferences {
  animationSpeed: number;
  codeLanguage: 'java' | 'python' | 'golang' | 'javascript';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  animationSpeed: 1,
  codeLanguage: 'java',
};

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

// 获取用户偏好
export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PREFS_STORE, 'readonly');
      const store = transaction.objectStore(PREFS_STORE);
      const request = store.get('preferences');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || DEFAULT_PREFERENCES);
      };
    });
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

// 保存用户偏好
export const saveUserPreferences = async (preferences: Partial<UserPreferences>): Promise<void> => {
  try {
    const db = await openDB();
    const current = await getUserPreferences();
    const updated = { ...current, ...preferences };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PREFS_STORE, 'readwrite');
      const store = transaction.objectStore(PREFS_STORE);
      const request = store.put(updated, 'preferences');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch {
    // 忽略保存错误
  }
};

// 获取动画速度
export const getAnimationSpeed = async (): Promise<number> => {
  const prefs = await getUserPreferences();
  return prefs.animationSpeed;
};

// 保存动画速度
export const saveAnimationSpeed = async (speed: number): Promise<void> => {
  await saveUserPreferences({ animationSpeed: speed });
};

// 获取代码语言
export const getCodeLanguage = async (): Promise<'java' | 'python' | 'golang' | 'javascript'> => {
  const prefs = await getUserPreferences();
  return prefs.codeLanguage;
};

// 保存代码语言
export const saveCodeLanguage = async (language: 'java' | 'python' | 'golang' | 'javascript'): Promise<void> => {
  await saveUserPreferences({ codeLanguage: language });
};
