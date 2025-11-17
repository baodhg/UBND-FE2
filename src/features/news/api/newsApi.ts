import apiClient from '../../../lib/axios'

export interface NewsCategory {
  id: string
  ten_danh_muc: string
  mo_ta: string
  is_active: boolean
  is_delete: boolean
  nguoi_tao: string
  nguoi_cap_nhat: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
}

export interface NewsAttachment {
  // Define structure if needed, currently empty array in response
  [key: string]: any
}

export interface News {
  id: string
  id_danh_muc: string
  tieu_de: string
  noi_dung: string
  tac_gia: string | null
  url_anh_dai_dien: string | null
  is_active: boolean
  is_delete: boolean
  nguoi_tao: string
  nguoi_cap_nhat: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
  is_noti: boolean
  dinh_kem_tin_tuc: NewsAttachment[]
  danh_muc_tin_tuc: NewsCategory
}

export interface Pagination {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export interface GetNewsListParams {
  page?: number
  size?: number
  isActive?: boolean
  idDanhMuc?: string
  search?: string
}

export interface GetNewsListResponse {
  success: boolean
  data: News[]
  message: string
  pagination: Pagination
}

export interface GetNewsByIdResponse {
  success: boolean
  data: News
  message: string
  pagination: null
}

export const newsApi = {
  getNewsList: async (
    params: GetNewsListParams = {}
  ): Promise<GetNewsListResponse> => {
    const { page = 1, size = 10, isActive, idDanhMuc, search } = params

    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('size', size.toString())
    if (isActive !== undefined) {
      queryParams.append('isActive', isActive.toString())
    }
    if (idDanhMuc) {
      queryParams.append('idDanhMuc', idDanhMuc)
    }
    if (search) {
      queryParams.append('search', search)
    }

    const response = await apiClient.get<GetNewsListResponse>(
      `/tin-tuc?${queryParams.toString()}`
    )

    // API returns { success, data, message, pagination }
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy danh sách tin tức')
  },
  getNewsById: async (id: string): Promise<News> => {
    const response = await apiClient.get<GetNewsByIdResponse>(
      `/tin-tuc/${id}`
    )
    
    // API returns { success, data, message, pagination }
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Không tìm thấy tin tức')
  },
}

