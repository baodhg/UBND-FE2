import { useMutation } from '@tanstack/react-query'
import { useAppDispatch } from '../../../store/hooks'
import { setCredentials } from '../store/authSlice'

interface RegisterCredentials {
  email: string
  password: string
  name: string
}

interface RegisterResponse {
  user: {
    id: string
    email: string
    name: string
  }
  token: string
}

// Mock API function - replace with actual API call
const registerApi = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          id: '1',
          email: credentials.email,
          name: credentials.name,
        },
        token: 'mock-token',
      })
    }, 1000)
  })
}

export const useRegister = () => {
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      dispatch(setCredentials({ user: data.user, token: data.token }))
    },
  })
}

