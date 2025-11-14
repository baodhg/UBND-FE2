import { useQuery } from '@tanstack/react-query'
import { getReportByCode } from '../api/getReportByCode'

export const useGetReportByCode = (maPhanAnh: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['report', maPhanAnh],
    queryFn: () => getReportByCode(maPhanAnh),
    enabled: enabled && !!maPhanAnh,
    retry: false,
    staleTime: 30000, // 30 seconds
  })
}
