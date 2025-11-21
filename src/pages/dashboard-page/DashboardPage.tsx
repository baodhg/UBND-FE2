import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAppSelector } from '../../store/hooks'
import { useReportsList } from '../../features/reports/hooks/useReportsList'
import { useReportCategories } from '../../features/report-categories'
import type { Report } from '../../features/reports/api/getReportsList'
import { DashboardReportModal } from './DashboardReportModal'
import { DashboardReportDetailsModal } from './DashboardReportDetailsModal'
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Edit, 
  Search, 
  Filter,
  Eye,
  User,
  Phone,
  LogOut,
  House,
  FileText,
  Newspaper,
  Menu,
  Plus
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, token } = useAppSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReportCode, setSelectedReportCode] = useState<string | null>(null)
  const { categories } = useReportCategories({
    page: 1,
    size: 100,
    isActive: true,
  })
  
  const { reports, isLoading, error: reportsError, refetch } = useReportsList({
    page: 1,
    size: 10,
    maPhanAnh: searchQuery || undefined, // Tìm kiếm theo mã phản ánh
    search: searchQuery || undefined, // Tìm kiếm chung (nếu backend hỗ trợ)
    trangThai: statusFilter !== 'all' ? statusFilter : undefined,
    sortTime: 'desc', // Mới nhất trước
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

  // Calculate summary statistics
  const totalReports = reports.length
  const pendingReports = reports.filter((report) => {
    const status = getReportStatus(report)
    return status === 'Mới' || status === 'Chờ xử lý'
  }).length
  const completedReports = reports.filter((report) => getReportStatus(report) === 'Hoàn thành').length
  const inProgressReports = reports.filter((report) => getReportStatus(report) === 'Đang xử lý').length

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
        return 'bg-green-100 text-green-800'
      case 'Đang xử lý':
        return 'bg-blue-100 text-blue-800'
      case 'Mới':
        return 'bg-yellow-100 text-yellow-800'
      case 'Chờ xử lý':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  // Refresh reports list when a new report is submitted
  const handleReportSuccess = async () => {
    console.log('handleReportSuccess called - refreshing reports list...')
    
    // Clear search query first to show all reports including the new one
    setSearchQuery('')
    
    // Wait for state to update and backend to process the new report
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Invalidate all reportsList queries to force refresh with new params (no search query)
    await queryClient.invalidateQueries({ 
      queryKey: ['reportsList'],
      refetchType: 'active' // Force refetch active queries
    })
    
    // Also manually refetch to ensure we get the latest data
    setTimeout(async () => {
      try {
        const result = await refetch()
        console.log('Manual refetch completed')
        console.log('Reports in state:', reports.length)
        console.log('Reports from refetch:', result.data?.data?.length || 0)
        if (result.data?.data) {
          console.log('Latest reports:', result.data.data.map((r: any) => ({ 
            ma_phan_anh: r.ma_phan_anh, 
            tieu_de: r.tieu_de,
            trang_thai: r.trang_thai 
          })))
        }
      } catch (error) {
        console.error('Error in manual refetch:', error)
      }
    }, 500)
    
    console.log('Queries invalidated, React Query will auto-refetch with cleared search')
  }

  if (!token) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="w-full">
          {/* Top Section */}
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-8 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center">
                <img 
                  src="https://hochiminhcity.gov.vn/o/portal-home-multi-theme/images/icons/quoc-huy.png" 
                  alt="Quốc huy Việt Nam" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-blue-700 text-base lg:text-lg">
                  Phường Tăng Nhơn Phú
                </h1>
                <p className="text-xs text-gray-500">
                  Quận 9, TP. Thủ Đức
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* User Info Box */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <User size={16} className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-800">{user?.name || 'Nguyễn Văn A'}</p>
                  <p className="text-xs text-gray-500">Khu Phố 5</p>
                </div>
              </div>
              
              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" 
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="hidden lg:flex items-center bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 flex items-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-5 py-4 transition-all relative text-blue-50 hover:bg-blue-700 hover:text-white"
              >
                <House size={18} />
                <span>Trang chủ</span>
              </button>
              
              <button
                onClick={() => navigate('/procedures')}
                className="flex items-center gap-2 px-5 py-4 transition-all relative text-blue-50 hover:bg-blue-700 hover:text-white"
              >
                <FileText size={18} />
                <span>Thủ tục hành chính</span>
              </button>
              
              <button
                onClick={() => navigate('/news')}
                className="flex items-center gap-2 px-5 py-4 transition-all relative text-blue-50 hover:bg-blue-700 hover:text-white"
              >
                <Newspaper size={18} />
                <span>Tin tức</span>
              </button>
              
              <button
                onClick={() => navigate('/report')}
                className="flex items-center gap-2 px-5 py-4 transition-all relative text-blue-50 hover:bg-blue-700 hover:text-white"
              >
                <MessageSquare size={18} />
                <span>Phản ánh</span>
              </button>
              
              <div className="flex-1"></div>
              
              <button
                className="flex items-center gap-2 px-5 py-4 transition-all relative bg-blue-800 text-white shadow-lg"
              >
                <User size={18} />
                <span>Bảng điều khiển</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400"></div>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-4 text-blue-50 hover:bg-red-600 hover:text-white transition-all border-l border-blue-500"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase() || 'N'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {user?.name || 'Nguyễn Văn A'}
              </h3>
              <p className="text-gray-600 text-sm mb-1">
                Khu Phố 5 - Phường Tăng Nhơn Phú
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone size={14} />
                <span>{user?.email || '0123 456 789'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Tổng phản ánh</h3>
              <MessageSquare size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalReports}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Chờ xử lý</h3>
              <Clock size={20} className="text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{pendingReports}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Đã hoàn thành</h3>
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{completedReports}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Đang xử lý</h3>
              <Edit size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{inProgressReports}</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã phản ánh, tên, loại, địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="Mới">Mới</option>
                <option value="Chờ xử lý">Chờ xử lý</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Hoàn thành">Hoàn thành</option>
              </select>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
            >
              <Plus size={18} />
              <span>Gửi phản ánh</span>
            </button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã phản ánh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người gửi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa điểm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày gửi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : reportsError ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-red-600 text-sm font-medium mb-2">Lỗi khi tải dữ liệu</p>
                        <p className="text-red-500 text-xs">{reportsError}</p>
                      </div>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => {
                    const statusLabel = getReportStatus(report)
                    const categoryName = getCategoryName(report)

                    return (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.ma_phan_anh}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">
                              {report.ten_nguoi_phan_anh || 'N/A'}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {report.sdt_nguoi_phan_anh || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {categoryName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {report.vi_tri}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(report.thoi_gian_tao)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(statusLabel)}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedReportCode(report.ma_phan_anh)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye size={16} />
                            <span>Xem</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Dashboard Report Modal */}
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

