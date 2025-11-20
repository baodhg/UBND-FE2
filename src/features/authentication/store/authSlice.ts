import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  user: {
    id: string | null
    email: string | null
    name: string | null
  } | null
  isAuthenticated: boolean
  token: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthState['user']; token: string }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      // Clear tokens from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

