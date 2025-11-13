import React, { useState } from 'react'
import { Search } from 'lucide-react'

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
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl p-6 border-0 shadow-sm">
      <h3 className="mb-6 flex items-center gap-2">
        <Search size={24} className="text-blue-600" />
        <span className="text-lg font-semibold">Tra cứu tiến độ</span>
      </h3>
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          placeholder="Nhập mã tra cứu (VD: TNP2025001)"
          className="flex h-9 w-full min-w-0 rounded-md border border-gray-300 px-3 py-1 text-base bg-white transition-[color,box-shadow] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 md:text-sm flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
        >
          Tra cứu
        </button>
      </div>
    </div>
  )
}
