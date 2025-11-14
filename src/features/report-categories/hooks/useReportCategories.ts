import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { reportCategoriesApi, type GetReportCategoriesParams } from '../api/reportCategoriesApi'
import { setCategories, setLoading, setError } from '../store/reportCategoriesSlice'

export const useReportCategories = (params: GetReportCategoriesParams = {}) => {
  const dispatch = useAppDispatch()
  const { categories, selectedCategory, isLoading, error } = useAppSelector(
    (state) => state.reportCategories
  )

  const query = useQuery({
    queryKey: ['reportCategories', params],
    queryFn: async () => {
      dispatch(setLoading(true))
      try {
        const response = await reportCategoriesApi.getReportCategories(params)
        dispatch(setCategories(response.data))
        return response
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra'
        dispatch(setError(errorMessage))
        throw err
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  return {
    categories,
    selectedCategory,
    pagination: query.data?.pagination || null,
    isLoading: isLoading || query.isLoading,
    error: error || (query.error ? 'Có lỗi xảy ra khi tải danh sách lĩnh vực' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

