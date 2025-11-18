import { useQuery } from '@tanstack/react-query'
import { useAppDispatch } from '../../../store/hooks'
import { newsApi } from '../api/newsApi'
import { setNewsDetail, setCurrentNewsId, setLoading, setError } from '../store/newsSlice'

export const useNewsById = (id: string | null) => {
  const dispatch = useAppDispatch()

  const query = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      if (!id) {
        return null
      }
      
      dispatch(setLoading(true))
      dispatch(setCurrentNewsId(id))
      
      try {
        const newsData = await newsApi.getNewsById(id)
        dispatch(setNewsDetail(newsData))
        return newsData
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lấy chi tiết tin tức'
        dispatch(setError(errorMessage))
        throw err
      }
    },
    enabled: !!id, // Only run query if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  return {
    news: query.data || null,
    isLoading: query.isLoading,
    error: query.error ? 'Có lỗi xảy ra khi lấy chi tiết tin tức' : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

