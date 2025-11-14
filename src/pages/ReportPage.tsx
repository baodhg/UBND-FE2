import React, { useState } from 'react'
import { SendReportForm } from '../components/organisms/SendReportForm'
import { TrackReportForm } from '../components/organisms/TrackReportForm'
import { MessageSquare, Info } from 'lucide-react'

const ReportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'track'>('track')

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div>
            <h2 className="text-2xl mb-2">Phản ánh & Khiếu nại</h2>
            <p className="text-gray-600">Gửi phản ánh hoặc tra cứu tiến độ xử lý</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-col gap-2">
            <div
              role="tablist"
              aria-orientation="horizontal"
              className="bg-gray-200 text-gray-700 h-9 items-center justify-center rounded-xl p-[3px] grid w-full max-w-md grid-cols-2"
            >
              <button
                type="button"
                role="tab"
                onClick={() => setActiveTab('send')}
                className={`
                  inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1
                  ${activeTab === 'send'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'bg-transparent text-gray-700 hover:text-gray-900'
                  }
                `}
              >
                Gửi phản ánh
              </button>
              <button
                type="button"
                role="tab"
                onClick={() => setActiveTab('track')}
                className={`
                  inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1
                  ${activeTab === 'track'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'bg-transparent text-gray-700 hover:text-gray-900'
                  }
                `}
              >
                Tra cứu tiến độ
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 outline-none mt-6">
              {activeTab === 'send' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form Section - 2 columns */}
                  <div className="lg:col-span-2">
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl p-6 border-0 shadow-md">
                      <h3 className="mb-6 flex items-center gap-2">
                        <MessageSquare size={24} className="text-blue-600" />
                        <span>Biểu mẫu phản ánh</span>
                      </h3>
                      <SendReportForm />
                    </div>
                  </div>

                  {/* Notes Section - 1 column */}
                  <div className="space-y-6">
                    <div data-slot="card" className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl p-6 border-0 shadow-md">
                      <h4 className="mb-4 flex items-center gap-2">
                        <Info size={20} className="text-blue-600" />
                        <span>Lưu ý</span>
                      </h4>
                      <ul className="space-y-3 text-sm text-gray-600">
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
                <div className="max-w-3xl mx-auto">
                  <TrackReportForm />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportPage
