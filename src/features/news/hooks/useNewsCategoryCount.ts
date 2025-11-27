import { useQuery } from '@tanstack/react-query'
import { newsApi } from '../api/newsApi'

/**
 * Hook to get the count of news items for a specific category
 * Uses size=1 to minimize data transfer while getting totalItems from pagination
 */
export const useNewsCategoryCount = (idDanhMuc?: string) => {
  const query = useQuery({
    queryKey: ['newsCategoryCount', idDanhMuc],
    queryFn: async () => {
      const response = await newsApi.getNewsList({
        page: 1,
        size: 1,
        isActive: true,
        idDanhMuc,
      })
      return response.pagination?.totalItems || 0
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - counts don't change frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
  })

  return {
    count: query.data || 0,
    isLoading: query.isLoading,
    error: query.error,
  }
}

