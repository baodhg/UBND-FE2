import React, { useState } from 'react'
import { Search, Calendar, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { useGetReportByCode } from '../../features/reports'

export const TrackReportForm: React.FC = () => {
  const [trackingCode, setTrackingCode] = useState('')
  const [searchCode, setSearchCode] = useState('')
  const [showResult, setShowResult] = useState(false)

  const { data: report, isLoading, error } = useGetReportByCode(searchCode, showResult)

  const handleSearch = () => {
    if (!trackingCode.trim()) {
      alert('Vui lòng nhập mã tra cứu')
      return
    }
    setSearchCode(trackingCode.trim())
    setShowResult(true)
  }

  const handleClose = () => {
    setShowResult(false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa cập nhật'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
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
            placeholder="Nhập mã phản ánh (VD: 42139SHA)"
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
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            {isLoading ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </div>
      </div>

      {/* Result Display Below Search */}
      {searchCode && !showResult && (
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Đang tìm kiếm...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy</h3>
              <p className="text-gray-600">
                Không tìm thấy phản ánh với mã <strong>{searchCode}</strong>
              </p>
            </div>
          )}

          {report && (
            <div className="space-y-6">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm font-medium">
                  {report.linh_vuc_phan_anh?.ten}
                </span>
                {report.lich_su_trang_thai && report.lich_su_trang_thai.length > 0 && (
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded text-sm font-medium">
                    {report.lich_su_trang_thai[report.lich_su_trang_thai.length - 1].ten}
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{report.tieu_de}</h3>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Ngày gửi: {formatDate(report.thoi_gian_tao)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Mã phản ánh: {report.ma_phan_anh}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Mô tả chi tiết</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{report.mo_ta}</p>
              </div>

              {/* Location */}
              {report.vi_tri && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Địa điểm</h4>
                  <p className="text-gray-700">{report.vi_tri}</p>
                </div>
              )}

              {/* Attached Images */}
              {report.dinh_kem_phan_anh && report.dinh_kem_phan_anh.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Hình ảnh đính kèm</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {report.dinh_kem_phan_anh
                      .filter((file) => file.dinh_dang_file.startsWith('image/'))
                      .map((file, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
                        >
                          <img
                            src={`https://ubnd-api-staging.noah-group.org${file.url_file}`}
                            alt={`Đính kèm ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() =>
                              window.open(
                                `https://ubnd-api-staging.noah-group.org${file.url_file}`,
                                '_blank'
                              )
                            }
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                            {file.kich_thuoc_file_mb} MB
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {report.lich_su_trang_thai && report.lich_su_trang_thai.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Tiến trình xử lý</h4>
                  <div className="space-y-0">
                    {report.lich_su_trang_thai.map((history, index) => {
                      const isLast = index === report.lich_su_trang_thai.length - 1
                      const isCompleted = index < report.lich_su_trang_thai.length - 1

                      return (
                        <div key={index} className="flex gap-4">
                          {/* Timeline indicator */}
                          <div className="flex flex-col items-center pt-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCompleted
                                  ? 'bg-blue-600 text-white'
                                  : isLast
                                  ? 'bg-gray-300 text-gray-500'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              <CheckCircle2 size={20} />
                            </div>
                            {!isLast && (
                              <div className="w-0.5 h-full bg-blue-200 mt-2 min-h-[60px]"></div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-8">
                            <h5 className="font-semibold text-gray-900 mb-1">{history.ten}</h5>
                            <p className="text-sm text-gray-500">
                              {formatDate(history.thoi_gian_tao)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Chi tiết phản ánh</h2>
                <p className="text-sm text-gray-500">Xem thông tin chi tiết về phản ánh của bạn.</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Đang tìm kiếm...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy</h3>
                  <p className="text-gray-600 mb-6">
                    Không tìm thấy phản ánh với mã <strong>{searchCode}</strong>
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              )}

              {report && (
                <div className="space-y-6">
                  {/* Status badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm font-medium">
                      {report.linh_vuc_phan_anh?.ten}
                    </span>
                    {report.lich_su_trang_thai && report.lich_su_trang_thai.length > 0 && (
                      <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded text-sm font-medium">
                        {report.lich_su_trang_thai[report.lich_su_trang_thai.length - 1].ten}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {report.tieu_de}
                    </h3>
                    
                    {/* Meta info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Ngày gửi: {formatDate(report.thoi_gian_tao)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Mã phản ánh: {report.ma_phan_anh}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Mô tả chi tiết</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{report.mo_ta}</p>
                  </div>

                  {/* Location */}
                  {report.vi_tri && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Địa điểm</h4>
                      <p className="text-gray-700">{report.vi_tri}</p>
                    </div>
                  )}

                  {/* Attached Images */}
                  {report.dinh_kem_phan_anh && report.dinh_kem_phan_anh.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Hình ảnh đính kèm</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {report.dinh_kem_phan_anh
                          .filter(file => file.dinh_dang_file.startsWith('image/'))
                          .map((file, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                              <img
                                src={`https://ubnd-api-staging.noah-group.org${file.url_file}`}
                                alt={`Đính kèm ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => window.open(`https://ubnd-api-staging.noah-group.org${file.url_file}`, '_blank')}
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                                {file.kich_thuoc_file_mb} MB
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  {report.lich_su_trang_thai && report.lich_su_trang_thai.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Tiến trình xử lý</h4>
                      <div className="space-y-0">
                        {report.lich_su_trang_thai.map((history, index) => {
                          const isLast = index === report.lich_su_trang_thai.length - 1
                          const isCompleted = index < report.lich_su_trang_thai.length - 1
                          
                          return (
                            <div key={index} className="flex gap-4">
                              {/* Timeline indicator */}
                              <div className="flex flex-col items-center pt-1">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    isCompleted
                                      ? 'bg-blue-600 text-white'
                                      : isLast
                                      ? 'bg-gray-300 text-gray-500'
                                      : 'bg-blue-600 text-white'
                                  }`}
                                >
                                  <CheckCircle2 size={20} />
                                </div>
                                {!isLast && (
                                  <div className="w-0.5 h-full bg-blue-200 mt-2 min-h-[60px]"></div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 pb-8">
                                <h5 className="font-semibold text-gray-900 mb-1">
                                  {history.ten}
                                </h5>
                                <p className="text-sm text-gray-500">
                                  {formatDate(history.thoi_gian_tao)}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
