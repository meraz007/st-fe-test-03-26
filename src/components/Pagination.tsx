import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageRange(
  current: number,
  total: number,
): (number | 'ellipsis')[] {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const visible = pages.filter(
    p => p === 1 || p === total || Math.abs(p - current) <= 1,
  );

  const result: (number | 'ellipsis')[] = [];
  for (let i = 0; i < visible.length; i++) {
    if (i > 0 && visible[i] - visible[i - 1] > 1) {
      result.push('ellipsis');
    }
    result.push(visible[i]);
  }
  return result;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = getPageRange(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 mt-8 mb-4 flex-wrap"
    >
      <button
        className="glass-panel px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {range.map((item, idx) =>
        item === 'ellipsis' ? (
          <span
            key={`e-${idx}`}
            className="px-2 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className="glass-panel w-9 h-9 flex items-center justify-center text-sm font-medium hover:bg-white/90"
            style={
              item === page
                ? {
                    background: 'var(--primary)',
                    color: '#fff',
                    borderColor: 'var(--primary)',
                  }
                : undefined
            }
          >
            {item}
          </button>
        ),
      )}

      <button
        className="glass-panel px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
