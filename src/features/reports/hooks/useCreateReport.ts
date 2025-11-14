import { useMutation } from '@tanstack/react-query'
import { reportsApi, type CreateReportRequest } from '../api/reportsApi'

export const useCreateReport = () => {
  return useMutation({
    mutationFn: ({ data, files }: { data: CreateReportRequest; files?: File[] }) => 
      reportsApi.createReport(data, files),
  })
}
