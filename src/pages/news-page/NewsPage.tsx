import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { List, Tag, Space, Spin, Card } from 'antd'
import { CalendarOutlined, SearchOutlined } from '@ant-design/icons'
import { useNewsList, useNewsCategoryCount } from '../../features/news'
import { useNewsCategories } from '../../features/news-categories'
import { resolveToAbsoluteUrl } from '../../utils/url'

// Component to render a single filter button with its count
const CategoryButton: React.FC<{
  label: string
  isActive: boolean
  onClick: () => void
  categoryId?: string
}> = ({ label, isActive, onClick, categoryId }) => {
  // Fetch count for this category using React Query hook
  const { count } = useNewsCategoryCount(categoryId)
  
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

export const NewsPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Get initial values from URL params
  const categoryFromUrl = searchParams.get('category') || 'all'
  const searchFromUrl = searchParams.get('search') || ''
  
  const [search, setSearch] = useState(searchFromUrl)
  const [debouncedSearch, setDebouncedSearch] = useState(searchFromUrl)
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState(categoryFromUrl)
  const pageSize = 10

  // Debounce search input để tránh spam API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500) // Đợi 500ms sau khi người dùng ngừng gõ

    return () => clearTimeout(handler)
  }, [search])

  // Sync state with URL params when they change
  useEffect(() => {
    const category = searchParams.get('category') || 'all'
    const searchQuery = searchParams.get('search') || ''
    setActiveTab(category)
    setSearch(searchQuery)
  }, [searchParams])

  const { categories, isLoading: isCategoriesLoading } = useNewsCategories({
    isActive: true,
  })

  const { newsList, pagination, isLoading } = useNewsList({
    page,
    size: pageSize,
    isActive: true,
    search: debouncedSearch || undefined, // Dùng debouncedSearch thay vì search
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

  // Strip HTML tags and get plain text
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const handleSearch = (value: string) => {
    setDebouncedSearch(value) // Cập nhật debouncedSearch ngay lập tức khi nhấn Enter
    setPage(1)
    // Update URL params
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    setSearchParams(params)
  }

  const filterButtons = useMemo(() => {
    const allButton = { 
      key: 'all', 
      label: 'Tất cả',
    }
    const categoryButtons = categories.map((category) => ({
      key: category.id,
      label: category.ten_danh_muc,
    }))
    return [allButton, ...categoryButtons]
  }, [categories])

  return (
    <div className="py-6 sm:py-8 lg:py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card
          variant="borderless"
          style={{
            borderRadius: '8px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          <div className="mb-6">
            <h2 className="text-2xl mb-1">Tin tức & Thông báo</h2>
            <p className="text-gray-600">Cập nhật thông tin mới nhất từ phường</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
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

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {isCategoriesLoading ? (
              <Spin />
            ) : (
              filterButtons.map((filter) => (
                <CategoryButton
                  key={filter.key}
                  label={filter.label}
                  isActive={activeTab === filter.key}
                  categoryId={filter.key !== 'all' ? filter.key : undefined}
                  onClick={() => {
                    setActiveTab(filter.key)
                    setPage(1)
                    // Update URL params
                    const params = new URLSearchParams(searchParams)
                    if (filter.key !== 'all') {
                      params.set('category', filter.key)
                    } else {
                      params.delete('category')
                    }
                    setSearchParams(params)
                  }}
                />
              ))
            )}
          </div>

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
                  <div className="flex gap-4 min-w-0 w-full">
                    {/* Image on the left */}
                    {item.url_anh_dai_dien && (
                      <div className="relative flex-shrink-0">
                        <img
                          width={140}
                          height={100}
                          alt={item.tieu_de}
                          src={resolveToAbsoluteUrl(item.url_anh_dai_dien)}
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
                    <div className="flex-1 min-w-0 overflow-hidden w-0">
                      <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 mb-2 line-clamp-2 break-words overflow-hidden">
                        {item.tieu_de}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3 break-words overflow-hidden">
                        {stripHtml(item.noi_dung).substring(0, 150)}...
                      </p>
                      <div className="flex flex-col gap-2 text-xs text-gray-500">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <Space size={4} className="flex-shrink-0">
                            <CalendarOutlined />
                            <span className="whitespace-nowrap">{formatDate(item.thoi_gian_tao)}</span>
                          </Space>
                          {item.tac_gia && (
                            <span className="break-words">Tác giả: {item.tac_gia}</span>
                          )}
                        </div>
                        <span className="text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap self-end">
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

