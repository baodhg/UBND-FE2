import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { reportStatusHistoryApi } from '../api/reportStatusHistoryApi'
import { setStatusHistory, setCurrentReportId, setLoading, setError } from '../store/reportStatusHistorySlice'

export const useReportStatusHistory = (idPhanAnh: string | null) => {
  const dispatch = useAppDispatch()
  const { statusHistory, currentReportId, isLoading, error } = useAppSelector(
    (state) => state.reportStatusHistory
  )

  const query = useQuery({
    queryKey: ['reportStatusHistory', idPhanAnh],
    queryFn: async () => {
      if (!idPhanAnh) {
        return []
      }
      
      dispatch(setLoading(true))
      dispatch(setCurrentReportId(idPhanAnh))
      try {
        const history = await reportStatusHistoryApi.getReportStatusHistory(idPhanAnh)
        dispatch(setStatusHistory(history))
        return history
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lấy lịch sử trạng thái'
        dispatch(setError(errorMessage))
        throw err
      }
    },
    enabled: !!idPhanAnh, // Only fetch if idPhanAnh is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  })

  return {
    statusHistory: statusHistory.length > 0 ? statusHistory : (query.data || []),
    currentReportId,
    isLoading: isLoading || query.isLoading,
    error: error || (query.error ? 'Có lỗi xảy ra khi lấy lịch sử trạng thái' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

