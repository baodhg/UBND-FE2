import apiClient from '../../../lib/axios'

export interface SearchResultItem {
  id: string
  ma_phan_anh: string
  tieu_de: string
  mo_ta: string
}

export interface SearchReportsByTitleResponse {
  success: boolean
  data: SearchResultItem[]
  message: string
  pagination: null
}

export const searchReportsByTitle = async (search: string): Promise<SearchResultItem> => {
  const response = await apiClient.get<SearchReportsByTitleResponse>(
    `/phan-anh/search-by-tieu-de`,
    {
      params: { search }
    }
  )

  if (response.data.success && response.data.data && response.data.data.length > 0) {
    // Return first item from array
    return response.data.data[0]
  }

  throw new Error(response.data.message || 'Không tìm thấy phản ánh')
}

