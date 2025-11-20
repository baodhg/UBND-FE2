import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { QuocHuy } from '../atoms/QuocHuy'
import { House, FileText, Newspaper, MessageSquare, LogIn, Menu, X } from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

export const Header: React.FC = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems: NavItem[] = [
    { label: 'Trang chủ', path: '/', icon: <House size={18} /> },
    { label: 'Thủ tục hành chính', path: '/procedures', icon: <FileText size={18} /> },
    { label: 'Tin tức', path: '/news', icon: <Newspaper size={18} /> },
    { label: 'Phản ánh', path: '/report', icon: <MessageSquare size={18} /> },
  ]

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Section with Logo and Title */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-8 py-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center">
              <QuocHuy />
            </div>
            <div>
              <h1 className="text-blue-700 text-base lg:text-lg font-bold">
                Phường Tăng Nhơn Phú
              </h1>
              <p className="text-xs text-gray-500">
                Quận 9, TP. Thủ Đức
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" 
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <nav className="hidden lg:flex items-center bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 flex items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path === '/' && location.pathname === '/') ||
                            (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-5 py-4 transition-all relative
                  ${isActive 
                    ? 'bg-blue-800 text-white shadow-lg' 
                    : 'text-blue-50 hover:bg-blue-700 hover:text-white'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400"></div>
                )}
              </Link>
            )
          })}
          
          <div className="flex-1"></div>
          
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-4 text-blue-50 hover:bg-blue-700 hover:text-white transition-all border-l border-blue-500"
          >
            <LogIn size={18} />
            <span>Đăng nhập Khu Phố</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                              (item.path === '/' && location.pathname === '/') ||
                              (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all my-1
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all my-1 border-t border-gray-200 mt-2 pt-3"
            >
              <LogIn size={18} />
              <span>Đăng nhập Khu Phố</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
