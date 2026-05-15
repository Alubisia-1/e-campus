import { useMemo } from 'react'
import { useProducts } from '../hooks/useApi'
import { ProductGridSkeleton } from './LoadingSkeletons'
import InfiniteScroll from './InfiniteScroll'
import LazyImage from './LazyImage'
import SponsoredBadge from './SponsoredBadge'

export default function ProductGrid({ selectedCategory, onProductClick }) {
  // Use React Query hook with filters
  const filters = useMemo(() => {
    const params = {}
    if (selectedCategory) {
      params.category = selectedCategory
    }
    return params
  }, [selectedCategory])

  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProducts(filters)

  // Flatten all pages of products
  const products = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap(page => page.data?.products || [])
  }, [data])

  const totalCount = data?.pages?.[0]?.pagination?.total || 0

  if (isLoading) {
    return <ProductGridSkeleton count={12} />
  }

  if (isError) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load products</h3>
        <p className="text-gray-600 mb-4">{error?.message || 'Please try again later'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200">
        <div className="text-6xl mb-4">🛍️</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No items yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Be the first to list an item on our marketplace!
        </p>
      </div>
    )
  }

  return (
    <InfiniteScroll
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      endMessage={
        <div className="flex flex-col items-center gap-2">
          <p className="font-medium">You've reached the end! 🎉</p>
          <p className="text-sm">All {totalCount} items displayed</p>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>
    </InfiniteScroll>
  )
}

function ProductCard({ product, onClick }) {
  const mainImage = product.images?.[0]?.url || product.images?.[0] || '/placeholder-product.jpg'

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <LazyImage
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.sponsored?.isSponsored && (
          <div className="absolute top-3 right-3">
            <SponsoredBadge size="small" variant="default" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        {/* Price */}
        <p className="text-2xl font-bold text-blue-600">
          KES {product.price?.toLocaleString()}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

        {/* Meta info */}
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-medium">
            {product.condition}
          </span>
          <span className="text-gray-500">{product.category?.name}</span>
        </div>

        {/* Seller info */}
        {product.seller && (
          <div className="flex items-center gap-2 pt-2 text-xs text-gray-500 border-t">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
              {product.seller.username?.[0]?.toUpperCase()}
            </div>
            <span>{product.seller.username}</span>
            {product.seller.campus && (
              <span className="ml-auto text-gray-400">• {product.seller.campus}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
