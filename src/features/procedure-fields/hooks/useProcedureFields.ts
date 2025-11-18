import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { procedureFieldsApi } from '../api/procedureFieldsApi'
import { setFields, setLoading, setError } from '../store/procedureFieldsSlice'

export const useProcedureFields = () => {
  const dispatch = useAppDispatch()
  const { fields, isLoading, error } = useAppSelector(
    (state) => state.procedureFields
  )

  const query = useQuery({
    queryKey: ['procedureFields'],
    queryFn: async () => {
      dispatch(setLoading(true))
      try {
        const data = await procedureFieldsApi.getProcedureFields()
        dispatch(setFields(data))
        return data
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lấy danh sách lĩnh vực'
        dispatch(setError(errorMessage))
        throw err
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  return {
    fields: query.data || fields || [],
    isLoading: isLoading || query.isLoading,
    error: error || (query.error ? 'Có lỗi xảy ra khi lấy danh sách lĩnh vực' : null),
    refetch: query.refetch,
  }
}
