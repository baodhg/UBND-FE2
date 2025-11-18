import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Tag, Space, Spin, Card, Tabs } from 'antd'
import { CalendarOutlined, SearchOutlined } from '@ant-design/icons'
import { useNewsList } from '../../features/news'
import { useNewsCategories } from '../../features/news-categories'

export const NewsPage: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const pageSize = 10

  // Reset về tab "Tất cả" mỗi khi vào trang
  useEffect(() => {
    setActiveTab('all')
    setSearch('')
    setPage(1)
  }, [])

  const { categories, isLoading: isCategoriesLoading } = useNewsCategories({
    isActive: true,
  })

  const { newsList, pagination, isLoading } = useNewsList({
    page,
    size: pageSize,
    isActive: true,
    search: search || undefined,
    idDanhMuc: activeTab !== 'all' ? activeTab : undefined,
  })

  console.log('News data:', { 
    newsList, 
    pagination, 
    total: newsList.length,
    activeTab,
    idDanhMuc: activeTab !== 'all' ? activeTab : undefined,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const tabItems = useMemo(() => {
    const allTab = { key: 'all', label: 'Tất cả' }
    const categoryTabs = categories.map((category) => ({
      key: category.id,
      label: category.ten_danh_muc,
    }))
    return [allTab, ...categoryTabs]
  }, [categories])

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <Card
          bordered={false}
          style={{
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Tin tức & Thông báo</h1>
            <p className="text-gray-500 text-sm mb-4">Cập nhật thông tin mới nhất từ phường</p>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(search)
                  }
                }}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm"
              />
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key)
              setPage(1)
            }}
            items={tabItems}
            className="mb-4"
          />

          {(isLoading || isCategoriesLoading) && page === 1 ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <List
              itemLayout="vertical"
              size="large"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: pagination?.totalItems || 0,
                onChange: (newPage) => setPage(newPage),
                showSizeChanger: false,
                showTotal: (total) => `Hiển thị ${Math.min((page - 1) * pageSize + 1, total)}-${Math.min(page * pageSize, total)} của ${total} tin tức`,
                className: "text-sm",
              }}
              dataSource={newsList}
              loading={isLoading}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  className="!border-b !border-gray-200 hover:bg-gray-50 transition-colors !px-0 cursor-pointer"
                  onClick={() => navigate(`/news/${item.id}`)}
                >
                  <div className="flex gap-4">
                    {/* Image on the left */}
                    {item.url_anh_dai_dien && (
                      <div className="relative flex-shrink-0">
                        <img
                          width={140}
                          height={100}
                          alt={item.tieu_de}
                          src={`https://ubnd-api-staging.noah-group.org${item.url_anh_dai_dien}`}
                          className="rounded-lg object-cover"
                          style={{ width: 140, height: 100 }}
                        />
                        <Tag 
                          color="blue" 
                          className="absolute top-1 left-1 text-xs"
                        >
                          {item.danh_muc_tin_tuc.ten_danh_muc}
                        </Tag>
                      </div>
                    )}
                    
                    {/* Content on the right */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 mb-2 line-clamp-2">
                        {item.tieu_de}
                      </h3>
                      <p 
                        className="text-sm text-gray-600 line-clamp-2 mb-3"
                        dangerouslySetInnerHTML={{
                          __html: item.noi_dung.substring(0, 150) + '...',
                        }}
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <Space size="middle">
                          <Space size={4}>
                            <CalendarOutlined />
                            <span>{formatDate(item.thoi_gian_tao)}</span>
                          </Space>
                          {item.tac_gia && (
                            <span>Tác giả: {item.tac_gia}</span>
                          )}
                        </Space>
                        <span className="text-blue-600 hover:text-blue-700 font-medium">
                          Đọc thêm →
                        </span>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  )
}

