import apiClient from '../../../lib/axios'

export interface ReportPriorityLevel {
  THONG_THUONG: string
  KHAN_CAP: string
}

export interface ReportStatus {
  DA_GUI: string
  DA_TIEP_NHAN: string
  DANG_XU_LY: string
  DA_GIAI_QUYET: string
  DONG: string
}

export interface ReportCategoryItem {
  id: string
  ten: string
}

export interface ReportMetadata {
  PHAN_ANH_MUC_DO: ReportPriorityLevel
  PHAN_ANH_STATUS: ReportStatus
  LINH_VUC_PHAN_ANH: ReportCategoryItem[]
}

export interface GetReportMetadataResponse {
  success: boolean
  data: ReportMetadata
  message: string
  pagination: null
}

export const reportMetadataApi = {
  getReportMetadata: async (): Promise<ReportMetadata> => {
    const response = await apiClient.get<GetReportMetadataResponse>(
      '/phan-anh/muc-do-trang-thai-linh-vuc'
    )
    
    // API returns { success, data, message, pagination }
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy dữ liệu phản ánh')
  },
}

