import apiClient from '../../../lib/axios'

export interface ReportDetail {
  id: string
  ma_phan_anh: string
  id_linh_vuc_phan_anh: string
  phan_hoi?: string | null
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
  videos?: {
    id: string
    status: string
    final_mp4_url: string
    final_hls_url: string
    created_at: string
    updated_at: string
  }[]
  lich_su_trang_thai: {
    ten: string
    thoi_gian_tao: string
  }[]
  linh_vuc_phan_anh: {
    id: string
    ten: string
  }
  trang_thai_hien_tai: {
    id: string
    ten: string
    mo_ta: string
  }
  dinh_kem_phan_anh: {
    dinh_dang_file: string
    url_file: string
    kich_thuoc_file_mb: string
  }[]
}

export interface GetReportByCodeResponse {
  success: boolean
  data: ReportDetail
  message: string
  pagination: null
}

export const getReportByCode = async (maPhanAnh: string): Promise<ReportDetail> => {
  const response = await apiClient.get<GetReportByCodeResponse>(
    `/phan-anh/${maPhanAnh}/for-mobile`
  )

  if (response.data.success && response.data.data) {
    return response.data.data
  }

  throw new Error(response.data.message || 'Không tìm thấy phản ánh')
}
