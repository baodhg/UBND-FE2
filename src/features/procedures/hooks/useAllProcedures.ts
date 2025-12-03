import { useQuery } from '@tanstack/react-query'
import { proceduresApi, type Procedure } from '../api/proceduresApi'

/**
 * Hook để lấy TẤT CẢ procedures với pagination
 * Data được cache và không refetch khi component re-render
 */
export const useAllProcedures = () => {
  const query = useQuery({
    queryKey: ['allProcedures'],
    queryFn: async () => {
      console.log('🔄 Fetching all procedures with pagination...')
      
      // Lấy trang đầu tiên để biết tổng số
      const firstResponse = await proceduresApi.getProcedures({
        page: 1,
        size: 100,
        isActive: true
      })
      
      console.log('✅ First page - Total items:', firstResponse.pagination?.totalItems)
      
      let allProceduresData: Procedure[] = [...firstResponse.data]
      
      // Nếu có nhiều trang, lấy tiếp các trang còn lại
      if (firstResponse.pagination && firstResponse.pagination.totalPages > 1) {
        const totalPages = firstResponse.pagination.totalPages
        console.log(`📄 Fetching remaining ${totalPages - 1} pages...`)
        
        const promises = []
        for (let page = 2; page <= totalPages; page++) {
          promises.push(
            proceduresApi.getProcedures({
              page,
              size: 100,
              isActive: true
            })
          )
        }
        
        const remainingResponses = await Promise.all(promises)
        remainingResponses.forEach(response => {
          allProceduresData = [...allProceduresData, ...response.data]
        })
      }
      
      console.log('✅ Total procedures fetched:', allProceduresData.length)
      return allProceduresData
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - data sẽ fresh trong 10 phút
    gcTime: 15 * 60 * 1000, // 15 minutes - cache được giữ 15 phút
    refetchOnMount: false, // Không refetch khi component mount nếu đã có cache
    refetchOnWindowFocus: false, // Không refetch khi window focus
  })

  return {
    procedures: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  }
}
