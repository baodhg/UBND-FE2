import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAppSelector } from '../../store/hooks'
import { useReportsList } from '../../features/reports/hooks/useReportsList'
import { useReportCategories } from '../../features/report-categories'
import type { Report } from '../../features/reports/api/getReportsList'
import { DashboardReportModal } from './DashboardReportModal'
import { DashboardReportDetailsModal } from './DashboardReportDetailsModal'
import { useUserProfile, useUpdateUserProfile } from '../../features/user-profile/api'
import { MessageSquare, Clock, CheckCircle2, Edit, Search, Eye, Plus, Phone, Mail } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { token } = useAppSelector((state) => state.auth)
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile()
  const updateProfileMutation = useUpdateUserProfile()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({
    ho_va_ten: '',
    so_dien_thoai: '',
  })
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
      // Không filter trạng thái ở API, để client tự filter
      sortTime: 'desc' as const,
    }
  }, [debouncedSearch])

  const { reports, isLoading, error: reportsError, refetch } = useReportsList(reportsQueryParams)

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    categories?.forEach((category) => {
      map[category.id] = category.ten
    })
    return map
  }, [categories])

  const normalizeStatusKey = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/\s+/g, '_')

  const STATUS_MAP: Record<string, string> = {
    DA_GUI: 'Đã gửi',
    DA_TIEP_NHAN: 'Đã tiếp nhận',
    DANG_XU_LY: 'Đang xử lý',
    DA_GIAI_QUYET: 'Đã giải quyết',
    DONG: 'Đóng',
  }

  const getReportStatus = (report: Report): { key: string; label: string } => {
    const candidateStatuses: string[] = []

    const historyEntries = report.lich_su_trang_thai ?? []
    if (historyEntries.length > 0) {
      const latestHistory = historyEntries.reduce((latest, entry) => {
        const entryTime = entry?.thoi_gian_tao || entry?.thoi_gian
        if (!entryTime) return latest
        if (!latest) return entry
        const latestTime = latest?.thoi_gian_tao || latest?.thoi_gian
        if (!latestTime) return entry
        return new Date(entryTime) > new Date(latestTime) ? entry : latest
      }, null as (typeof historyEntries)[number] | null)

      if (latestHistory?.trang_thai) candidateStatuses.push(latestHistory.trang_thai)
      if (latestHistory?.ten) candidateStatuses.push(latestHistory.ten)
    }

    if (report.trang_thai_hien_tai?.ma_trang_thai) candidateStatuses.push(report.trang_thai_hien_tai.ma_trang_thai)
    if (report.trang_thai_hien_tai?.ten) candidateStatuses.push(report.trang_thai_hien_tai.ten)

    if (report.trang_thai) candidateStatuses.push(report.trang_thai)

    for (const statusValue of candidateStatuses) {
      const trimmed = statusValue?.trim()
      if (!trimmed) continue

      const normalizedKey = normalizeStatusKey(trimmed)
      const label = STATUS_MAP[normalizedKey]
      if (label) return { key: normalizedKey, label }

      const matchedLabelEntry = Object.entries(STATUS_MAP).find(
        ([, labelValue]) => labelValue.toLowerCase() === trimmed.toLowerCase()
      )
      if (matchedLabelEntry) {
        return { key: matchedLabelEntry[0], label: matchedLabelEntry[1] }
      }

      return { key: normalizedKey, label: trimmed }
    }

    return { key: 'CHUA_CAP_NHAT', label: 'Chờ xử lý' }
  }

  const getCategoryName = useCallback((report: Report) => {
    if (report.linh_vuc?.ten_linh_vuc) return report.linh_vuc.ten_linh_vuc
    if (report.ten_linh_vuc) return report.ten_linh_vuc
    if (report.id_linh_vuc_phan_anh && categoryMap[report.id_linh_vuc_phan_anh]) {
      return categoryMap[report.id_linh_vuc_phan_anh]
    }
    return 'Chưa xác định'
  }, [categoryMap])

  // Danh sách hiển thị chịu ảnh hưởng của search + trạng thái + ngày
  const displayReports = useMemo(() => {
    const keyword = searchInput.trim().toLowerCase()

    return reports.filter((report) => {
      const categoryName = getCategoryName(report)
      const matchesKeyword =
        keyword.length === 0 ||
        [report.ma_phan_anh, report.ten_nguoi_phan_anh, report.sdt_nguoi_phan_anh, categoryName, report.vi_tri]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword))

      const reportStatus = getReportStatus(report)
      const matchesStatus =
        statusFilter === 'all' || reportStatus.key === statusFilter

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

  // Count cho các statCards: luôn dựa trên toàn bộ danh sách reports (không phụ thuộc filter)
  const totalReports = reports.length
  const daGuiCount = reports.filter((report) => getReportStatus(report).key === 'DA_GUI').length
  const daTiepNhanCount = reports.filter((report) => getReportStatus(report).key === 'DA_TIEP_NHAN').length
  const dangXuLyCount = reports.filter((report) => getReportStatus(report).key === 'DANG_XU_LY').length
  const daGiaiQuyetCount = reports.filter((report) => getReportStatus(report).key === 'DA_GIAI_QUYET').length
  const dongCount = reports.filter((report) => getReportStatus(report).key === 'DONG').length

  const statCards = [
    { 
      title: 'Tổng phản ánh', 
      value: totalReports, 
      icon: <MessageSquare size={20} />, 
      accent: 'text-blue-600 bg-blue-50 ring-blue-100',
      filterKey: 'all' as const,
    },
    { 
      title: 'Đã gửi', 
      value: daGuiCount, 
      icon: <Clock size={20} />, 
      accent: 'text-amber-600 bg-amber-50 ring-amber-100',
      filterKey: 'DA_GUI' as const,
    },
    { 
      title: 'Đã tiếp nhận', 
      value: daTiepNhanCount, 
      icon: <CheckCircle2 size={20} />, 
      accent: 'text-green-600 bg-green-50 ring-green-100',
      filterKey: 'DA_TIEP_NHAN' as const,
    },
    { 
      title: 'Đang xử lý', 
      value: dangXuLyCount, 
      icon: <Edit size={20} />, 
      accent: 'text-purple-600 bg-purple-50 ring-purple-100',
      filterKey: 'DANG_XU_LY' as const,
    },
    { 
      title: 'Đã giải quyết', 
      value: daGiaiQuyetCount, 
      icon: <CheckCircle2 size={20} />, 
      accent: 'text-emerald-600 bg-emerald-50 ring-emerald-100',
      filterKey: 'DA_GIAI_QUYET' as const,
    },
    { 
      title: 'Đóng', 
      value: dongCount, 
      icon: <CheckCircle2 size={20} />, 
      accent: 'text-slate-600 bg-slate-50 ring-slate-100',
      filterKey: 'DONG' as const,
    },
  ]

  const renderStatCard = (card: (typeof statCards)[number], index: number) => {
    const isActive = statusFilter === card.filterKey || (card.filterKey === 'all' && statusFilter === 'all')

    return (
      <button
        key={`${card.title}-${index}`}
        type="button"
        onClick={() => setStatusFilter(card.filterKey)}
        className={`text-left rounded-3xl border bg-white p-5 shadow-sm ring-1 transition transform ${
          isActive
            ? 'border-blue-200 ring-blue-100 bg-blue-50/80 -translate-y-0.5'
            : 'border-white/60 ring-slate-100 hover:border-blue-100 hover:ring-blue-50 hover:-translate-y-0.5'
        }`}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-500">{card.title}</h4>
          <span className={`inline-flex items-center justify-center rounded-2xl px-3 py-1 text-sm font-semibold ${card.accent}`}>
            {card.icon}
          </span>
        </div>
        <p className="mt-3 text-4xl font-semibold text-slate-900">{card.value}</p>
      </button>
    )
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
      case 'Đã giải quyết':
        return 'bg-emerald-100 text-emerald-700'
      case 'Đang xử lý':
        return 'bg-cyan-100 text-cyan-700'
      case 'Đã tiếp nhận':
        return 'bg-blue-100 text-blue-700'
      case 'Đã gửi':
        return 'bg-amber-100 text-amber-700'
      case 'Đóng':
        return 'bg-slate-200 text-slate-800'
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
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl bg-blue-50 p-6 shadow-lg">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
                {isLoadingProfile ? '...' : userProfile?.ho_va_ten?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-slate-500">{userProfile?.ten_dang_nhap}</p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  {isLoadingProfile ? 'Đang tải...' : userProfile?.ho_va_ten}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-slate-600 mt-1 text-sm">
                  {userProfile?.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} />
                      <span>{userProfile.email}</span>
                    </div>
                  )}
                  {userProfile?.so_dien_thoai && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} />
                      <span>{userProfile.so_dien_thoai}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setProfileForm({
                  ho_va_ten: userProfile?.ho_va_ten || '',
                  so_dien_thoai: userProfile?.so_dien_thoai || '',
                })
                setIsProfileModalOpen(true)
              }}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 md:mt-0"
            >
              <Edit size={16} />
              <span>Cập nhật hồ sơ</span>
            </button>
          </div>
        </section>

        <section className="mb-8">
          {/* Responsive stat cards grid:
              - Mobile: 1 cột
              - Tablet (sm): 2 cột
              - Desktop (lg): 3 cột
              - Extra large (xl): 6 cột */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
            {/* <div className="flex w-full md:flex-[0.8] items-center gap-3">
              <div className="relative w-full">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="DA_GUI">Đã gửi</option>
                <option value="DA_TIEP_NHAN">Đã tiếp nhận</option>
                <option value="DANG_XU_LY">Đang xử lý</option>
                <option value="DA_GIAI_QUYET">Đã giải quyết</option>
                <option value="DONG">Đóng</option>
              </select>
                <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div> */}

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
                    onChange={(e) => {
                      const newFrom = e.target.value
                      setDateFilter((prev) => {
                        // Nếu 'to' nhỏ hơn 'from' mới thì reset 'to'
                        if (prev.to && newFrom && prev.to < newFrom) {
                          return { from: newFrom, to: '' }
                        }
                        return { ...prev, from: newFrom }
                      })
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500">Đến ngày</label>
                  <input
                    type="date"
                    value={dateFilter.to}
                    min={dateFilter.from || undefined}
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
                          const status = getReportStatus(report)
                  const categoryName = getCategoryName(report)

                  return (
                    <div key={report.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">Mã phản ánh</p>
                          <p className="text-lg font-semibold text-slate-900">{report.ma_phan_anh}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(status.label)}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3 text-sm text-slate-700">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Tiêu đề</span>
                          <span className="text-right font-semibold">
                            {report.tieu_de}
                          </span>
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
                  <th className="px-6 py-4">Tiêu đề</th>
                  <th className="px-6 py-4">Loại</th>
                  <th className="px-6 py-4">Địa điểm</th>
                  <th className="px-6 py-4">Ngày gửi</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                    {displayReports.map((report) => {
                        const status = getReportStatus(report)
                    const categoryName = getCategoryName(report)

                    return (
                      <tr key={report.id} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-4 font-semibold text-slate-900">{report.ma_phan_anh}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{report.tieu_de || '---'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {categoryName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-900">{report.vi_tri || '---'}</td>
                        <td className="px-6 py-4 text-slate-900">{formatDate(report.thoi_gian_tao)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(status.label)}`}>
                              {status.label}
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

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Cập nhật hồ sơ</h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Họ và tên</label>
                <input
                  type="text"
                  value={profileForm.ho_va_ten}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, ho_va_ten: e.target.value }))}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-500">Số điện thoại</label>
                <input
                  type="tel"
                  value={profileForm.so_dien_thoai}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, so_dien_thoai: e.target.value }))}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setIsProfileModalOpen(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={updateProfileMutation.isPending}
                onClick={async () => {
                  try {
                    await updateProfileMutation.mutateAsync({
                      hoVaTen: profileForm.ho_va_ten,
                      soDienThoai: profileForm.so_dien_thoai,
                    })
                    setIsProfileModalOpen(false)
                  } catch (error) {
                    console.error('Update profile failed', error)
                  }
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
