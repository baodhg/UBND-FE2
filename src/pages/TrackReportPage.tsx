import React from 'react'
import { Card } from 'antd'
import { TrackReportForm } from './report-page/TrackReportForm'

export const TrackReportPage: React.FC = () => {
  return (
    <div className="py-6 sm:py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card
          className="shadow-md"
          styles={{
            body: { padding: '24px', overflow: 'hidden' }
          }}
        >
          {/* Title & Description */}
          <div className="mb-6">
            <h2 className="text-2xl mb-1">Tra cứu phản ánh</h2>
            <p className="text-gray-600">Tìm kiếm phản ánh theo tiêu đề</p>
          </div>

          {/* Track Report Form */}
          <TrackReportForm />
        </Card>
      </div>
    </div>
  )
}

