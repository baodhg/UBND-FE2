import apiClient from '../../../lib/axios'

export interface LoginRequest {
  tenDangNhap: string
  matKhau: string
}

export interface LoginResponse {
  success: boolean
  data: {
    access_token: string
    refresh_token: string
  }
  message: string
  pagination: null
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auths/login', credentials)
    return response.data
  },
}

