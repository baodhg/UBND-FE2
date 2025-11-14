import apiClient from '../../../lib/axios'

export interface ReportCategory {
  id: string
  ten: string
  mo_ta: string | null
  is_active: boolean
  is_delete: boolean
  nguoi_tao: string
  nguoi_cap_nhat: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
}

export interface GetReportCategoriesParams {
  page?: number
  size?: number
  isActive?: boolean
  search?: string
}

export interface Pagination {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export interface GetReportCategoriesResponse {
  success: boolean
  data: ReportCategory[]
  message: string
  pagination: Pagination
}

export interface GetReportCategoryByIdResponse {
  success: boolean
  data: ReportCategory
  message: string
  pagination: null
}

export interface SearchReportCategoriesResponse {
  success: boolean
  data: ReportCategory[]
  message: string
  pagination: null
}

export const reportCategoriesApi = {
  getReportCategories: async (
    params: GetReportCategoriesParams = {}
  ): Promise<GetReportCategoriesResponse> => {
    const { page = 1, size = 10, isActive, search } = params

    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('size', size.toString())
    if (isActive !== undefined) {
      queryParams.append('isActive', isActive.toString())
    }
    if (search) {
      queryParams.append('search', search)
    }

    const response = await apiClient.get<GetReportCategoriesResponse>(
      `/linh-vuc-phan-anh?${queryParams.toString()}`
    )

    // API returns { success, data, message, pagination }
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy danh sách lĩnh vực phản ánh')
  },
  getReportCategoryById: async (id: string): Promise<ReportCategory> => {
    const response = await apiClient.get<GetReportCategoryByIdResponse>(
      `/linh-vuc-phan-anh/${id}`
    )
    
    // API returns { success, data, message, pagination }
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Không tìm thấy lĩnh vực phản ánh')
  },
  searchReportCategories: async (ten: string): Promise<ReportCategory[]> => {
    const response = await apiClient.get<SearchReportCategoriesResponse>(
      `/linh-vuc-phan-anh/search?ten=${encodeURIComponent(ten)}`
    )
    
    // API returns { success, data, message, pagination }
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi tìm kiếm')
  },
}

