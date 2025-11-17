import { useState } from 'react'
import { useLogin } from '../api/useLogin'
import { User, Lock, Eye, EyeOff } from 'lucide-react'

export const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending } = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email: username, password })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center">
          <User size={48} className="text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
        Đăng nhập Khu Phố
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Dành cho cán bộ quản lý khu phố
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Input */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Tên đăng nhập
          </label>
          <div className="relative">
            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Quên mật khẩu?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}

