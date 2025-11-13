import React, { useState } from 'react'
import { SendReportForm } from '../components/organisms/SendReportForm'

const ReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'track'>('send')

  return (
    <div className="min-h-screen">
      <div className="mx-[68.5px] p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Phản ánh & Khiếu nại
          </h1>
          <p className="text-lg text-gray-600">
            Gửi phản ánh hoặc tra cứu tiến độ xử lý
          </p>
        </div>

        {/* Tabs - with gray background wrapper */}
        <div className="bg-gray-200 rounded-full p-1 inline-flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('send')}
            className={`px-14 py-1 rounded-full text-base font-medium transition-all ${
              activeTab === 'send'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Gửi phản ánh
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-14 py-1 rounded-full text-base font-medium transition-all ${
              activeTab === 'track'
                ? 'bg-white text-gray-900 shadow-md'
                : 'bg-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Tra cứu tiến độ
          </button>
        </div>

        {/* Tab Content */}
        <div className="">
          {activeTab === 'send' ? (
            <div className="grid grid-cols-3 gap-8">
              {/* Form Section - 8/12 columns */}
              <div className="col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-900">Biểu mẫu phản ánh</h2>
                  </div>
                  <SendReportForm />
                </div>
              </div>

              {/* Notes Section - 4/12 columns */}
              <div className="col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-base font-semibold text-blue-900">Lưu ý</h3>
                  </div>
                  <ul className="space-y-3 text-base text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Bạn sẽ nhận được mã tra cứu sau khi gửi phản ánh</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Lưu lại mã tra cứu để theo dõi tiến độ xử lý</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Thời gian xử lý trung bình: 5-7 ngày làm việc</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Cung cấp hình ảnh để hỗ trợ xử lý nhanh hơn</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">Tra cứu tiến độ</h2>
              <p className="text-gray-600 text-sm">Form tra cứu tiến độ sẽ được thêm ở đây</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportPage
