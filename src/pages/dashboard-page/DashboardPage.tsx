import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAppSelector } from '../../store/hooks'
import { useReportsList } from '../../features/reports/hooks/useReportsList'
import { useReportCategories } from '../../features/report-categories'
import type { Report } from '../../features/reports/api/getReportsList'
import { DashboardReportModal } from './DashboardReportModal'
import { DashboardReportDetailsModal } from './DashboardReportDetailsModal'
import { MessageSquare, Clock, CheckCircle2, Edit, Search, Filter, Eye, User, Phone, LogOut, Plus, Check } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, token } = useAppSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReportCode, setSelectedReportCode] = useState<string | null>(null)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)

  const { categories } = useReportCategories({
    page: 1,
    size: 100,
    isActive: true,
  })

  const { reports, isLoading, error: reportsError, refetch } = useReportsList({
    page: 1,
    size: 10,
    maPhanAnh: searchQuery || undefined,
    trangThai: statusFilter !== 'all' ? statusFilter : undefined,
    sortTime: 'desc',
  })

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    categories?.forEach((category) => {
      map[category.id] = category.ten
    })
    return map
  }, [categories])

  const getReportStatus = (report: Report) => {
    const directStatus = (report.trang_thai || '').trim()
    if (directStatus) return directStatus

    const currentStatus = (report.trang_thai_hien_tai?.ten || '').trim()
    if (currentStatus) return currentStatus

    if (report.lich_su_trang_thai && report.lich_su_trang_thai.length > 0) {
      const lastHistory = report.lich_su_trang_thai[report.lich_su_trang_thai.length - 1]
      const historyStatus = (lastHistory?.ten || lastHistory?.trang_thai || '').trim()
      if (historyStatus) return historyStatus
    }

    return 'Chờ xử lý'
  }

  const getCategoryName = (report: Report) => {
    if (report.linh_vuc?.ten_linh_vuc) return report.linh_vuc.ten_linh_vuc
    if (report.ten_linh_vuc) return report.ten_linh_vuc
    if (report.id_linh_vuc_phan_anh && categoryMap[report.id_linh_vuc_phan_anh]) {
      return categoryMap[report.id_linh_vuc_phan_anh]
    }
    return 'Chưa xác định'
  }

  // Thống kê dựa trên tất cả reports từ API (không bị ảnh hưởng bởi search)
  const totalReports = reports.length
  const pendingReports = reports.filter((report) => {
    const status = getReportStatus(report)
    return status === 'Mới' || status === 'Chờ xử lý'
  }).length
  const completedReports = reports.filter((report) => getReportStatus(report) === 'Hoàn thành').length
  const inProgressReports = reports.filter((report) => getReportStatus(report) === 'Đang xử lý').length

  // Lọc reports theo mã phản ánh nếu có searchQuery (chỉ dùng cho bảng hiển thị)
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) {
      return reports
    }
    const query = searchQuery.trim().toUpperCase()
    return reports.filter((report) => {
      const maPhanAnh = (report.ma_phan_anh || '').toUpperCase()
      return maPhanAnh.includes(query)
    })
  }, [reports, searchQuery])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
    window.location.reload()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `${day} tháng ${month}, ${year}`
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-emerald-100 text-emerald-700'
      case 'Đang xử lý':
        return 'bg-indigo-100 text-indigo-700'
      case 'Mới':
        return 'bg-slate-900 text-white'
      case 'Chờ xử lý':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  const handleReportSuccess = async () => {
    setSearchQuery('')
    await new Promise((resolve) => setTimeout(resolve, 1500))
    await queryClient.invalidateQueries({ queryKey: ['reportsList'], refetchType: 'active' })
    setTimeout(async () => {
      try {
        await refetch()
      } catch (error) {
        console.error('Error in manual refetch:', error)
      }
    }, 500)
  }

  if (!token) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-tight text-slate-400">Bảng điều khiển khu phố</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Bảng điều khiển Khu phố</h1>
              <p className="mt-1 text-sm text-slate-500">Quản lý phản ánh từ người dân Phường Tăng Nhơn Phú</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
              >
                <Plus size={18} />
                <span>Gửi phản ánh</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl bg-gradient-to-r from-[#284EE3] to-[#5E7CF8] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'N'}
              </div>
              <div>
                <p className="text-xs uppercase tracking-tight text-white/70">Khu phố 5</p>
                <h3 className="text-2xl font-semibold">{user?.name || 'Nguyễn Văn A'}</h3>
                <p className="text-white/80">Phường Tăng Nhơn Phú · Quận 9, TP. Thủ Đức</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2">
                <Phone size={16} />
                <span>{user?.email || '0901234567'}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2">
                <User size={16} />
                <span>{user?.name || 'Nguyễn Văn A'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {
            [
              { title: 'Tổng phản ánh', value: totalReports, icon: <MessageSquare size={20} />, accent: 'text-blue-600 bg-blue-50 ring-blue-100' },
              { title: 'Chờ xử lý', value: pendingReports, icon: <Clock size={20} />, accent: 'text-amber-600 bg-amber-50 ring-amber-100' },
              { title: 'Đã hoàn thành', value: completedReports, icon: <CheckCircle2 size={20} />, accent: 'text-emerald-600 bg-emerald-50 ring-emerald-100' },
              { title: 'Đang xử lý', value: inProgressReports, icon: <Edit size={20} />, accent: 'text-purple-600 bg-purple-50 ring-purple-100' },
            ].map((card) => (
              <div key={card.title} className="rounded-3xl border border-white/60 bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-500">{card.title}</h4>
                  <span className={`inline-flex items-center justify-center rounded-2xl px-3 py-1 text-sm font-semibold ${card.accent}`}>
                    {card.icon}
                  </span>
                </div>
                <p className="mt-3 text-4xl font-semibold text-slate-900">{card.value}</p>
              </div>
            ))
          }
        </section>

        <section className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center">
          <div className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo mã phản ánh..."
              className="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center gap-2 rounded-2xl border border-blue-500 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <span>{statusFilter === 'all' ? 'Tất cả trạng thái' : statusFilter}</span>
                <Filter size={18} className="text-slate-400" />
              </button>

              {isFilterDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFilterDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-2xl border-2 border-blue-500 bg-white shadow-xl">
                    <div className="py-2">
                      {[
                        { value: 'all', label: 'Tất cả trạng thái' },
                        { value: 'Mới', label: 'Mới' },
                        { value: 'Chờ xử lý', label: 'Chờ xử lý' },
                        { value: 'Đang xử lý', label: 'Đang xử lý' },
                        { value: 'Hoàn thành', label: 'Hoàn thành' },
                      ].map((option) => {
                        const isSelected = statusFilter === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setStatusFilter(option.value)
                              setIsFilterDropdownOpen(false)
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm font-medium transition ${
                              isSelected
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isSelected && <Check size={16} className="text-blue-600" />}
                              <span>{option.label}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-6 py-4">Mã phản ánh</th>
                  <th className="px-6 py-4">Người gửi</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4">Địa điểm</th>
                  <th className="px-6 py-4">Ngày gửi</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : reportsError ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10">
                      <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
                        <p className="text-sm font-semibold text-red-600">Không thể tải dữ liệu</p>
                        <p className="mt-1 text-xs text-red-500">{reportsError}</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                      {searchQuery ? `Không tìm thấy phản ánh với mã "${searchQuery}"` : 'Chưa có phản ánh nào'}
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const statusLabel = getReportStatus(report)
                    const categoryName = getCategoryName(report)

                    return (
                      <tr key={report.id} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-semibold text-slate-900">{report.ma_phan_anh}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{report.ten_nguoi_phan_anh || 'N/A'}</div>
                          <p className="text-xs text-slate-500">{report.sdt_nguoi_phan_anh || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-900">{report.vi_tri || '---'}</td>
                        <td className="px-6 py-4 text-slate-900">{formatDate(report.thoi_gian_tao)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(statusLabel)}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedReportCode(report.ma_phan_anh)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                          >
                            <Eye size={14} />
                            Xem
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <DashboardReportModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={handleReportSuccess}
      />

      <DashboardReportDetailsModal
        open={Boolean(selectedReportCode)}
        code={selectedReportCode}
        onClose={() => setSelectedReportCode(null)}
      />
    </div>
  )
}
