import apiClient from '../../../lib/axios'

export interface ReportStatus {
  DA_GUI: string
  DA_TIEP_NHAN: string
  DANG_XU_LY: string
  DA_GIAI_QUYET: string
  DONG: string
}

export interface GetReportStatusResponse {
  success: boolean
  data: ReportStatus
  message: string
  pagination: null
}

export const reportStatusApi = {
  getReportStatus: async (): Promise<ReportStatus> => {
    const response = await apiClient.get<GetReportStatusResponse>(
      '/phan-anh/trang-thai'
    )
    
    // API returns { success, data, message, pagination }
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy trạng thái phản ánh')
  },
}

