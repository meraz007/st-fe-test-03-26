import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import type { Product } from '../types/product';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 800;

interface ProductsState {
  products: Product[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
}

export function useProducts(page: number, category: string, search: string) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    total: 0,
    totalPages: 0,
    isLoading: true,
    isFetching: true,
    error: null,
  });

  const requestId = useRef(0);
  const hasData = useRef(false);

  const load = useCallback(async (p: number, cat: string, q: string) => {
    const id = ++requestId.current;

    setState(prev => ({
      ...prev,
      isFetching: true,
      isLoading: !hasData.current,
      error: null,
    }));

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

        setState(prev => ({
          ...prev,
          isLoading: false,
          isFetching: false,
          error:
            err instanceof Error ? err.message : 'Failed to fetch products',
        }));
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
