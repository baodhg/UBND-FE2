import apiClient from '../../../lib/axios'

export interface Report {
  id: string
  ma_phan_anh: string
  id_linh_vuc_phan_anh: string
  tieu_de: string
  mo_ta: string
  vi_tri: string
  muc_do: string
  ten_nguoi_phan_anh: string | null
  sdt_nguoi_phan_anh: string | null
  trang_thai: string
  thoi_gian_tiep_nhan: string | null
  thoi_gian_phan_hoi_du_kien: string | null
  ngay_du_kien_hoan_thanh: string | null
  thoi_gian_tao: string
  thoi_gian_cap_nhat: string
  linh_vuc?: {
    id: string
    ten_linh_vuc: string
  }
}

export interface Pagination {
  currentPage: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export interface GetReportsListParams {
  page?: number
  size?: number
  idLinhVucPhanAnh?: string
  trangThai?: string
  mucDo?: string
  maPhanAnh?: string
  sortTime?: 'desc' | 'asc' // "desc": mới nhất trước (mặc định), "asc": cũ nhất trước
  search?: string // Optional: có thể backend hỗ trợ search chung
}

export interface GetReportsListResponse {
  success: boolean
  data: Report[]
  message: string
  pagination: Pagination | null
}

export const getReportsList = async (
  params: GetReportsListParams = {}
): Promise<GetReportsListResponse> => {
  const { 
    page = 1, 
    size = 10, 
    idLinhVucPhanAnh,
    trangThai, 
    mucDo, 
    maPhanAnh,
    sortTime = 'desc', // Mặc định: mới nhất trước
    search 
  } = params

  const queryParams = new URLSearchParams()
  queryParams.append('page', page.toString())
  queryParams.append('size', size.toString())
  queryParams.append('sortTime', sortTime)
  
  if (idLinhVucPhanAnh) {
    queryParams.append('idLinhVucPhanAnh', idLinhVucPhanAnh)
  }
  if (trangThai) {
    queryParams.append('trangThai', trangThai)
  }
  if (mucDo) {
    queryParams.append('mucDo', mucDo)
  }
  if (maPhanAnh) {
    queryParams.append('maPhanAnh', maPhanAnh)
  }
  if (search) {
    queryParams.append('search', search)
  }

  // Try different endpoints based on availability
  // Priority: user/me endpoint first (for dashboard), then main endpoint
  const endpoints = [
    `/phan-anh/user/me?${queryParams.toString()}`, // Get reports for current user (best for dashboard)
    `/phan-anh?${queryParams.toString()}`, // Main endpoint (for admin/web)
    `/phan-anh/for-web?${queryParams.toString()}`, // Web endpoint
    `/phan-anh/for-mobile?${queryParams.toString()}`, // Mobile endpoint
  ]

  let lastError: any = null

  for (const endpoint of endpoints) {
    try {
      const response = await apiClient.get<GetReportsListResponse>(endpoint)

      if (response.data.success && Array.isArray(response.data.data)) {
        console.log('Successfully fetched reports from:', endpoint)
        return response.data
      }

      throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy danh sách phản ánh')
    } catch (error: any) {
      lastError = error
      
      // If 403, try next endpoint
      if (error?.response?.status === 403) {
        console.warn(`403 Forbidden for endpoint: ${endpoint}, trying next...`)
        continue
      }
      
      // For other errors, log and throw immediately
      if (error?.response?.status !== 403) {
        console.error('Error fetching reports list:', {
          endpoint,
          status: error?.response?.status,
          message: error?.response?.data?.message,
        })
        throw error
      }
    }
  }

  // If all endpoints failed with 403, log and throw
  if (lastError?.response?.status === 403) {
    console.error('All endpoints returned 403 Forbidden:', {
      triedEndpoints: endpoints,
      params,
      errorData: lastError?.response?.data,
      message: lastError?.response?.data?.message,
    })
  }

  throw lastError || new Error('Có lỗi xảy ra khi lấy danh sách phản ánh')
}

