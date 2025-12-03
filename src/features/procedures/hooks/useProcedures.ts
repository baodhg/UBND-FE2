import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { proceduresApi, type GetProceduresParams } from '../api/proceduresApi'
import { setProcedures, setPagination, setLoading, setError } from '../store/proceduresSlice'

export const useProcedures = (params: GetProceduresParams = {}) => {
  const dispatch = useAppDispatch()
  const { procedures, pagination, isLoading, error } = useAppSelector(
    (state) => state.procedures
  )

  const query = useQuery({
    queryKey: ['procedures', params],
    queryFn: async () => {
      dispatch(setLoading(true))
      try {
        const response = await proceduresApi.getProcedures(params)
        dispatch(setProcedures(response.data))
        dispatch(setPagination(response.pagination))
        return response
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lấy danh sách thủ tục'
        dispatch(setError(errorMessage))
        throw err
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    placeholderData: (previousData) => previousData, // Giữ data cũ khi fetch data mới
  })

  return {
    procedures: query.data?.data || procedures || [],
    pagination: query.data?.pagination || pagination || null,
    isLoading: isLoading || query.isLoading,
    error: error || (query.error ? 'Có lỗi xảy ra khi lấy danh sách thủ tục' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

