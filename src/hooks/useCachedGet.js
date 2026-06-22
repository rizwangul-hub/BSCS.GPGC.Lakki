import { useState, useEffect } from 'react';
import api from '../services/api';

const globalCache = {};

/**
 * Clear the entire global cache (useful on logout)
 */
export const clearApiCache = () => {
  for (const key in globalCache) {
    delete globalCache[key];
  }
};

/**
 * Invalidate cache entries matching a URL pattern (useful after POST/PUT/DELETE)
 */
export const invalidateCache = (urlPattern) => {
  for (const key in globalCache) {
    if (key.includes(urlPattern)) {
      delete globalCache[key];
    }
  }
};

/**
 * Custom hook to fetch and cache GET requests with stale-while-revalidate pattern
 */
export const useCachedGet = (url, params = null) => {
  const cacheKey = url ? (url + (params ? JSON.stringify(params) : '')) : '';
  const cachedData = cacheKey ? globalCache[cacheKey] : null;

  const [data, setData] = useState(cachedData || null);
  const [loading, setLoading] = useState(cacheKey ? !cachedData : false);

  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      if (!globalCache[cacheKey]) {
        setLoading(true);
      }
      try {
        const res = await api.get(url, params ? { params } : undefined);
        if (isMounted) {
          const result = res.data.data !== undefined ? res.data.data : res.data;
          globalCache[cacheKey] = result;
          setData(result);
        }
      } catch (err) {
        console.error('Cache fetch failed for URL:', url, err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [cacheKey, url]);

  const refetch = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await api.get(url, params ? { params } : undefined);
      const result = res.data.data !== undefined ? res.data.data : res.data;
      globalCache[cacheKey] = result;
      setData(result);
    } catch (err) {
      console.error('Refetch failed for URL:', url, err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refetch };
};
