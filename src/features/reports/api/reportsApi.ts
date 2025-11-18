import apiClient from '../../../lib/axios'

export interface CreateReportRequest {
  idLinhVucPhanAnh: string
  tieuDe: string
  moTa: string
  viTri: string
  mucDo: string
  tenNguoiPhanAnh?: string
  soDienThoaiNguoiPhanAnh?: string
  userId?: string
  idVideo?: string[]
}

export interface CreateReportResponse {
  success: boolean
  data: {
    id: string
    ma_phan_anh: string
    id_linh_vuc_phan_anh: string
    tieu_de: string
    mo_ta: string
    vi_tri: string
    muc_do: string
    ten_nguoi_phan_anh: string | null
    sdt_nguoi_phan_anh: string | null
    thoi_gian_tiep_nhan: string | null
    thoi_gian_phan_hoi_du_kien: string | null
    ngay_du_kien_hoan_thanh: string | null
    nguoi_cap_nhat: string | null
    nguoi_tao: string | null
    thoi_gian_tao: string
    thoi_gian_cap_nhat: string
    id_video: string[]
    lich_su_trang_thai: any[]
  }
  message: string
  pagination: null
}

export const reportsApi = {
  createReport: async (
    data: CreateReportRequest, 
    images?: File[]
  ): Promise<CreateReportResponse['data']> => {
    const formData = new FormData()
    
    // Append text fields
    formData.append('idLinhVucPhanAnh', data.idLinhVucPhanAnh)
    formData.append('tieuDe', data.tieuDe)
    formData.append('moTa', data.moTa)
    formData.append('viTri', data.viTri)
    formData.append('mucDo', data.mucDo)
    
    if (data.tenNguoiPhanAnh) {
      formData.append('tenNguoiPhanAnh', data.tenNguoiPhanAnh)
    }
    if (data.soDienThoaiNguoiPhanAnh) {
      formData.append('soDienThoaiNguoiPhanAnh', data.soDienThoaiNguoiPhanAnh)
    }
    if (data.userId) {
      formData.append('userId', data.userId)
    }
    if (data.idVideo && data.idVideo.length > 0) {
      data.idVideo.forEach(id => formData.append('idVideo', id))
    }
    
    // Append image files with field name "file"
    if (images && images.length > 0) {
      images.forEach(file => {
        formData.append('file', file)
      })
    }
    
    // Debug: Log FormData contents
    console.log('FormData contents:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, value.name, `(${(value.size / 1024 / 1024).toFixed(2)} MB)`, value.type)
      } else {
        console.log(`${key}:`, value)
      }
    }
    
    // Don't set Content-Type header manually - let browser set it with boundary
    try {
      const response = await apiClient.post<CreateReportResponse>('/phan-anh', formData)
      
      if (response.data.success && response.data.data) {
        return response.data.data
      }
      
      throw new Error(response.data.message || 'Có lỗi xảy ra khi gửi phản ánh')
    } catch (error: any) {
      // Log detailed error information
      console.error('API Error Details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.response?.data?.message,
        errors: error?.response?.data?.errors,
      })
      throw error
    }
  },
}
