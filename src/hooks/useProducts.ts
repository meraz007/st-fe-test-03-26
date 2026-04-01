import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import type { Product } from '../types/product';
import type { PaginatedResponse } from '../types/product';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 800;
const CACHE_PREFIX = 'products_cache_';

interface ProductsState {
  products: Product[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
}

function getCacheKey(page: number, category: string, search: string): string {
  return `${CACHE_PREFIX}${page}_${category}_${search}`;
}

function readCache(key: string): PaginatedResponse<Product> | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PaginatedResponse<Product>;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: PaginatedResponse<Product>): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    // storage full — silently ignore
  }
}

export function useProducts(page: number, category: string, search: string) {
  const cacheKey = getCacheKey(page, category, search);
  const cached = readCache(cacheKey);

  const [state, setState] = useState<ProductsState>(() => {
    if (cached) {
      return {
        products: cached.data,
        total: cached.total,
        totalPages: cached.totalPages,
        isLoading: false,
        isFetching: false,
        error: null,
      };
    }
    return {
      products: [],
      total: 0,
      totalPages: 0,
      isLoading: true,
      isFetching: true,
      error: null,
    };
  });

  const requestId = useRef(0);
  const hasData = useRef(!!cached);

  const load = useCallback(async (p: number, cat: string, q: string) => {
    const id = ++requestId.current;
    const key = getCacheKey(p, cat, q);
    const cachedData = readCache(key);

    if (cachedData) {
      hasData.current = true;
      setState({
        products: cachedData.data,
        total: cachedData.total,
        totalPages: cachedData.totalPages,
        isLoading: false,
        isFetching: false,
        error: null,
      });
    } else {
      setState(prev => ({
        ...prev,
        isFetching: true,
        isLoading: !hasData.current,
        error: null,
      }));
    }

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (requestId.current !== id) return;

      try {
        const res = await api.fetchProducts({
          page: p,
          limit: 12,
          category: cat || undefined,
          search: q || undefined,
        });

        if (requestId.current !== id) return;

        writeCache(key, res);
        hasData.current = true;
        setState({
          products: res.data,
          total: res.total,
          totalPages: res.totalPages,
          isLoading: false,
          isFetching: false,
          error: null,
        });
        return;
      } catch (err) {
        if (requestId.current !== id) return;

        if (attempt < MAX_RETRIES) {
          await new Promise(r =>
            setTimeout(r, BASE_DELAY_MS * Math.pow(2, attempt)),
          );
          continue;
        }

        if (cachedData) {
          setState(prev => ({
            ...prev,
            isFetching: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isFetching: false,
            error:
              err instanceof Error ? err.message : 'Failed to fetch products',
          }));
        }
      }
    }
  }, []);

  useEffect(() => {
    load(page, category, search);
  }, [page, category, search, load]);

  const retry = useCallback(() => {
    load(page, category, search);
  }, [page, category, search, load]);

  return { ...state, retry };
}
