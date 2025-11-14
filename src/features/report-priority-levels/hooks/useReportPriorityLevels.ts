import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { reportPriorityLevelsApi } from '../api/reportPriorityLevelsApi'
import { setPriorityLevels, setLoading, setError } from '../store/reportPriorityLevelsSlice'

export const useReportPriorityLevels = () => {
  const dispatch = useAppDispatch()
  const { priorityLevels, isLoading, error } = useAppSelector(
    (state) => state.reportPriorityLevels
  )

  const query = useQuery({
    queryKey: ['reportPriorityLevels'],
    queryFn: async () => {
      dispatch(setLoading(true))
      try {
        const levels = await reportPriorityLevelsApi.getReportPriorityLevels()
        dispatch(setPriorityLevels(levels))
        return levels
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lấy mức độ phản ánh'
        dispatch(setError(errorMessage))
        throw err
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (priority levels don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  })

  return {
    priorityLevels: priorityLevels || query.data || null,
    isLoading: isLoading || query.isLoading,
    error: error || (query.error ? 'Có lỗi xảy ra khi lấy mức độ phản ánh' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

