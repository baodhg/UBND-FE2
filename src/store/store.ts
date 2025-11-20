import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './rootReducer'
import { setCredentials } from '../features/authentication/store/authSlice'

// Load auth state from localStorage on app initialization
const loadAuthState = () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      // Parse JWT token to extract user info
      const tokenPayload = JSON.parse(atob(token.split('.')[1]))
      const user = {
        id: tokenPayload.userId || null,
        email: tokenPayload.username || null,
        name: tokenPayload.username || null,
      }
      return { user, token }
    } catch (error) {
      console.error('Error parsing token from localStorage:', error)
      // Clear invalid token
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      return null
    }
  }
  return null
}

export const store = configureStore({
  reducer: rootReducer,
})

// Restore auth state from localStorage
const authState = loadAuthState()
if (authState) {
  store.dispatch(setCredentials(authState))
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

