import { useMemo } from 'react'
import { useOfficialStoreProducts } from '../hooks/useApi'
import { ProductGridSkeleton } from './LoadingSkeletons'
import InfiniteScroll from './InfiniteScroll'
import LazyImage from './LazyImage'

export default function OfficialStoreGrid({ onProductClick }) {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useOfficialStoreProducts()

  // Flatten all pages of products
  const products = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap(page => page.data?.products || [])
  }, [data])

  const totalCount = data?.pages?.[0]?.pagination?.total || 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h3 className="text-lg text-gray-600">Loading official store products...</h3>
        </div>
        <ProductGridSkeleton count={20} />
      </div>
    )
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
      <div className="text-center py-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-dashed border-orange-200">
        <div className="text-7xl mb-4">🏪</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          The official E-Soko store will be launching soon with premium campus merchandise and verified products.
        </p>
        <div className="bg-white inline-block px-6 py-3 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Check back later for updates</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Official Store Products</h2>
          <p className="text-gray-600 mt-1">Premium verified products from E-Soko</p>
        </div>
        <span className="bg-orange-100 text-orange-800 text-sm font-medium px-4 py-2 rounded-full">
          {totalCount} {totalCount === 1 ? 'product' : 'products'}
        </span>
      </div>

      <InfiniteScroll
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        endMessage={
          <div className="flex flex-col items-center gap-2">
            <p className="font-medium">You've seen all official store products! 🎉</p>
            <p className="text-sm">All {totalCount} products displayed</p>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <OfficialProductCard
              key={product._id}
              product={product}
              onClick={() => onProductClick(product)}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  )
}

function OfficialProductCard({ product, onClick }) {
  const mainImage = product.images?.[0] || '/placeholder-product.jpg'

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border-2 border-orange-100 hover:border-orange-300"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <LazyImage
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          OFFICIAL
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {product.title}
        </h3>

        {/* Price */}
        <p className="text-2xl font-bold text-orange-600">
          KES {product.price?.toLocaleString()}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

        {/* Meta info */}
        <div className="flex items-center justify-between pt-2 text-sm">
          <span className="bg-orange-100 px-3 py-1 rounded-full text-orange-700 font-medium">
            {product.condition || 'Brand New'}
          </span>
          <span className="text-gray-500">{product.category?.name}</span>
        </div>

        {/* Official badge */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified by E-Soko
          </div>
        </div>
      </div>
    </div>
  )
}
