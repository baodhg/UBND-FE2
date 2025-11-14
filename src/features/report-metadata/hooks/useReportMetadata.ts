import { useQuery } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { reportMetadataApi } from '../api/reportMetadataApi'
import { setMetadata, setLoading, setError } from '../store/reportMetadataSlice'

export const useReportMetadata = () => {
  const dispatch = useAppDispatch()
  const { metadata, isLoading, error } = useAppSelector(
    (state) => state.reportMetadata
  )

  const query = useQuery({
    queryKey: ['reportMetadata'],
    queryFn: async () => {
      dispatch(setLoading(true))
      try {
        const metadataData = await reportMetadataApi.getReportMetadata()
        dispatch(setMetadata(metadataData))
        return metadataData
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lấy dữ liệu phản ánh'
        dispatch(setError(errorMessage))
        throw err
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (metadata doesn't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  })

  return {
    metadata: metadata || query.data || null,
    priorityLevels: metadata?.PHAN_ANH_MUC_DO || query.data?.PHAN_ANH_MUC_DO || null,
    status: metadata?.PHAN_ANH_STATUS || query.data?.PHAN_ANH_STATUS || null,
    categories: metadata?.LINH_VUC_PHAN_ANH || query.data?.LINH_VUC_PHAN_ANH || [],
    isLoading: isLoading || query.isLoading,
    error: error || (query.error ? 'Có lỗi xảy ra khi lấy dữ liệu phản ánh' : null),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

