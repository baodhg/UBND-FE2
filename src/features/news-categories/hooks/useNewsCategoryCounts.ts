import { useQuery } from '@tanstack/react-query'
import { newsCategoriesApi } from '../api/newsCategoriesApi'

/**
 * Hook to get news counts for all categories
 */
export const useNewsCategoryCounts = () => {
  const query = useQuery({
    queryKey: ['newsCategoryCounts'],
    queryFn: () => newsCategoriesApi.getNewsCategoryCounts(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })

  return {
    counts: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
