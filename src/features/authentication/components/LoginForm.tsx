import { useState, useEffect } from 'react'
import { useLogin } from '../api/useLogin'
import { User, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react'

// Generate random captcha code
const generateCaptcha = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing characters like 0, O, I, 1
  let result = ''
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [captchaCode, setCaptchaCode] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState('')
  const [loginError, setLoginError] = useState('')
  const { mutate: login, isPending } = useLogin()

  // Generate captcha on component mount
  useEffect(() => {
    setCaptchaCode(generateCaptcha())
  }, [])

  const handleRefreshCaptcha = () => {
    setCaptchaCode(generateCaptcha())
    setCaptchaInput('')
    setCaptchaError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setLoginError('')
    
    // Validate captcha
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setCaptchaError('Mã xác nhận không đúng')
      handleRefreshCaptcha()
      return
    }

    setCaptchaError('')
    login(
      { 
        tenDangNhap: username.trim(), 
        matKhau: password 
      },
      {
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message || 
                             error?.message || 
                             'Đăng nhập thất bại. Vui lòng thử lại.'
          setLoginError(errorMessage)
          handleRefreshCaptcha() // Refresh captcha on error
        }
      }
    )
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
              onChange={(e) => {
                setUsername(e.target.value)
                setLoginError('')
              }}
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
              onChange={(e) => {
                setPassword(e.target.value)
                setLoginError('')
              }}
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

        {/* Captcha */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Mã xác nhận
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Captcha Display */}
            <div className="flex-1 flex items-center justify-between bg-gray-100 rounded-xl px-3 sm:px-4 py-3 border-2 border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-gray-800 tracking-wider select-none">
                  {captchaCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRefreshCaptcha}
                className="text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
                title="Làm mới mã xác nhận"
              >
                <RefreshCw size={20} />
              </button>
            </div>
            
            {/* Captcha Input */}
            <input
              type="text"
              placeholder="Nhập mã"
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value.toUpperCase())
                setCaptchaError('')
              }}
              className="w-full sm:w-32 px-4 py-3 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold tracking-wider uppercase"
              required
              maxLength={5}
            />
          </div>
          {captchaError && (
            <p className="mt-2 text-sm text-red-600">{captchaError}</p>
          )}
        </div>

        {/* Login Error */}
        {loginError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-600">{loginError}</p>
          </div>
        )}

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

