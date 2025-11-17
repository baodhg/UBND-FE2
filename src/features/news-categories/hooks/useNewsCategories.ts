import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { newsCategoriesApi, type GetNewsCategoriesParams } from '../api/newsCategoriesApi'
import { setCategories, setLoading, setError } from '../store/newsCategoriesSlice'

export const useNewsCategories = (params: GetNewsCategoriesParams = {}) => {
  const dispatch = useAppDispatch()
  const { categories, selectedCategory, isLoading, error } = useAppSelector(
    (state) => state.newsCategories
  )

  const query = useQuery({
    queryKey: ['newsCategories', params],
    queryFn: async () => {
      dispatch(setLoading(true))
      try {
        const categoriesData = await newsCategoriesApi.getNewsCategories(params)
        dispatch(setCategories(categoriesData))
        return categoriesData
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lấy danh sách danh mục tin tức'
        dispatch(setError(errorMessage))
        throw err
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  })

  return {
    categories: categories || query.data || [],
    selectedCategory,
    isLoading: isLoading || query.isLoading,
    error: error || (query.error ? 'Có lỗi xảy ra khi lấy danh sách danh mục tin tức' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

