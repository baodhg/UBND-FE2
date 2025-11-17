import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { newsCategoriesApi, type GetNewsCategoriesWithPaginationParams } from '../api/newsCategoriesApi'
import { setCategoriesWithPagination, setPagination, setLoadingPagination, setErrorPagination } from '../store/newsCategoriesSlice'

export const useNewsCategoriesWithPagination = (params: GetNewsCategoriesWithPaginationParams) => {
  const dispatch = useAppDispatch()
  const { categoriesWithPagination, pagination, isLoadingPagination, errorPagination } = useAppSelector(
    (state) => state.newsCategories
  )

  const query = useQuery({
    queryKey: ['newsCategoriesWithPagination', params],
    queryFn: async () => {
      dispatch(setLoadingPagination(true))
      try {
        const response = await newsCategoriesApi.getNewsCategoriesWithPagination(params)
        dispatch(setCategoriesWithPagination(response.data))
        dispatch(setPagination(response.pagination))
        return response
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lấy danh sách danh mục tin tức'
        dispatch(setErrorPagination(errorMessage))
        throw err
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  return {
    categories: categoriesWithPagination || query.data?.data || [],
    pagination: pagination || query.data?.pagination || null,
    isLoading: isLoadingPagination || query.isLoading,
    error: errorPagination || (query.error ? 'Có lỗi xảy ra khi lấy danh sách danh mục tin tức' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

