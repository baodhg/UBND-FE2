import React, { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAppSelector } from '../store/hooks'

interface AuthContextType {
  isAuthenticated: boolean
  user: {
    id: string | null
    email: string | null
    name: string | null
  } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

