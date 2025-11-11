import React from 'react'
import { Header } from '../components/organisms/Header'

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebar,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow">
        {sidebar && (
          <aside className="w-64 bg-gray-100 p-4">
            {sidebar}
          </aside>
        )}
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

