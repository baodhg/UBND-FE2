import React, { useState, useEffect, useMemo } from 'react'
import { Card, Button, Tag, Spin, Empty, Row, Col } from 'antd'
import { ClockCircleOutlined, DollarOutlined, ArrowRightOutlined } from '@ant-design/icons'
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
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)
  const pageSize = 12
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [allProcedures, setAllProcedures] = useState<Procedure[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch lĩnh vực từ API
  const { fields: linhVucList, isLoading: isLoadingFields } = useProcedureFields()

  // Fetch all procedures once
  useEffect(() => {
    const fetchAllProcedures = async () => {
      setIsLoading(true)
      try {
        console.log('🔄 Fetching all procedures from /thu-tuc/all...')
        const data = await proceduresApi.getAllProcedures()
        console.log('✅ API Response - Total procedures:', data.length)
        console.log('📊 Sample procedure:', data[0])
        
        // Không filter is_active nữa, lấy tất cả procedures
        console.log('✅ Setting all procedures:', data.length)
        console.log('📋 All procedures list:', data)
        
        setAllProcedures(data)
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
    
    if (activeFilter === 'all') {
      console.log('✅ Showing all procedures')
      return allProcedures
    }
    
    const selectedField = linhVucList.find(f => f.id === activeFilter)
    console.log('🏷️ Selected field:', selectedField)
    
    if (!selectedField) {
      console.log('⚠️ No field found for filter:', activeFilter)
      return []
    }
    
    const filtered = allProcedures.filter(p => 
      p.linh_vuc && p.linh_vuc.includes(selectedField.ten_linh_vuc)
    )
    console.log('✅ Filtered procedures:', filtered.length)
    
    return filtered
  }, [allProcedures, activeFilter, linhVucList])

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

  // Helper function to get first linh vuc name
  const getFirstLinhVuc = (linhVucArray: string[]) => {
    if (!linhVucArray || linhVucArray.length === 0) return 'Khác'
    return linhVucArray[0]
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thủ tục hành chính</h1>
          <p className="text-gray-600">Tra cứu và thực hiện các thủ tục hành chính trực tuyến</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          {isLoadingFields ? (
            <Spin />
          ) : (
            filterButtons.map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={
                  activeFilter === filter.key
                    ? 'px-6 py-2 rounded-full bg-blue-500 text-white font-semibold border border-blue-500 transition-colors'
                    : 'px-6 py-2 rounded-full bg-white text-gray-800 font-normal border border-gray-300 hover:text-blue-500 hover:border-blue-500 transition-colors'
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
            <Row gutter={[24, 24]} className="mb-8">
              {paginatedProcedures.map((procedure) => (
                <Col key={procedure.id} xs={24} md={12} lg={8}>
                  <Card
                    hoverable
                    className="h-full flex flex-col"
                    styles={{
                      body: { 
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                      }
                    }}
                  >
                    {/* Badge */}
                    <div className="mb-3">
                      <Tag color={LINH_VUC_COLORS[getFirstLinhVuc(procedure.linh_vuc)] || 'default'}>
                        {getFirstLinhVuc(procedure.linh_vuc)}
                      </Tag>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[56px]">
                      {procedure.ten_thu_tuc}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                      {procedure.doi_tuong_thuc_hien || 'Mô tả chi tiết sẽ được cập nhật'}
                    </p>

                    {/* Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockCircleOutlined className="mr-2 text-blue-500" />
                        <span>
                          {procedure.cach_thuc?.[0]?.thoi_gian_giai_quyet || 'Đang cập nhật thời gian'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarOutlined className="mr-2 text-green-500" />
                        <span>
                          {procedure.cach_thuc?.[0]?.le_phi 
                            ? (parseInt(procedure.cach_thuc[0].le_phi) > 0 
                                ? `${parseInt(procedure.cach_thuc[0].le_phi).toLocaleString('vi-VN')} đ` 
                                : 'Miễn phí')
                            : 'Đang cập nhật phí'}
                        </span>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => handleViewDetail(procedure.id)}
                      className="w-full text-left text-blue-500 hover:text-blue-600 font-normal flex items-center gap-1 transition-colors"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRightOutlined className="text-sm" />
                    </button>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
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

