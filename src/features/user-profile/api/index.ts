import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../../lib/axios'
import { useAppSelector } from '../../../store/hooks'

export interface UserProfile {
  id: string
  ho_va_ten: string
  email: string
  so_dien_thoai: string
  [key: string]: any
}

interface UserProfileResponse {
  data: UserProfile
}

const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfileResponse>('/users/my-profile')
  return response.data.data
}

export const useUserProfile = () => {
  const { token } = useAppSelector((state) => state.auth)

  return useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    // Chỉ fetch profile khi đã có token -> tránh 401 "Access token không được cung cấp"
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })
}

export interface UpdateUserProfilePayload {
  hoVaTen?: string
  soDienThoai?: string
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateUserProfilePayload) => {
      const response = await apiClient.put<UserProfileResponse>('/users', payload)
      return response.data.data
    },
    onSuccess: (data) => {
      // Cập nhật lại cache userProfile để UI sync ngay
      queryClient.setQueryData(['userProfile'], data)
    },
  })
}
