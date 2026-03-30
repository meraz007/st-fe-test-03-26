import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useProducts } from './hooks/useProducts';
import { ProductCard, SkeletonCard } from './components/ProductCard';
import { Pagination } from './components/Pagination';

const SKELETON_COUNT = 12;

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const { products, total, totalPages, isLoading, isFetching, error, retry } =
    useProducts(page, category, search);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="glass-panel p-6 mb-6">
        <h1 className="text-2xl font-semibold mb-1">Premium Products</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {total > 0
            ? `Browse our collection of ${total} products.`
            : 'Browse our collection.'}
        </p>
      </header>

      <section className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="glass-panel flex items-center px-4 py-3 flex-1 max-w-md">
          <Search
            size={20}
            color="var(--text-muted)"
            className="mr-3 shrink-0"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-base"
            style={{ color: 'var(--text-main)' }}
            aria-label="Search products"
          />
        </div>

        <select
          className="glass-panel px-4 py-3 text-base cursor-pointer"
          style={{ color: 'var(--text-main)', appearance: 'none' }}
          value={category}
          onChange={e => handleCategoryChange(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="" style={{ background: 'var(--surface)' }}>
            All Categories
          </option>
          <option value="electronics" style={{ background: 'var(--surface)' }}>
            Electronics
          </option>
          <option value="clothing" style={{ background: 'var(--surface)' }}>
            Clothing
          </option>
          <option value="home" style={{ background: 'var(--surface)' }}>
            Home
          </option>
          <option value="outdoors" style={{ background: 'var(--surface)' }}>
            Outdoors
          </option>
        </select>

        {isFetching && !isLoading && (
          <div
            className="flex items-center gap-2 px-4 py-3 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            <Loader2 size={16} className="animate-spin" />
            Updating…
          </div>
        )}
      </section>

      <main>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {error && !isLoading && (
          <div className="glass-panel flex flex-col items-center justify-center py-12 px-6 text-center">
            <AlertTriangle size={40} color="var(--error)" className="mb-3" />
            <h2 className="text-lg font-semibold mb-1">
              Failed to load products
            </h2>
            <p
              className="mb-4 text-sm"
              style={{ color: 'var(--text-muted)', maxWidth: '420px' }}
            >
              {error}
            </p>
            <button
              className="btn-primary flex items-center gap-2"
              onClick={retry}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Search size={40} color="var(--text-muted)" className="mb-3" />
            <h2 className="text-lg font-semibold mb-1">No products found</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 transition-opacity duration-200"
              style={{ opacity: isFetching ? 0.6 : 1 }}
            >
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
