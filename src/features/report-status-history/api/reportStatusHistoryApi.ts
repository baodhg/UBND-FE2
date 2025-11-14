import apiClient from '../../../lib/axios'

export interface ReportStatusHistory {
  id: string
  id_phan_anh: string
  trang_thai: string
  mo_ta: string
  nguoi_thuc_hien: string
  thoi_gian: string
  created_at?: string
  updated_at?: string
}

export interface GetReportStatusHistoryResponse {
  success: boolean
  data: ReportStatusHistory[]
  message: string
  pagination: null
}

export const reportStatusHistoryApi = {
  getReportStatusHistory: async (idPhanAnh: string): Promise<ReportStatusHistory[]> => {
    const response = await apiClient.get<GetReportStatusHistoryResponse>(
      `/phan-anh/${idPhanAnh}/lich-su-trang-thai`
    )
    
    // API returns { success, data, message, pagination }
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy lịch sử trạng thái')
  },
}

