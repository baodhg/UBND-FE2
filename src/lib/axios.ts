import axios from 'axios'
import { getApiBaseUrl } from '../utils/url'

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/auths/login',
  '/auths/register',
]

// Check if endpoint is public
const isPublicEndpoint = (url: string | undefined, method?: string): boolean => {
  if (!url) return false
  
  // Auth endpoints are always public
  if (PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint))) {
    return true
  }
  
  // GET /tin-tuc* (news) endpoints are public
  if (url.includes('/tin-tuc') && method?.toLowerCase() === 'get') {
    return true
  }
  
  // GET /danh-muc-tin-tuc* (news categories) endpoints are public
  if (url.includes('/danh-muc-tin-tuc') && method?.toLowerCase() === 'get') {
    return true
  }
  
  // GET /thu-tuc-hanh-chinh* (procedures) endpoints are public
  if (url.includes('/thu-tuc-hanh-chinh') && method?.toLowerCase() === 'get') {
    return true
  }
  
  // GET /linh-vuc* (procedure fields) endpoints are public
  if (url.includes('/linh-vuc') && method?.toLowerCase() === 'get') {
    return true
  }
  
  // POST /phan-anh (submit report) is public
  if (url.includes('/phan-anh') && method?.toLowerCase() === 'post') {
    return true
  }
  
  // GET /phan-anh/{code}/for-mobile (track report) is public
  if (url.includes('/phan-anh') && url.includes('/for-mobile') && method?.toLowerCase() === 'get') {
    return true
  }
  
  return false
}

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // Debug: Log token info (first 20 chars only for security)
      if (import.meta.env.DEV) {
        console.log('API Request:', {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          tokenPreview: token.substring(0, 20) + '...',
        })
      }
    } else {
      // Only warn if endpoint requires authentication
      if (!isPublicEndpoint(config.url, config.method)) {
        console.warn('No token found in localStorage for request:', config.url)
      }
    }
    
    // If data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      const token = localStorage.getItem('token')

      // Chỉ clear token và redirect khi THỰC SỰ đang có token (token hết hạn / không hợp lệ)
      if (token) {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')

        // Tránh vòng lặp reload vô hạn khi đã ở trang login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      } else {
        // Không có token mà vẫn bị 401 (đang là user chưa đăng nhập):
        // -> Không redirect nữa để tránh reload liên tục, chỉ log cảnh báo.
        console.warn('Received 401 without token, staying on current page:', {
          url: error.config?.url,
          path: window.location.pathname,
        })
      }
    }
    if (error.response?.status === 403) {
      // Handle forbidden access - token might be invalid or user doesn't have permission
      const errorData = error.response?.data
      const errorMessage = errorData?.message || 'Bạn không có quyền truy cập tài nguyên này'
      
      console.error('403 Forbidden:', {
        url: error.config?.url,
        message: errorMessage,
        data: errorData,
        hasToken: !!localStorage.getItem('token'),
      })
      
      // Try to decode token to check role
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]))
          console.log('Token payload:', {
            userId: tokenPayload.userId,
            username: tokenPayload.username,
            role: tokenPayload.role,
            exp: new Date(tokenPayload.exp * 1000).toISOString(),
            isExpired: Date.now() > tokenPayload.exp * 1000,
          })
        }
      } catch (e) {
        console.error('Error decoding token:', e)
      }
      
      // Optionally redirect to login if token is clearly invalid
      const token = localStorage.getItem('token')
      if (!token && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

