import type { Product } from '../types/product';

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;

  return (
    <article className="overflow-hidden flex flex-col group">
      <div className="relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full rounded-tl-[6px] rounded-tr-[6px] rounded-bl-[4px] rounded-br-[4px] aspect-[4/3] object-cover transition-transform"
          loading="lazy"
        />
        {/* <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
          {product.category}
        </span> */}
      </div>

      <div className="p-2 flex flex-col flex-1 gap-1.5">
        <h3 className="font-normal text-sm leading-5 line-clamp-1 text-[#5A6573]">
          {product.name}
        </h3>
        <p
          className="text-base font-[525] leading-relaxed line-clamp-2 flex-1 text-[#1A2B3D] tracking-[0px]"
        >
          {product.description}
        </p>

        <div className="flex items-end justify-between mt-2">
          <span className="text-xl font-[475] leading-[22px] tracking-[-1%] text-[#1882FF]">
          ৳{product.price}
          </span>
          {/* <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{
              background: inStock
                ? 'rgba(34,197,94,0.1)'
                : 'rgba(239,68,68,0.1)',
              color: inStock ? '#16a34a' : 'var(--error)',
            }}
          >
            {inStock ? `${product.stock} in stock` : 'Out of stock'}
          </span> */}
        </div>
      </div>
    </article>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="w-full aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-5 bg-gray-200 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}
