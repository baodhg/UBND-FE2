import React from 'react'
import { Header } from '../components/organisms/Header'
import { Footer } from '../components/organisms/Footer'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      <main className=" flex-grow container">
        {children}
      </main>
      <Footer />
    </div>
  )
}

