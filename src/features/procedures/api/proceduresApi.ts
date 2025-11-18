import apiClient from '../../../lib/axios'

export interface CachThuc {
  hinh_thuc_ap_dung: string
  le_phi: string
  thoi_gian_giai_quyet: string
}

export interface Procedure {
  id: string
  ma_thu_tuc: string
  ten_thu_tuc: string
  doi_tuong_thuc_hien: string
  so_quyet_dinh: string
  co_so_dich_vu_cong: string
  so_dien_thoai_co_so: string
  linh_vuc: string[]
  cach_thuc?: CachThuc[]
  is_active: boolean
  thoi_gian_tao: string
}

export interface CoSoDichVuCong {
  id: string
  ten_co_so: string
  dia_chi: string
  so_dien_thoai: string
  mo_ta: string
  link_google_map: string
  is_active: boolean
  is_delete: boolean
  nguoi_tao: string
  nguoi_cap_nhat: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
}

export interface CachThucThucHien {
  id: string
  id_thu_tuc: string
  hinh_thuc_ap_dung: string
  mo_ta_chi_tiet: string
  thoi_gian_giai_quyet: string
  le_phi: string
  ghi_chu_le_phi: string
  is_active: boolean
  is_delete: boolean
  nguoi_tao: string
  nguoi_cap_nhat: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
}

export interface TrinhTuThucHienThuTuc {
  id: string
  id_thu_tuc: string
  ten_buoc: string
  mo_ta_buoc: string
  thu_tu_buoc: number
  is_active: boolean
  is_delete: boolean
  nguoi_tao: string
  nguoi_cap_nhat: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
}

export interface LinhVuc {
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

export interface ThuTucHanhChinhLinhVuc {
  id: string
  id_thu_tuc_hanh_chinh: string
  id_linh_vuc: string
  nguoi_tao: string
  nguoi_cap_nhat: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
  linh_vuc: LinhVuc
}

export interface ThanhPhanHoSo {
  id: string
  id_truong_hop: string
  ten_thanh_phan: string
  mo_ta_chi_tiet: string
  so_luong_ban_chinh: number
  so_luong_ban_sao: number
  ghi_chu: string
  is_active: boolean
  is_delete: boolean
  nguoi_tao: string
  nguoi_cap_nhat: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
}

export interface TruongHopThuTuc {
  id: string
  id_thu_tuc: string
  ten_truong_hop: string
  mo_ta: string
  thu_tu: number
  is_active: boolean
  is_delete: boolean
  nguoi_tao: string
  nguoi_cap_nhat: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
  thanh_phan_ho_so: ThanhPhanHoSo[]
}

export interface ProcedureDetail {
  id: string
  id_co_so_dich_vu_cong: string
  ten_thu_tuc: string
  ma_thu_tuc: string
  doi_tuong_thuc_hien: string
  yeu_cau_dieu_kien_chung: string
  so_quyet_dinh: string
  is_active: boolean
  is_delete: boolean
  nguoi_tao: string
  nguoi_cap_nhat: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
  co_so_dich_vu_cong: CoSoDichVuCong
  cach_thuc_thuc_hien: CachThucThucHien[]
  trinh_tu_thuc_hien_thu_tuc: TrinhTuThucHienThuTuc[]
  thu_tuc_hanh_chinh_mau_don: any[]
  thu_tuc_hanh_chinh_linh_vuc: ThuTucHanhChinhLinhVuc[]
  truong_hop_thu_tuc: TruongHopThuTuc[]
}

export interface Pagination {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export interface GetProceduresParams {
  idLinhVuc?: string
  page?: number
  size?: number
  isActive?: boolean
  search?: string
}

export interface GetProceduresResponse {
  success: boolean
  data: Procedure[]
  message: string
  pagination: Pagination
}

export interface GetProcedureByIdResponse {
  success: boolean
  data: ProcedureDetail
  message: string
  pagination: null
}

export interface GetAllProceduresResponse {
  success: boolean
  data: Procedure[]
  message: string
  pagination: null
}

export const proceduresApi = {
  getProcedures: async (
    params: GetProceduresParams = {}
  ): Promise<GetProceduresResponse> => {
    const { idLinhVuc, page = 1, size = 10, isActive, search } = params

    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('size', size.toString())
    
    if (idLinhVuc) {
      queryParams.append('idLinhVuc', idLinhVuc)
    }
    if (isActive !== undefined) {
      queryParams.append('isActive', isActive.toString())
    }
    if (search) {
      queryParams.append('search', search)
    }

    const response = await apiClient.get<GetProceduresResponse>(
      `/thu-tuc?${queryParams.toString()}`
    )

    // API returns { success, data, message, pagination }
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy danh sách thủ tục')
  },
  getAllProcedures: async (): Promise<Procedure[]> => {
    console.log('🌐 Calling API: /thu-tuc/all')
    const response = await apiClient.get<GetAllProceduresResponse>('/thu-tuc/all')
    
    console.log('📡 Raw API response:', response)
    console.log('📡 Response data:', response.data)
    
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log('✅ API success - returning', response.data.data.length, 'procedures')
      return response.data.data
    }
    
    console.error('❌ API response invalid:', response.data)
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy danh sách thủ tục')
  },
  
  getProcedureById: async (id: string): Promise<ProcedureDetail> => {
    const response = await apiClient.get<GetProcedureByIdResponse>(
      `/thu-tuc/${id}`
    )
    
    // API returns { success, data, message, pagination }
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Không tìm thấy thủ tục')
  },
}

