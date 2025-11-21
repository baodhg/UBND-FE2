import { useState, useEffect, useRef } from 'react'
import { useLogin } from '../api/useLogin'
import { User, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react'

// Generate random captcha code - harder version
const generateCaptcha = (): string => {
  // Include both uppercase, lowercase, and numbers for more complexity
  // Exclude confusing characters: 0, O, I, 1, l (lowercase L)
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'
  const numbers = '23456789'
  const allChars = uppercase + lowercase + numbers
  
  let result = ''
  // Increase length from 5 to 6 characters
  for (let i = 0; i < 6; i++) {
    result += allChars.charAt(Math.floor(Math.random() * allChars.length))
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
  const captchaCanvasRef = useRef<HTMLCanvasElement>(null)
  const { mutate: login, isPending } = useLogin()

  // Generate captcha on component mount
  useEffect(() => {
    const code = generateCaptcha()
    setCaptchaCode(code)
  }, [])

  // Draw captcha on canvas when code changes
  useEffect(() => {
    if (!captchaCode || !captchaCanvasRef.current) return

    const canvas = captchaCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 180
    canvas.height = 50

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add noise lines
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.4)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }

    // Draw captcha text with colors
    ctx.font = 'bold 28px Arial'
    ctx.textBaseline = 'middle'
    
    const chars = captchaCode.split('')
    const colors = ['#7c3aed', '#059669', '#dc2626', '#ea580c', '#2563eb'] // Purple, Green, Red, Orange, Blue
    
    chars.forEach((char, index) => {
      const x = 15 + index * 28
      const y = 25 + (Math.random() - 0.5) * 8
      const rotate = (Math.random() - 0.5) * 0.3
      
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotate)
      
      // Random color for each character
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
      ctx.fillText(char, 0, 0)
      ctx.restore()
    })

    // Add noise dots
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.6)`
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2)
    }
  }, [captchaCode])

  const handleRefreshCaptcha = () => {
    const newCode = generateCaptcha()
    setCaptchaCode(newCode)
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
    
    // Validate captcha - case sensitive for harder difficulty
    if (captchaInput.trim() !== captchaCode) {
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
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <User size={24} className="text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-lg font-bold text-center text-gray-900 mb-1">
        Đăng nhập Khu Phố
      </h1>
      <p className="text-center text-xs text-gray-600 mb-4">
        Dành cho cán bộ quản lý khu phố
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Username Input */}
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">
            Tên đăng nhập
          </label>
          <div className="relative">
            <User size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setLoginError('')
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setLoginError('')
              }}
              className="w-full pl-9 pr-9 py-2 text-xs bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-700">Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" className="text-xs text-blue-600 hover:text-blue-700">
            Quên mật khẩu?
          </a>
        </div>

        {/* Captcha */}
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">
            Mã xác nhận
            {captchaAttempts > 0 && (
              <span className="ml-2 text-[10px] text-red-600 font-normal">
                (Đã sai {captchaAttempts} lần)
              </span>
            )}
          </label>
          <div className="flex flex-col gap-2">
            {/* Captcha Display with Canvas */}
            <div className={`flex items-center gap-2 bg-white rounded-lg px-2.5 py-1.5 border-2 ${
              captchaError ? 'border-red-300' : 'border-gray-200'
            } transition-colors`}>
              <canvas
                ref={captchaCanvasRef}
                className="flex-shrink-0"
                style={{ imageRendering: 'pixelated' }}
              />
              <button
                type="button"
                onClick={handleRefreshCaptcha}
                className="text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0 p-1 rounded hover:bg-gray-100"
                title="Làm mới mã xác nhận"
              >
                <RefreshCw size={18} />
              </button>
            </div>
            
            {/* Captcha Input */}
            <input
              ref={captchaInputRef}
              type="text"
              placeholder="Nhập mã xác thực"
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value)
                setCaptchaError('')
              }}
              className={`w-full px-3 py-2 text-xs bg-gray-100 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                captchaError 
                  ? 'bg-red-50 border-2 border-red-300 focus:ring-red-500' 
                  : 'focus:ring-blue-500'
              } ${
                isShaking ? 'animate-shake' : ''
              }`}
              required
              maxLength={6}
              autoComplete="off"
            />
          </div>
          {captchaError && (
            <div className="mt-1 flex items-center gap-1">
              <p className="text-xs text-red-600">{captchaError}</p>
              {captchaAttempts >= 2 && (
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className="text-[10px] text-blue-600 hover:text-blue-700 underline"
                >
                  Làm mới mã
                </button>
              )}
            </div>
          )}
        </div>

        {/* Login Error */}
        {loginError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-xs text-red-600">{loginError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  )
}

