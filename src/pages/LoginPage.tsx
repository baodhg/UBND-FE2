import React from 'react'
import { LoginForm } from '../features/authentication'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-4">
      <div className="w-full max-w-sm">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Quay lại trang chủ</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

