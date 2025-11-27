import { useQuery } from '@tanstack/react-query'
import { searchReportsByTitle } from '../api/searchReportsByTitle'

export const useSearchReportsByTitle = (search: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['searchReports', search],
    queryFn: () => searchReportsByTitle(search),
    enabled: enabled && !!search && search.trim().length > 0,
    retry: false,
    staleTime: 30000, // 30 seconds
  })
}

