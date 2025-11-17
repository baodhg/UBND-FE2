import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { newsApi, type GetNewsListParams } from '../api/newsApi'
import { setNewsList, setPagination, setLoadingList, setErrorList } from '../store/newsSlice'

export const useNewsList = (params: GetNewsListParams = {}) => {
  const dispatch = useAppDispatch()
  const { newsList, pagination, isLoadingList, errorList } = useAppSelector(
    (state) => state.news
  )

  const query = useQuery({
    queryKey: ['newsList', params],
    queryFn: async () => {
      dispatch(setLoadingList(true))
      try {
        const response = await newsApi.getNewsList(params)
        dispatch(setNewsList(response.data))
        dispatch(setPagination(response.pagination))
        return response
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lấy danh sách tin tức'
        dispatch(setErrorList(errorMessage))
        throw err
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  return {
    newsList: newsList || query.data?.data || [],
    pagination: pagination || query.data?.pagination || null,
    isLoading: isLoadingList || query.isLoading,
    error: errorList || (query.error ? 'Có lỗi xảy ra khi lấy danh sách tin tức' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

