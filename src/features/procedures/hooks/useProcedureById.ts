import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { proceduresApi } from '../api/proceduresApi'
import { setProcedureDetail, setCurrentProcedureId, setLoadingDetail, setErrorDetail } from '../store/proceduresSlice'

export const useProcedureById = (id: string | null) => {
  const dispatch = useAppDispatch()
  const { procedureDetail, isLoadingDetail, errorDetail } = useAppSelector(
    (state) => state.procedures
  )

  const query = useQuery({
    queryKey: ['procedure', id],
    queryFn: async () => {
      if (!id) {
        return null
      }
      
      dispatch(setLoadingDetail(true))
      dispatch(setCurrentProcedureId(id))
      
      try {
        const procedureData = await proceduresApi.getProcedureById(id)
        dispatch(setProcedureDetail(procedureData))
        return procedureData
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lấy chi tiết thủ tục'
        dispatch(setErrorDetail(errorMessage))
        throw err
      }
    },
    enabled: !!id, // Only run query if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  return {
    procedure: query.data || procedureDetail || null,
    isLoading: isLoadingDetail || query.isLoading,
    error: errorDetail || (query.error ? 'Có lỗi xảy ra khi lấy chi tiết thủ tục' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

