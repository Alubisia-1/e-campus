import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'

// Categories hook - cached for 30 minutes as they rarely change
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  })
}

// Campuses hook - cached for 30 minutes as they rarely change
export function useCampuses() {
  return useQuery({
    queryKey: ['campuses'],
    queryFn: api.getCampuses,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  })
}

// Products with infinite scroll support
export function useProducts(filters = {}) {
  return useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: ({ pageParam = 1 }) => {
      return api.getProducts({ ...filters, page: pageParam, limit: 12 })
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined
      const { currentPage, totalPages } = lastPage.pagination
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// My listings with pagination
export function useMyListings(token) {
  return useQuery({
    queryKey: ['my-listings', token],
    queryFn: () => api.getMyListings(token),
    enabled: !!token, // Only fetch if token exists
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Single product details
export function useProduct(productId) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => api.getProductById(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Search products with debounce support
export function useSearchProducts(searchQuery, filters = {}) {
  return useQuery({
    queryKey: ['search-products', searchQuery, filters],
    queryFn: () => api.searchProducts(searchQuery, filters),
    enabled: searchQuery?.length >= 2, // Only search if query is at least 2 characters
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Active ads
export function useActiveAds(position) {
  return useQuery({
    queryKey: ['active-ads', position],
    queryFn: () => api.getActiveAds(position),
    enabled: !!position,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for ad rotation
  })
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productData, token }) => api.createProduct(productData, token),
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    },
  })
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, token, data }) => api.deleteProduct(productId, token, data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
    },
  })
}

// Health check
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: api.healthCheck,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
}
