import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Button, Tag, Spin, Empty, Row, Col, Input } from 'antd'
import { ClockCircleOutlined, DollarOutlined, ArrowRightOutlined, SearchOutlined } from '@ant-design/icons'
import { useProcedureFields } from '../../features/procedure-fields'
import { proceduresApi, type Procedure } from '../../features/procedures/api/proceduresApi'
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
export const ProceduresPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const idLinhVucFromUrl = searchParams.get('idLinhVuc')
  
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 12
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [allProcedures, setAllProcedures] = useState<Procedure[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch lĩnh vực từ API
  const { fields: linhVucList, isLoading: isLoadingFields } = useProcedureFields()

  // Set active filter from URL parameter when component mounts or URL changes
  useEffect(() => {
    if (idLinhVucFromUrl && linhVucList.length > 0) {
      const fieldExists = linhVucList.find(f => f.id === idLinhVucFromUrl)
      if (fieldExists) {
        setActiveFilter(idLinhVucFromUrl)
      }
    }
  }, [idLinhVucFromUrl, linhVucList])

  // Fetch all procedures once
  useEffect(() => {
    const fetchAllProcedures = async () => {
      setIsLoading(true)
      try {
        console.log('🔄 Fetching all procedures with pagination...')
        
        // Lấy trang đầu tiên để biết tổng số
        const firstResponse = await proceduresApi.getProcedures({
          page: 1,
          size: 100, // Thử lấy 100 items/page
          isActive: true
        })
        
        console.log('✅ First page - Total items:', firstResponse.pagination?.totalItems)
        console.log('📊 Pagination info:', firstResponse.pagination)
        
        let allProceduresData = [...firstResponse.data]
        
        // Nếu có nhiều trang, lấy tiếp các trang còn lại
        if (firstResponse.pagination && firstResponse.pagination.totalPages > 1) {
          const totalPages = firstResponse.pagination.totalPages
          console.log(`📄 Fetching remaining ${totalPages - 1} pages...`)
          
          const promises = []
          for (let page = 2; page <= totalPages; page++) {
            promises.push(
              proceduresApi.getProcedures({
                page,
                size: 100,
                isActive: true
              })
            )
          }
          
          const remainingResponses = await Promise.all(promises)
          remainingResponses.forEach(response => {
            allProceduresData = [...allProceduresData, ...response.data]
          })
        }
        
        console.log('✅ Total procedures fetched:', allProceduresData.length)
        setAllProcedures(allProceduresData)
      } catch (error) {
        console.error('❌ Error fetching procedures:', error)
        setAllProcedures([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllProcedures()
  }, [])

  // Filter procedures based on active filter
  const filteredProcedures = useMemo(() => {
    console.log('🔍 Filtering - activeFilter:', activeFilter)
    console.log('📦 allProcedures count:', allProcedures.length)
    
    // If search query has content but only whitespace, return empty
    if (searchQuery && !searchQuery.trim()) {
      console.log('⚠️ Search query contains only whitespace - returning empty')
      return []
    }
    
    let filtered = allProcedures
    
    // Filter by category
    if (activeFilter !== 'all') {
      const selectedField = linhVucList.find(f => f.id === activeFilter)
      console.log('🏷️ Selected field:', selectedField)
      
      if (selectedField) {
        filtered = filtered.filter(p => 
          p.linh_vuc && p.linh_vuc.includes(selectedField.ten_linh_vuc)
        )
      } else {
        filtered = []
      }
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(p =>
        p.ten_thu_tuc.toLowerCase().includes(query) ||
        p.doi_tuong_thuc_hien?.toLowerCase().includes(query) ||
        p.ma_thu_tuc?.toLowerCase().includes(query)
      )
    }
    
    console.log('✅ Filtered procedures:', filtered.length)
    return filtered
  }, [allProcedures, activeFilter, linhVucList, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredProcedures.length / pageSize)
  const paginatedProcedures = filteredProcedures.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  // Calculate counts for filter buttons
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {
      all: allProcedures.length
    }
    
    linhVucList.forEach(field => {
      counts[field.id] = allProcedures.filter(p => 
        p.linh_vuc && p.linh_vuc.includes(field.ten_linh_vuc)
      ).length
    })
    
    console.log('🔢 Category counts:', counts)
    return counts
  }, [allProcedures, linhVucList])

  // Tạo danh sách filter từ API
  const filterButtons = useMemo(() => {
    const allButton = { 
      key: 'all', 
      label: 'Tất cả',
      count: categoryCounts['all'] || 0
    }
    const fieldButtons = linhVucList
      .filter((field) => field.is_active)
      .map((field) => ({
        key: field.id,
        label: field.ten_linh_vuc,
        count: categoryCounts[field.id] || 0
      }))
    return [allButton, ...fieldButtons]
  }, [linhVucList, categoryCounts])

  const handleFilterChange = (key: string) => {
    setActiveFilter(key)
    setPage(1)
  }

  const handleViewDetail = (id: string) => {
    setSelectedProcedureId(id)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedProcedureId(null)
  }

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
            {isLoadingFields ? (
              <Spin />
            ) : (
              filterButtons.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleFilterChange(filter.key)}
                  className={
                    activeFilter === filter.key
                      ? 'px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold border border-blue-600 transition-colors'
                      : 'px-6 py-2 rounded-lg bg-white text-gray-800 font-normal border border-gray-300 hover:text-blue-600 hover:border-blue-600 transition-colors'
                  }
                >
                  {filter.label} ({filter.count})
                </button>
              ))
            )}
          </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : paginatedProcedures.length === 0 ? (
          <div className="flex justify-center py-20">
            <Empty description="Không có thủ tục nào" />
          </div>
        ) : (
          <>
            {/* Procedures Grid */}
            <Row gutter={[24, 24]} className="mb-8 mt-8">
              {paginatedProcedures.map((procedure) => (
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
                        minHeight: '320px'
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

                      {/* Info - Fixed height */}
                      <div className="space-y-2 mb-4 flex-shrink-0 h-[64px]">
                      <div className="flex items-center text-sm text-gray-600">
                          <ClockCircleOutlined className="mr-2 text-blue-500 flex-shrink-0" />
                          <span className="line-clamp-1">
                          {procedure.cach_thuc?.[0]?.thoi_gian_giai_quyet || 'Đang cập nhật thời gian'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                          <DollarOutlined className="mr-2 text-green-500 flex-shrink-0" />
                          <span className="line-clamp-1">
                          {procedure.cach_thuc?.[0]?.le_phi 
                            ? (parseInt(procedure.cach_thuc[0].le_phi) > 0 
                                ? `${parseInt(procedure.cach_thuc[0].le_phi).toLocaleString('vi-VN')} đ` 
                                : 'Miễn phí')
                            : 'Đang cập nhật phí'}
                        </span>
                      </div>
                    </div>

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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Trước
                  </Button>
                  
                  <span className="px-4 text-gray-600">
                    Trang {page} / {totalPages}
                  </span>
                  
                  <Button
                    disabled={page === totalPages}
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

