import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { reportStatusApi } from '../api/reportStatusApi'
import { setStatus, setLoading, setError } from '../store/reportStatusSlice'

export const useReportStatus = () => {
  const dispatch = useAppDispatch()
  const { status, isLoading, error } = useAppSelector(
    (state) => state.reportStatus
  )

  const query = useQuery({
    queryKey: ['reportStatus'],
    queryFn: async () => {
      dispatch(setLoading(true))
      try {
        const statusData = await reportStatusApi.getReportStatus()
        dispatch(setStatus(statusData))
        return statusData
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lấy trạng thái phản ánh'
        dispatch(setError(errorMessage))
        throw err
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (status options don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  })

  return {
    status: status || query.data || null,
    isLoading: isLoading || query.isLoading,
    error: error || (query.error ? 'Có lỗi xảy ra khi lấy trạng thái phản ánh' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

