import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { LoadingSpinner } from './LoadingSkeletons'

/**
 * InfiniteScroll component
 * Automatically loads more data when user scrolls to the bottom
 */
export default function InfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  children,
  loader,
  endMessage,
  threshold = 0.5,
}) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin: '100px',
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <>
      {children}

      {/* Loading trigger and indicator */}
      {hasNextPage && (
        <div ref={ref} className="py-8 flex justify-center">
          {isFetchingNextPage ? (
            loader || (
              <div className="text-center">
                <LoadingSpinner size="md" />
                <p className="mt-2 text-gray-600 text-sm">Loading more...</p>
              </div>
            )
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Load More
            </button>
          )}
        </div>
      )}

      {/* End message */}
      {!hasNextPage && endMessage && (
        <div className="py-8 text-center text-gray-500">{endMessage}</div>
      )}
    </>
  )
}
