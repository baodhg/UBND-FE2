import { useState, useEffect, useRef } from 'react'
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
  const [captchaAttempts, setCaptchaAttempts] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const captchaInputRef = useRef<HTMLInputElement>(null)
  const { mutate: login, isPending } = useLogin()

  // Generate captcha on component mount
  useEffect(() => {
    setCaptchaCode(generateCaptcha())
  }, [])

  const handleRefreshCaptcha = () => {
    setCaptchaCode(generateCaptcha())
    setCaptchaInput('')
    setCaptchaError('')
    setCaptchaAttempts(0)
    // Focus back to captcha input after refresh
    setTimeout(() => {
      captchaInputRef.current?.focus()
    }, 100)
  }

  const handleShakeAnimation = () => {
    setIsShaking(true)
    setTimeout(() => {
      setIsShaking(false)
    }, 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setLoginError('')
    
    // Validate captcha
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      const newAttempts = captchaAttempts + 1
      setCaptchaAttempts(newAttempts)
      setCaptchaError('Mã xác nhận không đúng. Vui lòng nhập lại.')
      
      // Shake animation
      handleShakeAnimation()
      
      // Clear input and refresh captcha
      setCaptchaInput('')
      setCaptchaCode(generateCaptcha())
      
      // Focus back to captcha input
      setTimeout(() => {
        captchaInputRef.current?.focus()
      }, 100)
      
      return
    }

    // Captcha is correct, reset attempts
    setCaptchaError('')
    setCaptchaAttempts(0)
    
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
          // Refresh captcha on login error
          setCaptchaInput('')
          setCaptchaCode(generateCaptcha())
          setCaptchaAttempts(0)
        }
      }
    )
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
          <User size={32} className="text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
        Đăng nhập Khu Phố
      </h1>
      <p className="text-center text-sm text-gray-600 mb-6">
        Dành cho cán bộ quản lý khu phố
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Input */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Tên đăng nhập
          </label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setLoginError('')
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setLoginError('')
              }}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
            Quên mật khẩu?
          </a>
        </div>

        {/* Captcha */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1.5">
            Mã xác nhận
            {captchaAttempts > 0 && (
              <span className="ml-2 text-xs text-red-600 font-normal">
                (Đã sai {captchaAttempts} lần)
              </span>
            )}
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Captcha Display */}
            <div className={`flex-1 flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 border-2 ${
              captchaError ? 'border-red-300 bg-red-50' : 'border-gray-200'
            } transition-colors`}>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-800 tracking-wider select-none">
                  {captchaCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRefreshCaptcha}
                className="text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0"
                title="Làm mới mã xác nhận"
              >
                <RefreshCw size={18} />
              </button>
            </div>
            
            {/* Captcha Input */}
            <input
              ref={captchaInputRef}
              type="text"
              placeholder="Nhập mã"
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value.toUpperCase())
                setCaptchaError('')
              }}
              className={`w-full sm:w-28 px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 text-center font-semibold tracking-wider uppercase transition-all ${
                captchaError 
                  ? 'bg-red-50 border-2 border-red-300 focus:ring-red-500' 
                  : 'focus:ring-blue-500'
              } ${
                isShaking ? 'animate-shake' : ''
              }`}
              required
              maxLength={5}
              autoComplete="off"
            />
          </div>
          {captchaError && (
            <div className="mt-1.5 flex items-center gap-1">
              <p className="text-sm text-red-600">{captchaError}</p>
              {captchaAttempts >= 2 && (
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Làm mới mã
                </button>
              )}
            </div>
          )}
        </div>

        {/* Login Error */}
        {loginError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
            <p className="text-sm text-red-600">{loginError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}

