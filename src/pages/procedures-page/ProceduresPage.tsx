import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Button, Tag, Spin, Empty, Row, Col, Input } from 'antd'
import { ArrowRightOutlined, SearchOutlined } from '@ant-design/icons'
import { useProcedureFields, useProcedureFieldCounts } from '../../features/procedure-fields'
import { useProcedures } from '../../features/procedures'
import { ProcedureDetailModal } from './ProcedureDetailModal'

const LINH_VUC_COLORS: { [key: string]: string } = {
  'Tài Nguyên Và Môi Trường': 'green',
  'Y Tế': 'red',
  'Chứng Thực - Sao Y': 'orange',
  'Giáo Dục Và Đào Tạo': 'blue',
  'Kinh Tế - Hạ Tầng Và Đô Thị': 'purple',
  'Văn Hóa - Xã Hội': 'magenta',
  'Lao Động - Tiền Lương': 'gold',
  'Hộ Tích': 'cyan',
  'Xây Dựng': 'volcano',
  'Khác': 'default',
}

// Component to render a single filter button with its count
const FilterButton: React.FC<{
  label: string
  isActive: boolean
  onClick: () => void
  count: number
}> = ({ label, isActive, onClick, count }) => {
  return (
    <button
      onClick={onClick}
      className={
        isActive
          ? 'px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold border border-blue-600 transition-colors'
          : 'px-6 py-2 rounded-lg bg-white text-gray-800 font-normal border border-gray-300 hover:text-blue-600 hover:border-blue-600 transition-colors'
      }
    >
      {label} ({count})
    </button>
  )
}

export const ProceduresPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const idLinhVucFromUrl = searchParams.get('idLinhVuc')
  
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 12
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Fetch lĩnh vực từ API
  const { fields: linhVucList, isLoading: isLoadingFields } = useProcedureFields()
  
  // Fetch counts từ API mới
  const { counts: fieldCounts, isLoading: isLoadingCounts } = useProcedureFieldCounts()
  
  // Fetch procedures with server-side pagination (size=12)
  const { 
    procedures: displayProcedures, 
    pagination,
    isLoading,
    isFetching 
  } = useProcedures({
    page,
    size: pageSize,
    isActive: true,
    search: debouncedSearch || undefined,
    idLinhVuc: activeFilter !== 'all' ? activeFilter : undefined,
  })

  // Tạo map count theo id để tra cứu nhanh
  const countMap = useMemo(() => {
    const map: { [key: string]: number } = {}
    let totalCount = 0
    
    fieldCounts.forEach(item => {
      map[item.id] = item.tong_thu_tuc
      totalCount += item.tong_thu_tuc
    })
    
    map['all'] = totalCount
    return map
  }, [fieldCounts])

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setPage(1) // Reset về trang 1 khi search
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Set active filter from URL parameter when component mounts or URL changes
  useEffect(() => {
    if (idLinhVucFromUrl && linhVucList.length > 0) {
      const fieldExists = linhVucList.find(f => f.id === idLinhVucFromUrl)
      if (fieldExists) {
        setActiveFilter(idLinhVucFromUrl)
      }
    }
  }, [idLinhVucFromUrl, linhVucList])

  const handleFilterChange = (key: string) => {
    setActiveFilter(key)
    setPage(1) // Reset về trang 1 khi đổi filter
  }

  const handleViewDetail = (id: string) => {
    setSelectedProcedureId(id)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedProcedureId(null)
  }

  // Scroll to top khi chuyển trang
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  return (
    <div className="pt-6 sm:pt-8 lg:pt-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card với Search và Filters */}
        <Card 
          className="mb-8 shadow-md"
          styles={{
            body: { padding: '24px' }
          }}
        >
          {/* Title & Description */}
          <div className="mb-6">
            <h2 className="text-2xl mb-1">Thủ tục hành chính</h2>
            <p className="text-gray-600">Tra cứu và hướng dẫn các thủ tục hành chính tại phường</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <Input
              size="large"
              placeholder="Tìm kiếm thủ tục..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="w-full"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {isLoadingFields || isLoadingCounts ? (
              <Spin />
            ) : (
              <>
                <FilterButton
                  label="Tất cả"
                  isActive={activeFilter === 'all'}
                  onClick={() => handleFilterChange('all')}
                  count={countMap['all'] || 0}
                />
                {linhVucList
                  .filter((field) => field.is_active)
                  .map((field) => (
                    <FilterButton
                      key={field.id}
                      label={field.ten_linh_vuc}
                      isActive={activeFilter === field.id}
                      onClick={() => handleFilterChange(field.id)}
                      count={countMap[field.id] || 0}
                    />
                  ))}
              </>
            )}
          </div>

          {/* Loading State - chỉ khi load lần đầu */}
          {isLoading && displayProcedures.length === 0 ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : displayProcedures.length === 0 ? (
            <div className="flex justify-center py-20">
              <Empty description="Không có thủ tục nào" />
            </div>
          ) : (
            <>
              {/* Procedures Grid với loading overlay khi fetching */}
              <div className="relative">
                {/* Loading overlay khi đang fetch trang mới */}
                {isFetching && displayProcedures.length > 0 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <Spin size="large" />
                  </div>
                )}
                
                <Row gutter={[24, 24]} className="mb-8 mt-8">
                  {displayProcedures.map((procedure) => (
                    <Col key={procedure.id} xs={24} md={12} lg={8}>
                      <Card
                        hoverable
                        className="h-full cursor-pointer"
                        onClick={() => handleViewDetail(procedure.id)}
                        styles={{
                          body: { 
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            minHeight: '240px'
                          }
                        }}
                      >
                        <div className="flex flex-col h-full">
                          {/* Badges - Show all linh vuc */}
                          <div className="mb-3 flex flex-wrap gap-2 flex-shrink-0">
                            {procedure.linh_vuc && procedure.linh_vuc.length > 0 ? (
                              procedure.linh_vuc.map((linhVuc, index) => (
                                <Tag key={index} color={LINH_VUC_COLORS[linhVuc] || 'default'}>
                                  {linhVuc}
                                </Tag>
                              ))
                            ) : (
                              <Tag color="default">Khác</Tag>
                            )}
                          </div>

                          {/* Title - Clamp lines to avoid overflow */}
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                            {procedure.ten_thu_tuc}
                          </h3>

                          {/* Description - Clamp lines to avoid overflow */}
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {procedure.doi_tuong_thuc_hien || 'Mô tả chi tiết sẽ được cập nhật'}
                          </p>

                          {/* Button - Always at bottom */}
                          <div className="mt-auto pt-2">
                            <div className="w-full text-left text-blue-500 hover:text-blue-600 font-normal flex items-center gap-1 transition-colors">
                              <span>Xem chi tiết</span>
                              <ArrowRightOutlined className="text-sm" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Pagination - dựa vào API pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2">
                    <Button
                      disabled={page === 1 || isFetching}
                      onClick={() => setPage(page - 1)}
                    >
                      Trước
                    </Button>
                    
                    <span className="px-4 text-gray-600">
                      Trang {page} / {pagination.totalPages}
                    </span>
                    
                    <Button
                      disabled={page === pagination.totalPages || isFetching}
                      onClick={() => setPage(page + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Procedure Detail Modal */}
      <ProcedureDetailModal
        procedureId={selectedProcedureId}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

