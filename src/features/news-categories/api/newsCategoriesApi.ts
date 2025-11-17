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

export interface Pagination {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export interface GetNewsCategoriesParams {
  isActive?: boolean
  search?: string
}

export interface GetNewsCategoriesResponse {
  success: boolean
  data: NewsCategory[]
  message: string
  pagination: null
}

export interface GetNewsCategoriesWithPaginationParams {
  page: number
  size: number
  isActive?: boolean
  search?: string
}

export interface GetNewsCategoriesWithPaginationResponse {
  success: boolean
  data: NewsCategory[]
  message: string
  pagination: Pagination
}

export interface GetNewsCategoryByIdResponse {
  success: boolean
  data: NewsCategory | null
  message: string
  pagination: null
}

export const newsCategoriesApi = {
  getNewsCategories: async (
    params: GetNewsCategoriesParams = {}
  ): Promise<NewsCategory[]> => {
    const { isActive, search } = params

    const queryParams = new URLSearchParams()
    if (isActive !== undefined) {
      queryParams.append('isActive', isActive.toString())
    }
    if (search) {
      queryParams.append('search', search)
    }

    const queryString = queryParams.toString()
    const url = `/danh-muc-tin-tuc${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<GetNewsCategoriesResponse>(url)

    // API returns { success, data, message, pagination }
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy danh sách danh mục tin tức')
  },
  getNewsCategoriesWithPagination: async (
    params: GetNewsCategoriesWithPaginationParams
  ): Promise<GetNewsCategoriesWithPaginationResponse> => {
    const { page, size, isActive, search } = params

    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('size', size.toString())
    if (isActive !== undefined) {
      queryParams.append('isActive', isActive.toString())
    }
    if (search) {
      queryParams.append('search', search)
    }

    const response = await apiClient.get<GetNewsCategoriesWithPaginationResponse>(
      `/danh-muc-tin-tuc/pagination?${queryParams.toString()}`
    )

    // API returns { success, data, message, pagination }
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data
    }
    
    throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy danh sách danh mục tin tức')
  },
  getNewsCategoryById: async (id: string): Promise<NewsCategory> => {
    const response = await apiClient.get<GetNewsCategoryByIdResponse>(
      `/danh-muc-tin-tuc/${id}`
    )
    
    // API returns { success, data, message, pagination }
    if (response.data.success && response.data.data) {
      return response.data.data
    }
    
    throw new Error(response.data.message || 'Không tìm thấy danh mục tin tức')
  },
}

