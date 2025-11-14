import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { reportCategoriesApi } from '../api/reportCategoriesApi'
import { setCategoryDetail, setLoadingDetail, setErrorDetail } from '../store/reportCategoriesSlice'

export const useReportCategoryById = (id: string | null) => {
  const dispatch = useAppDispatch()
  const { categoryDetail, isLoadingDetail, errorDetail } = useAppSelector(
    (state) => state.reportCategories
  )

  const query = useQuery({
    queryKey: ['reportCategory', id],
    queryFn: async () => {
      if (!id) {
        return null
      }
      
      dispatch(setLoadingDetail(true))
      try {
        const category = await reportCategoriesApi.getReportCategoryById(id)
        dispatch(setCategoryDetail(category))
        return category
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra'
        dispatch(setErrorDetail(errorMessage))
        throw err
      }
    },
    enabled: !!id, // Only fetch if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  return {
    categoryDetail: categoryDetail || query.data || null,
    isLoading: isLoadingDetail || query.isLoading,
    error: errorDetail || (query.error ? 'Có lỗi xảy ra khi tải chi tiết lĩnh vực' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

