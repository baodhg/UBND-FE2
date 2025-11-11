import { useMutation } from '@tanstack/react-query'
import { useAppDispatch } from '../../../store/hooks'
import { setCredentials } from '../store/authSlice'

interface LoginCredentials {
  email: string
  password: string
}

interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
  }
  token: string
}

// Mock API function - replace with actual API call
const loginApi = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          id: '1',
          email: credentials.email,
          name: 'User',
        },
        token: 'mock-token',
      })
    }, 1000)
  })
}

export const useLogin = () => {
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: data.token }))
    },
  })
}

