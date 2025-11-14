import apiClient from '../../../lib/axios'

export interface ReportPriorityLevels {
  THONG_THUONG: string
  KHAN_CAP: string
}

export interface GetReportPriorityLevelsResponse {
  success: boolean
  data: ReportPriorityLevels
  message: string
  pagination: null
}

export const reportPriorityLevelsApi = {
  getReportPriorityLevels: async (): Promise<ReportPriorityLevels> => {
    const response = await apiClient.get<GetReportPriorityLevelsResponse>(
      '/phan-anh/muc-do'
    )
    
    // API returns { success, data, message, pagination }
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy mức độ phản ánh')
  },
}

