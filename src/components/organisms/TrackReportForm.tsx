import React, { useState } from 'react'
import { Button } from '../atoms/Button'

export const TrackReportForm: React.FC = () => {
  const [trackingCode, setTrackingCode] = useState('')

  const handleSearch = () => {
    if (!trackingCode.trim()) {
      alert('Vui lòng nhập mã tra cứu')
      return
    }
    console.log('Tracking code:', trackingCode)
    // Handle search logic here
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Header Section */}
      <div className="flex items-center gap-2 p-6">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900">Tra cứu tiến độ</h2>
      </div>
      
      {/* Form Section */}
      <div className="p-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Nhập mã tra cứu (VD: TNP20250001)"
              className="w-full pl-11 pr-4 py-3 text-base bg-gray-100 rounded-lg focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            <svg 
              className="w-5 h-5 text-blue-600 absolute left-3 top-1/2 transform -translate-y-1/2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Button
            type="button"
            onClick={handleSearch}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium"
          >
            Tra cứu
          </Button>
        </div>
      </div>
    </div>
  )
}
