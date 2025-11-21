import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, Tag, Space, Divider, Button, Row, Col, List } from 'antd'
import { CalendarOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons'
import { useNewsById } from '../../features/news'
import { useNewsList } from '../../features/news'

export const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { news, isLoading, error } = useNewsById(id || '')
  
  // Fetch related news from the same category
  const { newsList: relatedNews, isLoading: isLoadingRelated } = useNewsList({
    page: 1,
    size: 5,
    isActive: true,
    idDanhMuc: news?.id_danh_muc,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy tin tức</h2>
            <Button type="primary" onClick={() => navigate(-1)}>
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Filter out current news from related news
  const filteredRelatedNews = relatedNews.filter(item => item.id !== news.id).slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Back button */}
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            Quay lại danh sách tin tức
          </Button>

          {/* Article content */}
          <article className="bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <div className="pb-6">
              <Tag color="blue" className="mb-4">
                {news.danh_muc_tin_tuc.ten_danh_muc}
              </Tag>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{news.tieu_de}</h1>

              <Space size="large" className="text-gray-500 mb-6">
                <Space size="small">
                  <CalendarOutlined />
                  <span>{formatDate(news.thoi_gian_tao)}</span>
                </Space>
                {news.tac_gia && (
                  <Space size="small">
                    <UserOutlined />
                    <span>Tác giả: {news.tac_gia}</span>
                  </Space>
                )}
              </Space>

              <Divider />
            </div>

            {/* Body with 2 columns */}
            <Row gutter={24}>
              {/* Left Column - Content */}
              <Col xs={24} md={14}>
                <div className="prose prose-lg max-w-none text-gray-700">
                  <div 
                    dangerouslySetInnerHTML={{ __html: news.noi_dung }}
                    style={{
                      // Style for links
                      '--link-color': '#2563eb',
                      '--link-hover-color': '#1d4ed8',
                    } as React.CSSProperties}
                    className="news-content"
                  />
                </div>
                <style>{`
                  .news-content a {
                    color: #2563eb !important;
                    text-decoration: underline !important;
                    cursor: pointer !important;
                  }
                  .news-content a:hover {
                    color: #1d4ed8 !important;
                    text-decoration: underline !important;
                  }
                  .news-content img {
                    border-radius: 8px !important;
                  }
                `}</style>
              </Col>

              {/* Right Column - Featured Image & Related News */}
              <Col xs={24} md={10}>
                {/* Featured image */}
                {news.url_anh_dai_dien && (
                  <div className="mb-6">
                    <img
                      src={`https://ubnd-api-staging.noah-group.org${news.url_anh_dai_dien}`}
                      alt={news.tieu_de}
                      className="w-full rounded-lg object-cover"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                )}

                {/* Related News */}
                {filteredRelatedNews.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tin tức liên quan</h3>
                    {isLoadingRelated ? (
                      <div className="flex justify-center py-4">
                        <Spin size="small" />
                      </div>
                    ) : (
                      <List
                        dataSource={filteredRelatedNews}
                        renderItem={(item) => (
                          <List.Item
                            key={item.id}
                            className="!border-b !border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer !px-0"
                            onClick={() => navigate(`/news/${item.id}`)}
                          >
                            <div className="flex gap-3 w-full">
                              {item.url_anh_dai_dien && (
                                <img
                                  width={80}
                                  height={60}
                                  alt={item.tieu_de}
                                  src={`https://ubnd-api-staging.noah-group.org${item.url_anh_dai_dien}`}
                                  className="rounded object-cover flex-shrink-0"
                                  style={{ width: 80, height: 60 }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 mb-1">
                                  {item.tieu_de}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {formatDateShort(item.thoi_gian_tao)}
                                </span>
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    )}
                  </div>
                )}
              </Col>
            </Row>

            {/* Footer */}
            <div className="pt-8 pb-2">
              <Divider />
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Cập nhật lần cuối: {formatDate(news.thoi_gian_cap_nhat)}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
