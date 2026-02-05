
import { Logger } from './logger';

// Key prefix to avoid collisions
const PREFIX = 'salesPro_';

class StorageService {
  /**
   * Safe setItem with try-catch for QuotaExceededError
   */
  set<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`${PREFIX}${key}`, serialized);
      return true;
    } catch (error) {
      Logger.error(`Storage Quota Exceeded for key: ${key}`, error);
      
      // Attempt recovery strategies
      try {
        // Strategy 1: If it's an object with 'originalPhotoBase64', try removing it
        if (typeof value === 'object' && value !== null && 'originalPhotoBase64' in value) {
           // eslint-disable-next-line @typescript-eslint/no-unused-vars
           const { originalPhotoBase64, ...rest } = value as any;
           Logger.warn('Attempting to save without heavy image data...');
           localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(rest));
           return true;
        }
      } catch (retryError) {
         Logger.error('Critical storage failure', retryError);
      }
      return false;
    }
  }

  /**
   * Get item with type safety
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`${PREFIX}${key}`);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      Logger.error(`Error reading key: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Check if item exists
   */
  has(key: string): boolean {
    return localStorage.getItem(`${PREFIX}${key}`) !== null;
  }

  /**
   * Remove item
   */
  remove(key: string) {
    localStorage.removeItem(`${PREFIX}${key}`);
  }

  /**
   * Clear all app specific keys
   */
  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    Logger.info('Storage cleared');
  }
}

export const Storage = new StorageService();