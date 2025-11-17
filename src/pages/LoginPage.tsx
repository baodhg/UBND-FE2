import React from 'react'
import { LoginForm } from '../features/authentication'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Quay lại trang chủ</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

