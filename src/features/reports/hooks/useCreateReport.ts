import { useMutation } from '@tanstack/react-query'
import { reportsApi, type CreateReportRequest } from '../api/reportsApi'

export const useCreateReport = () => {
  return useMutation({
    mutationFn: ({ 
      data, 
      images
    }: { 
      data: CreateReportRequest
      images?: File[]
    }) => 
      reportsApi.createReport(data, images),
  })
}
