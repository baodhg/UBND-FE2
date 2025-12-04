import { useQuery } from '@tanstack/react-query'
import { procedureFieldsApi } from '../api/procedureFieldsApi'

/**
 * Hook to get procedure counts for all fields
 */
export const useProcedureFieldCounts = () => {
  const query = useQuery({
    queryKey: ['procedureFieldCounts'],
    queryFn: () => procedureFieldsApi.getProcedureFieldCounts(),
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
