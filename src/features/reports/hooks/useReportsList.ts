import { useQuery } from '@tanstack/react-query'
import { getReportsList, type GetReportsListParams } from '../api/getReportsList'

export const useReportsList = (params: GetReportsListParams = {}) => {
  const query = useQuery({
    queryKey: ['reportsList', params],
    queryFn: async () => {
      return await getReportsList(params)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 403 or 401 errors
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false
      }
      return failureCount < 2
    },
  })

  const getErrorMessage = () => {
    if (!query.error) return null
    const error: any = query.error
    if (error?.response?.status === 403) {
      return 'Bạn không có quyền truy cập danh sách phản ánh. Vui lòng kiểm tra lại quyền truy cập.'
    }
    if (error?.response?.status === 401) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    }
    return error?.response?.data?.message || 'Có lỗi xảy ra khi lấy danh sách phản ánh'
  }

  return {
    reports: query.data?.data || [],
    pagination: query.data?.pagination || null,
    isLoading: query.isLoading,
    error: getErrorMessage(),
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}

