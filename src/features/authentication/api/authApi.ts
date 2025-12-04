import apiClient from '../../../lib/axios'

export interface LoginRequest {
  tenDangNhap: string
  matKhau: string
  recaptchaToken?: string
}

interface RawLoginResponse {
  success: boolean
  data: {
    access_token?: string
    refresh_token?: string
    accessToken?: string
    refreshToken?: string
  }
  message: string
  pagination: null
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

const normalizeLoginResponse = (response: RawLoginResponse): LoginResponse => {
  const rawData = response?.data ?? {}
  const accessToken =
    rawData.access_token ||
    rawData.accessToken ||
    (response as any).access_token ||
    (response as any).accessToken
  const refreshToken =
    rawData.refresh_token ||
    rawData.refreshToken ||
    (response as any).refresh_token ||
    (response as any).refreshToken

  if (!response.success) {
    throw new Error(response.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
  }

  if (!accessToken || !refreshToken) {
    console.error('Login response is missing tokens:', response)
    throw new Error('Máy chủ không trả về token đăng nhập hợp lệ.')
  }

  return {
    ...response,
    data: {
      ...rawData,
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  }
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const endpoint = credentials.recaptchaToken ? '/auths/login-with-captcha' : '/auths/login'
    const response = await apiClient.post<RawLoginResponse>(endpoint, credentials)
    return normalizeLoginResponse(response.data)
  },
}

