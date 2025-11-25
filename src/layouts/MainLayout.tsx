import React from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from '../components/organisms/Header'
import { Footer } from '../components/organisms/Footer'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className={`bg-gray-50 flex flex-col ${isLoginPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Header />
      <main className="flex-grow flex flex-col overflow-hidden">
        {children}
      </main>
      <Footer />
    </div>
  )
}
