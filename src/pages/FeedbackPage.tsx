import React, { useState } from 'react'
import { Card } from '../components/atoms/Card'
import { Input } from '../components/atoms/Input'
import { Button } from '../components/atoms/Button'

export const FeedbackPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Phản ánh</h1>
        <p className="text-gray-600 mb-8">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ cư dân. Gửi phản ánh hoặc liên hệ trực tiếp với chúng tôi.
        </p>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Họ và tên"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Số điện thoại"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Chủ đề"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung phản ánh
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Gửi phản ánh
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

