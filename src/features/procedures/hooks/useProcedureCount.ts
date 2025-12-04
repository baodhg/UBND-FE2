import { useQuery } from '@tanstack/react-query'
import { proceduresApi } from '../api/proceduresApi'

/**
 * Hook to get the count of procedures for a specific field
 * Uses size=1 to minimize data transfer while getting totalItems from pagination
 */
export const useProcedureCount = (idLinhVuc?: string) => {
  const query = useQuery({
    queryKey: ['procedureCount', idLinhVuc],
    queryFn: async () => {
      const response = await proceduresApi.getProcedures({
        page: 1,
        size: 1,
        isActive: true,
        idLinhVuc,
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
