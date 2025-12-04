import apiClient from '../../../lib/axios'

export interface ProcedureField {
  id: string
  ten_linh_vuc: string
  mo_ta: string
  is_active: boolean
  is_delete: boolean
  nguoi_tao: string
  nguoi_cap_nhat: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
}

export interface GetProcedureFieldsResponse {
  success: boolean
  data: ProcedureField[]
  message: string
  pagination: null
}

export interface ProcedureFieldCount {
  id: string
  ten_linh_vuc: string
  tong_thu_tuc: number
}

export interface GetProcedureFieldCountsResponse {
  success: boolean
  data: ProcedureFieldCount[]
  message: string
}

export const procedureFieldsApi = {
  getProcedureFields: async (): Promise<ProcedureField[]> => {
    const response = await apiClient.get<GetProcedureFieldsResponse>('/linh-vuc')

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy danh sách lĩnh vực')
  },

  getProcedureFieldCounts: async (): Promise<ProcedureFieldCount[]> => {
    const response = await apiClient.get<GetProcedureFieldCountsResponse>('/linh-vuc/count-thu-tuc')

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy số lượng thủ tục')
  },
}
