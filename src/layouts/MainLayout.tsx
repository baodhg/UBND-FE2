import React from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from '../components/organisms/Header'
import { Footer } from '../components/organisms/Footer'
import { ScrollToTopButton } from '../components/atoms/ScrollToTopButton'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation()
  const pathname = location.pathname
  const isLoginPage = pathname === '/login'
  const isDashboardPage = pathname.startsWith('/dashboard')
  const isHomePage = pathname === '/'
  const isProceduresPage = pathname.startsWith('/procedures')
  const isNewsPage = pathname.startsWith('/news')
  const isTrackReportPage = pathname.startsWith('/track-report')
  const isFullWidthPage = isLoginPage || isDashboardPage || isHomePage || isProceduresPage || isNewsPage || isTrackReportPage

  return (
    <div className={`bg-gray-50 flex flex-col min-h-screen ${isFullWidthPage ? 'overflow-x-hidden' : ''}`}>
      <Header />
      <main className={`${isTrackReportPage ? '' : 'flex-grow'} flex flex-col ${isFullWidthPage ? '' : 'px-4 sm:px-6 lg:px-8'}`}>
        {children}
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  )
}
