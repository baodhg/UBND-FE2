import React, { useState } from 'react'
import { X, Loader2, MapPin, ClipboardList, Paperclip, AlertCircle } from 'lucide-react'
import { useGetReportByCode } from '../../features/reports'

interface DashboardReportDetailsModalProps {
  open: boolean
  code: string | null
  onClose: () => void
}

const InfoCard: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-2 text-base font-semibold text-slate-900">{value?.trim() || 'Chưa cập nhật'}</p>
  </div>
)

const formatDateTime = (value?: string | null, withTime = true) => {
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: withTime ? '2-digit' : undefined,
    minute: withTime ? '2-digit' : undefined,
    hour12: false,
  })
}

export const DashboardReportDetailsModal: React.FC<DashboardReportDetailsModalProps> = ({
  open,
  code,
  onClose,
}) => {
  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useGetReportByCode(code || '', Boolean(open && code))
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null)

  if (!open) {
    return null
  }

  const statusHistory = report?.lich_su_trang_thai ?? []
  const attachments = report?.dinh_kem_phan_anh ?? []

  const resolveFileUrl = (url?: string | null) => {
    if (!url) return '#'
    if (/^https?:\/\//i.test(url)) return url
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''
    return `${baseUrl}${url}`
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Thông tin phản ánh</p>
            <h2 className="text-2xl font-semibold text-gray-900">Chi tiết phản ánh</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-56px)] overflow-y-auto px-6 py-5 space-y-6">
          {!code ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
              Không có mã phản ánh để xem chi tiết.
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>Đang tải thông tin phản ánh...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-medium text-red-700">Không thể tải phản ánh</p>
                <p className="text-sm text-red-600">
                  {(error as any)?.message || 'Vui lòng thử lại sau hoặc kiểm tra mã phản ánh.'}
                </p>
              </div>
              <button
                onClick={() => refetch()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Thử lại
              </button>
            </div>
          ) : !report ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
              Không tìm thấy phản ánh tương ứng.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {[report.linh_vuc_phan_anh?.ten || 'Phản ánh cư dân', report.trang_thai_hien_tai?.ten || 'Đang cập nhật'].map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard label="Mã phản ánh" value={report.ma_phan_anh} />
                <InfoCard label="Ngày gửi" value={formatDateTime(report.thoi_gian_tao, false)} />
                <InfoCard label="Người gửi" value={report.ten_nguoi_phan_anh} />
                <InfoCard label="Số điện thoại" value={report.sdt_nguoi_phan_anh} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">Địa điểm</p>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                  <MapPin size={16} className="text-blue-600" />
                  <span>{report.vi_tri || 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">Nội dung phản ánh</p>
                <p className="mt-2 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  {report.mo_ta || 'Người dùng không cung cấp mô tả.'}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  <h4 className="text-base font-semibold text-gray-900">Lịch sử trạng thái</h4>
                </div>
                {statusHistory.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có lịch sử xử lý.</p>
                ) : (
                  <div className="space-y-4">
                    {statusHistory.map((history, index) => {
                      const isLast = index === statusHistory.length - 1
                      return (
                        <div key={`${history.ten}-${history.thoi_gian_tao}-${index}`} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span
                              className={`h-3 w-3 rounded-full ${
                                isLast ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                            />
                            {!isLast && <span className="mt-1 h-full w-px bg-gray-200" />}
                          </div>
                          <div className="flex-1 rounded-xl bg-gray-50/70 p-3">
                            <p className="text-sm font-semibold text-gray-900">{history.ten || 'Cập nhật trạng thái'}</p>
                            <p className="text-xs text-gray-500">{formatDateTime(history.thoi_gian_tao)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-blue-600" />
                  <h4 className="text-base font-semibold text-gray-900">Tập tin đính kèm</h4>
                </div>
                {attachments.length === 0 ? (
                  <p className="text-sm text-gray-500">Không có tập tin nào được đính kèm.</p>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((file, index) => {
                      const fileName = `Tập tin ${index + 1}`
                      const displayName = file.dinh_dang_file
                        ? `${fileName} (${file.dinh_dang_file.toUpperCase()})`
                        : fileName
                      const fileUrl = resolveFileUrl(file.url_file)
                      const format = (file.dinh_dang_file || '').toLowerCase()
                      const isImage =
                        format.includes('image') ||
                        ['jpg', 'jpeg', 'png', 'gif', 'webp'].some((ext) => file.url_file?.toLowerCase().endsWith(ext))

                      const content = (
                        <>
                          <span>{displayName}</span>
                          <span className="text-xs text-gray-500">
                            {file.kich_thuoc_file_mb ? `${file.kich_thuoc_file_mb} MB` : ''}
                          </span>
                        </>
                      )

                      return isImage ? (
                        <button
                          type="button"
                          key={`${file.url_file}-${index}`}
                          onClick={() => setPreviewFile({ url: fileUrl, name: displayName })}
                          className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                        >
                          {content}
                        </button>
                      ) : (
                        <a
                          key={`${file.url_file}-${index}`}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                        >
                          {content}
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewFile(null)}>
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute right-3 top-3 rounded-full bg-white/80 p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <X size={18} />
            </button>
            <h4 className="mb-3 text-center text-sm font-semibold text-gray-700">{previewFile.name}</h4>
            <div className="flex max-h-[70vh] items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-2">
              <img src={previewFile.url} alt={previewFile.name} className="max-h-[65vh] w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
