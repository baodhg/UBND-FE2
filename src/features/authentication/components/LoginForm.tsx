import { useState, useEffect, useRef } from 'react'
import { useLogin } from '../api/useLogin'
import { User, Lock, Eye, EyeOff } from 'lucide-react'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback': () => void
        }
      ) => number
      reset: (widgetId?: number) => void
      ready: (callback: () => void) => void
    }
  }
}

export const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [recaptchaError, setRecaptchaError] = useState('')
  const [loginError, setLoginError] = useState('')
  const recaptchaRef = useRef<HTMLDivElement>(null)
  const recaptchaWidgetId = useRef<number | null>(null)
  const recaptchaTimeoutRef = useRef<number | undefined>(undefined)
  const { mutate: login, isPending } = useLogin()

  useEffect(() => {
    const checkRecaptchaReady = () => {
      if (recaptchaWidgetId.current !== null) return
      if (!recaptchaRef.current) return

      if (!RECAPTCHA_SITE_KEY) {
        setRecaptchaError('Chưa cấu hình khóa reCAPTCHA. Vui lòng bổ sung VITE_RECAPTCHA_SITE_KEY.')
        return
      }

      if (window.grecaptcha?.render) {
        window.grecaptcha.ready(() => {
          if (!recaptchaRef.current || recaptchaWidgetId.current !== null) return

          try {
            recaptchaWidgetId.current = window.grecaptcha!.render(recaptchaRef.current, {
              sitekey: RECAPTCHA_SITE_KEY,
              callback: (token: string) => {
                setRecaptchaToken(token)
                setRecaptchaError('')
              },
              'expired-callback': () => {
                setRecaptchaToken('')
                setRecaptchaError('Phiên reCAPTCHA đã hết hạn, vui lòng xác thực lại.')
              },
            })
          } catch (error) {
            console.error('Không thể khởi tạo reCAPTCHA:', error)
            setRecaptchaError('Không thể tải reCAPTCHA. Vui lòng thử lại sau.')
          }
        })
        return
      }

      recaptchaTimeoutRef.current = window.setTimeout(checkRecaptchaReady, 200)
    }

    checkRecaptchaReady()

    return () => {
      if (recaptchaTimeoutRef.current) {
        clearTimeout(recaptchaTimeoutRef.current)
      }
    }
  }, [RECAPTCHA_SITE_KEY])

  const resetRecaptcha = (message?: string) => {
    if (window.grecaptcha && recaptchaWidgetId.current !== null) {
      window.grecaptcha.reset(recaptchaWidgetId.current)
    }
    setRecaptchaToken('')
    if (message) {
      setRecaptchaError(message)
    }
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    setLoginError('')

    if (!recaptchaToken) {
      setRecaptchaError('Vui lòng xác thực reCAPTCHA trước khi đăng nhập.')
      return
    }

    login(
      {
        tenDangNhap: username.trim(),
        matKhau: password,
        recaptchaToken,
      },
      {
        onError: (error: any) => {
          const errorMessage =
            error?.response?.data?.message || error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
          setLoginError(errorMessage)
          resetRecaptcha('Vui lòng xác thực reCAPTCHA và thử lại.')
        },
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
      <h1 className="text-lg font-bold text-center text-gray-900 mb-6">
        Đăng nhập
      </h1>

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
              autoComplete="username"
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
              autoComplete="current-password"
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

        {/* Google reCAPTCHA */}
        <div>
          <label className="block text-xs font-medium text-gray-900 mb-1">
            Xác thực
          </label>
          <div className="flex justify-center">
            <div ref={recaptchaRef} className="g-recaptcha" />
          </div>
          {recaptchaError && (
            <p className="mt-1 text-xs text-red-600">{recaptchaError}</p>
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

