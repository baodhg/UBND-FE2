import React, { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

interface CaptchaProps {
  onValidate: (isValid: boolean) => void
  reset?: number
}

export const Captcha: React.FC<CaptchaProps> = ({ onValidate, reset }) => {
  const [captchaCode, setCaptchaCode] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [inputKey, setInputKey] = useState(0)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate random captcha code
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(code)
    setUserInput('')
    setIsValid(null)
    onValidate(false)
    setInputKey(prev => prev + 1) // Force re-render input
    
    // Force clear the input field
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // Generate captcha on mount and when reset changes
  useEffect(() => {
    generateCaptcha()
  }, [reset])

  // Validate user input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't allow input while regenerating
    if (isRegenerating) {
      return
    }
    
    const value = e.target.value
    setUserInput(value)
    
    if (value.length === 6) {
      const valid = value === captchaCode
      setIsValid(valid)
      onValidate(valid)
      
      // Auto-generate new captcha if incorrect
      if (!valid) {
        setIsRegenerating(true)
        setTimeout(() => {
          generateCaptcha()
          setIsRegenerating(false)
        }, 1000) // Wait 1 second to show error message
      }
    } else {
      setIsValid(null)
      onValidate(false)
    }
  }

  // Draw captcha on canvas
  useEffect(() => {
    if (!captchaCode) return

    const canvas = document.getElementById('captcha-canvas') as HTMLCanvasElement
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }

    // Draw captcha text
    ctx.font = 'bold 32px Arial'
    ctx.textBaseline = 'middle'
    
    const chars = captchaCode.split('')
    chars.forEach((char, index) => {
      const x = 20 + index * 30
      const y = 35 + (Math.random() - 0.5) * 10
      const rotate = (Math.random() - 0.5) * 0.4
      
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotate)
      
      // Random color for each character
      const colors = ['#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c']
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
      ctx.fillText(char, 0, 0)
      ctx.restore()
    })

    // Add noise dots
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2)
    }
  }, [captchaCode])

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Mã xác thực <span className="text-red-500">*</span>
      </label>
      
      <div className="flex items-center gap-3">
        {/* Captcha Canvas */}
        <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
          <canvas
            id="captcha-canvas"
            width="200"
            height="70"
            className="block"
          />
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={generateCaptcha}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          title="Làm mới mã"
        >
          <RefreshCw size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Input Field */}
      <div className="relative">
        <input
          key={inputKey}
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Nhập mã xác thực"
          maxLength={6}
          disabled={isRegenerating}
          className={`
            w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
            ${isValid === true ? 'border-green-500 focus:ring-green-500' : ''}
            ${isValid === false ? 'border-red-500 focus:ring-red-500' : ''}
            ${isValid === null ? 'border-gray-300 focus:ring-blue-500' : ''}
            ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        {isValid === true && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm font-medium">
            ✓ Đúng
          </span>
        )}
        {isValid === false && userInput.length === 6 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm font-medium">
            ✗ Sai
          </span>
        )}
      </div>

      {isValid === false && userInput.length === 6 && (
        <p className="text-sm text-red-500">
          Mã xác thực không đúng. Vui lòng thử lại.
        </p>
      )}
    </div>
  )
}

