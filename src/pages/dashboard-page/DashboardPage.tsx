import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAppSelector } from '../../store/hooks'
import { useReportsList } from '../../features/reports/hooks/useReportsList'
import { useReportCategories } from '../../features/report-categories'
import type { Report } from '../../features/reports/api/getReportsList'
import { DashboardReportModal } from './DashboardReportModal'
import { DashboardReportDetailsModal } from './DashboardReportDetailsModal'
import { MessageSquare, Clock, CheckCircle2, Edit, Search, Filter, Eye, User, Phone, LogOut, Plus } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, token } = useAppSelector((state) => state.auth)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReportCode, setSelectedReportCode] = useState<string | null>(null)

  const { categories } = useReportCategories({
    page: 1,
    size: 100,
    isActive: true,
  })

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 350)
    return () => clearTimeout(handler)
  }, [searchInput])

  const reportsQueryParams = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim()
    const isPotentialReportCode = /^[A-Za-z0-9]{6,}$/i.test(normalizedSearch)

    return {
    page: 1,
    size: 10,
      search: normalizedSearch || undefined,
      maPhanAnh: isPotentialReportCode ? normalizedSearch.toUpperCase() : undefined,
    trangThai: statusFilter !== 'all' ? statusFilter : undefined,
      sortTime: 'desc' as const,
    }
  }, [debouncedSearch, statusFilter])

  const { reports, isLoading, error: reportsError, refetch } = useReportsList(reportsQueryParams)

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    categories?.forEach((category) => {
      map[category.id] = category.ten
    })
    return map
  }, [categories])

  const STATUS_MAP: Record<string, string> = {
    DA_GUI: 'Đã gửi',
    DA_TIEP_NHAN: 'Đã tiếp nhận',
    DANG_XU_LY: 'Đang xử lý',
    DA_GIAI_QUYET: 'Đã giải quyết',
    DONG: 'Đóng',
  }

  const getReportStatus = (report: Report) => {
    const rawStatus =
      (report.trang_thai || '').trim() ||
      (report.trang_thai_hien_tai?.ma_trang_thai || '').trim() ||
      (report.trang_thai_hien_tai?.ten || '').trim()

    if (rawStatus) {
      // normalize key-like statuses
      const normalizedKey = rawStatus.toUpperCase().replace(/\s+/g, '_')
      return STATUS_MAP[normalizedKey] || rawStatus
    }

    if (report.lich_su_trang_thai && report.lich_su_trang_thai.length > 0) {
      const lastHistory = report.lich_su_trang_thai[report.lich_su_trang_thai.length - 1]
      const historyStatus = (lastHistory?.ten || lastHistory?.trang_thai || '').trim()
      if (historyStatus) return historyStatus
    }

    return 'Chờ xử lý'
  }

  const getCategoryName = useCallback((report: Report) => {
    if (report.linh_vuc?.ten_linh_vuc) return report.linh_vuc.ten_linh_vuc
    if (report.ten_linh_vuc) return report.ten_linh_vuc
    if (report.id_linh_vuc_phan_anh && categoryMap[report.id_linh_vuc_phan_anh]) {
      return categoryMap[report.id_linh_vuc_phan_anh]
    }
    return 'Chưa xác định'
  }, [categoryMap])

  const displayReports = useMemo(() => {
    const keyword = searchInput.trim().toLowerCase()
    return reports.filter((report) => {
      const categoryName = getCategoryName(report)
      const matchesKeyword =
        keyword.length === 0 ||
        [report.ma_phan_anh, report.ten_nguoi_phan_anh, report.sdt_nguoi_phan_anh, categoryName, report.vi_tri]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword))

      const matchesStatus =
        statusFilter === 'all' || getReportStatus(report).toLowerCase() === statusFilter.toLowerCase()

      const sentDate = report.thoi_gian_tao ? new Date(report.thoi_gian_tao) : null
      let matchesDate = true
      if (sentDate) {
        if (dateFilter.from) {
          const fromDate = new Date(dateFilter.from)
          matchesDate = matchesDate && sentDate >= fromDate
        }
        if (dateFilter.to) {
          const toDate = new Date(dateFilter.to)
          toDate.setHours(23, 59, 59, 999)
          matchesDate = matchesDate && sentDate <= toDate
        }
      } else if (dateFilter.from || dateFilter.to) {
        matchesDate = false
      }

      return matchesKeyword && matchesStatus && matchesDate
    })
  }, [reports, searchInput, statusFilter, dateFilter, getCategoryName])

  const totalReports = reports.length
  const pendingReports = reports.filter((report) => {
    const status = getReportStatus(report)
    return status === 'Mới' || status === 'Chờ xử lý'
  }).length
  const completedReports = reports.filter((report) => getReportStatus(report) === 'Hoàn thành').length
  const inProgressReports = reports.filter((report) => getReportStatus(report) === 'Đang xử lý').length

  const statCards = [
    { title: 'Tổng phản ánh', value: totalReports, icon: <MessageSquare size={20} />, accent: 'text-blue-600 bg-blue-50 ring-blue-100' },
    { title: 'Chờ xử lý', value: pendingReports, icon: <Clock size={20} />, accent: 'text-amber-600 bg-amber-50 ring-amber-100' },
    { title: 'Đã hoàn thành', value: completedReports, icon: <CheckCircle2 size={20} />, accent: 'text-emerald-600 bg-emerald-50 ring-emerald-100' },
    { title: 'Đang xử lý', value: inProgressReports, icon: <Edit size={20} />, accent: 'text-purple-600 bg-purple-50 ring-purple-100' },
  ]

  const renderStatCard = (card: (typeof statCards)[number], index: number) => (
    <div key={`${card.title}-${index}`} className="rounded-3xl border border-white/60 bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-500">{card.title}</h4>
        <span className={`inline-flex items-center justify-center rounded-2xl px-3 py-1 text-sm font-semibold ${card.accent}`}>
          {card.icon}
        </span>
      </div>
      <p className="mt-3 text-4xl font-semibold text-slate-900">{card.value}</p>
    </div>
  )

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
    setSearchInput('')
    setDebouncedSearch('')
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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Bảng điều khiển khu phố</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">Bảng điều khiển Khu phố</h1>
              <p className="mt-0.5 text-sm text-slate-500">Quản lý phản ánh từ người dân Phường Tăng Nhơn Phú</p>
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
                <p className="text-xs uppercase tracking-wide text-white/70">Khu phố 5</p>
                <h3 className="text-2xl font-semibold mt-0.5">{user?.name || 'Nguyễn Văn A'}</h3>
                <p className="text-white/80 mt-0.5">Phường Tăng Nhơn Phú · Quận 9, TP. Thủ Đức</p>
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

        <section className="mb-8">
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            <div className="space-y-3">
              {statCards.slice(0, 2).map((card, index) => renderStatCard(card, index))}
            </div>
            <div className="space-y-3">
              {statCards.slice(2).map((card, index) => renderStatCard(card, index + 2))}
            </div>
                </div>

          <div className="hidden sm:grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => renderStatCard(card, index))}
              </div>
        </section>

        <section className="mb-6 md:sticky md:top-4 md:z-20">
          <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 md:flex-row md:items-center md:flex-wrap">
            <div className="flex w-full md:flex-[1.5] items-center gap-3 rounded-2xl border border-slate-200 px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 bg-white">
              <Search size={18} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm theo mã, tên người gửi, loại, địa điểm..."
              className="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                autoComplete="off"
            />
          </div>
            <div className="flex w-full md:flex-[0.8] items-center gap-3">
              <div className="relative w-full">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Mới">Mới</option>
                <option value="Chờ xử lý">Chờ xử lý</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Hoàn thành">Hoàn thành</option>
              </select>
                <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 px-4 py-3 bg-white md:flex-[1.2]">
              <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-500">
                <span></span>
                {(dateFilter.from || dateFilter.to) && (
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => setDateFilter({ from: '', to: '' })}
                  >
                    Xóa
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">Từ ngày</label>
                  <input
                    type="date"
                    value={dateFilter.from}
                    onChange={(e) => setDateFilter((prev) => ({ ...prev, from: e.target.value }))}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">Đến ngày</label>
                  <input
                    type="date"
                    value={dateFilter.to}
                    onChange={(e) => setDateFilter((prev) => ({ ...prev, to: e.target.value }))}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-100 p-4 md:p-0">
          {isLoading ? (
            <div className="px-6 py-10 text-center text-slate-500">Đang tải dữ liệu...</div>
          ) : reportsError ? (
            <div className="px-6 py-10">
              <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
                <p className="text-sm font-semibold text-red-600">Không thể tải dữ liệu</p>
                <p className="mt-1 text-xs text-red-500">{reportsError}</p>
              </div>
            </div>
          ) : displayReports.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-500">Chưa có phản ánh nào</div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="space-y-4 md:hidden">
                {displayReports.map((report) => {
                  const statusLabel = getReportStatus(report)
                  const categoryName = getCategoryName(report)

                  return (
                    <div key={report.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Mã phản ánh</p>
                          <p className="text-lg font-semibold text-slate-900">{report.ma_phan_anh}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(statusLabel)}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3 text-sm text-slate-700">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Người gửi</span>
                          <div className="text-right">
                            <p className="font-semibold">{report.ten_nguoi_phan_anh || 'N/A'}</p>
                            {report.sdt_nguoi_phan_anh && (
                              <p className="text-xs text-slate-500">{report.sdt_nguoi_phan_anh}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Loại</span>
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {categoryName}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Địa điểm</span>
                          <span className="text-right text-slate-900">{report.vi_tri || '---'}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Ngày gửi</span>
                          <span className="text-slate-900">{formatDate(report.thoi_gian_tao)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedReportCode(report.ma_phan_anh)}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <Eye size={16} />
                        Xem chi tiết
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
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
                    {displayReports.map((report) => {
                    const statusLabel = getReportStatus(report)
                    const categoryName = getCategoryName(report)

                    return (
                      <tr key={report.id} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-semibold text-slate-900">{report.ma_phan_anh}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{report.ten_nguoi_phan_anh || 'N/A'}</div>
                          {report.sdt_nguoi_phan_anh && (
                            <p className="text-xs text-slate-500">{report.sdt_nguoi_phan_anh}</p>
                          )}
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
                    })}
              </tbody>
            </table>
          </div>
            </>
          )}
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
