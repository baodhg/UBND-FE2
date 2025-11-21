import React from 'react'
import { LoginForm } from '../features/authentication'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 overflow-hidden">
      <div className="w-full max-w-[280px]">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 mb-3 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Quay lại trang chủ</span>
        </button>

        <div className="bg-white rounded-xl shadow-md p-3.5">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

