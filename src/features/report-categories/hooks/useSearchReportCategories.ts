import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { reportCategoriesApi } from '../api/reportCategoriesApi'
import { setSearchResults, setSearchQuery, setSearching, setSearchError } from '../store/reportCategoriesSlice'

export const useSearchReportCategories = (ten: string | null) => {
  const dispatch = useAppDispatch()
  const { searchResults, searchQuery, isSearching, searchError } = useAppSelector(
    (state) => state.reportCategories
  )

  const query = useQuery({
    queryKey: ['searchReportCategories', ten],
    queryFn: async () => {
      if (!ten || ten.trim() === '') {
        dispatch(setSearchResults([]))
        dispatch(setSearchQuery(null))
        return []
      }
      
      dispatch(setSearching(true))
      dispatch(setSearchQuery(ten))
      try {
        const results = await reportCategoriesApi.searchReportCategories(ten)
        dispatch(setSearchResults(results))
        return results
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tìm kiếm'
        dispatch(setSearchError(errorMessage))
        throw err
      }
    },
    enabled: !!ten && ten.trim() !== '', // Only fetch if ten is provided and not empty
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  })

  return {
    searchResults: searchResults.length > 0 ? searchResults : (query.data || []),
    searchQuery,
    isLoading: isSearching || query.isLoading,
    error: searchError || (query.error ? 'Có lỗi xảy ra khi tìm kiếm' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

