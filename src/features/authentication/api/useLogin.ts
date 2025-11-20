import { useMutation } from '@tanstack/react-query'
import { useAppDispatch } from '../../../store/hooks'
import { useNavigate } from 'react-router-dom'
import { setCredentials } from '../store/authSlice'
import { authApi, type LoginRequest } from './authApi'

export const useLogin = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      // Save tokens to localStorage
      localStorage.setItem('token', data.data.access_token)
      localStorage.setItem('refresh_token', data.data.refresh_token)
      
      // Extract user info from token (JWT) - basic parsing
      // In production, you might want to decode the JWT properly
      try {
        const tokenPayload = JSON.parse(atob(data.data.access_token.split('.')[1]))
        
        // Log token payload for debugging
        console.log('Token payload:', {
          userId: tokenPayload.userId,
          username: tokenPayload.username,
          email: tokenPayload.email,
          role: tokenPayload.role,
          sub: tokenPayload.sub,
          exp: tokenPayload.exp ? new Date(tokenPayload.exp * 1000).toISOString() : null,
          allFields: Object.keys(tokenPayload),
        })
        
        const user = {
          id: tokenPayload.userId || tokenPayload.sub || null,
          email: tokenPayload.email || tokenPayload.username || null,
          name: tokenPayload.name || tokenPayload.username || null,
        }
        
        console.log('Extracted user info:', user)
        
        dispatch(setCredentials({ user, token: data.data.access_token }))
        
        // Redirect to dashboard after successful login
        navigate('/dashboard')
      } catch (error) {
        console.error('Error parsing token:', error)
        // Fallback: still save token but with minimal user info
        dispatch(setCredentials({ 
          user: { id: null, email: null, name: null }, 
          token: data.data.access_token 
        }))
        navigate('/dashboard')
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error)
      // Error handling is done in the component
    },
  })
}

