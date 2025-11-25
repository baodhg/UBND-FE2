import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NewsCard } from './NewsCard'
import { FeaturedNewsCard } from './FeaturedNewsCard'
import { ProcedureFieldsSection } from './ProcedureFieldsSection'
import { StatCard } from '../../components/molecules/StatCard'
import { ChevronRight, Newspaper, Users, FileText, CircleCheckBig, Clock, MessageSquare, Phone } from 'lucide-react'
import { useNewsList } from '../../features/news/hooks/useNewsList'
import { formatDate } from '../../utils/formatDate'
import { useQuery } from '@tanstack/react-query'
import { proceduresApi } from '../../features/procedures/api/proceduresApi'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  
  // Fetch news list - get 7 latest news (1 featured + 6 others)
  const { newsList, isLoading: isLoadingNews } = useNewsList({
    page: 1,
    size: 7,
    isActive: true,
  })

  // Fetch all procedures to count total
  const { data: allProcedures } = useQuery({
    queryKey: ['allProceduresCount'],
    queryFn: () => proceduresApi.getAllProcedures(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Helper function to strip HTML tags and get plain text
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  // Helper function to get excerpt from content
  const getExcerpt = (content: string, maxLength: number = 150) => {
    const plainText = stripHtml(content)
    if (plainText.length <= maxLength) return plainText
    return plainText.substring(0, maxLength) + '...'
  }

  // Default image if news doesn't have one
  const defaultNewsImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop'

  // Helper function to get full image URL
  const getImageUrl = (url: string | null) => {
    if (!url) return defaultNewsImage
    
    // If URL is already absolute (starts with http:// or https://), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // If URL is relative, prepend the base URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    // Remove /api from base URL if it exists
    const cleanBaseUrl = baseUrl.replace('/api', '')
    return `${cleanBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }

  // Map news from API to component props
  const featuredNews = useMemo(() => {
    if (!newsList || newsList.length === 0) return null
    
    const news = newsList[0]
    return {
      id: news.id,
      title: news.tieu_de,
      description: getExcerpt(news.noi_dung, 200),
      date: formatDate(news.thoi_gian_tao),
      author: news.tac_gia || undefined,
      category: news.danh_muc_tin_tuc?.ten_danh_muc || 'Tin tức',
      image: getImageUrl(news.url_anh_dai_dien),
    }
  }, [newsList])

  const otherNews = useMemo(() => {
    if (!newsList || newsList.length <= 1) return []
    
    return newsList.slice(1, 7).map(news => ({
      id: news.id,
      title: news.tieu_de,
      description: getExcerpt(news.noi_dung, 120),
      date: formatDate(news.thoi_gian_tao),
      author: news.tac_gia || undefined,
      category: news.danh_muc_tin_tuc?.ten_danh_muc || 'Tin tức',
      image: getImageUrl(news.url_anh_dai_dien),
    }))
  }, [newsList])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat text-white overflow-hidden"
        style={{
          backgroundImage: 'url("https://hochiminhcity.gov.vn/documents/39403/49303/background-trong-dong.png")'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25"></div>
        <div className="relative z-10 w-full py-4 sm:py-8 md:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center mb-6 sm:mb-8">
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 lg:mb-8 text-white"
                style={{
                  textShadow: 'rgba(0, 0, 0, 0.6) 3px 3px 10px, rgba(0, 0, 0, 0.4) 0px 0px 30px'
                }}
              >
                Cổng thông tin điện tử
              </h1>
              <div className="inline-block bg-white rounded-xl sm:rounded-2xl px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 shadow-2xl max-w-3xl w-full">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 lg:mb-5 leading-relaxed text-gray-800">
                  Kết nối cư dân với chính quyền địa phương
                </p>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-3 sm:mb-5 lg:mb-6">
                  Dịch vụ hành chính công hiện đại, minh bạch và hiệu quả
                </p>
                <div className="pt-3 sm:pt-4 lg:pt-6 border-t-2 border-gray-200">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-700">
                    Phường Tăng Nhơn Phú, Quận 9, TP. Thủ Đức
                  </p>
                </div>
              </div>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-4 sm:px-6 sm:py-5 rounded-xl transition-all shadow-lg hover:shadow-xl text-white">
                  <p className="text-center leading-relaxed text-sm sm:text-base">Dịch vụ công trực tuyến</p>
                </button>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-4 sm:px-6 sm:py-5 rounded-xl transition-all shadow-lg hover:shadow-xl text-white">
                  <p className="text-center leading-relaxed text-sm sm:text-base">Dịch vụ công trực tuyến của Đảng</p>
                </button>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-4 sm:px-6 sm:py-5 rounded-xl transition-all shadow-lg hover:shadow-xl text-white sm:col-span-2 md:col-span-1">
                  <p className="text-center leading-relaxed text-sm sm:text-base">Dịch vụ công liên thông: Khai sinh, Khai tử</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Procedures Section */}
      <ProcedureFieldsSection />

      {/* News Section + Statistics + Support - All in One Card */}
      <section className="pb-6 sm:pb-8 lg:pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
            {/* News Section */}
            <div className="p-4 sm:p-6 lg:p-8" >
              <div className="flex items-end justify-between mb-6 sm:mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl text-gray-800 mb-1 sm:mb-2">Tin tức mới nhất</h2>
                  <p className="text-sm sm:text-base text-gray-600">Cập nhật thông tin từ UBND Phường</p>
                </div>
              </div>
              
              {isLoadingNews ? (
                <div className="space-y-8">
                  {/* Featured news skeleton */}
                  <div className="bg-gray-50 rounded-xl overflow-hidden shadow-lg animate-pulse">
                    <div className="h-96 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  
                  {/* Other news skeletons */}
                  <div className="mb-8">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl overflow-hidden shadow animate-pulse">
                          <div className="h-48 bg-gray-200"></div>
                          <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                            <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : featuredNews ? (
                <>
                  <FeaturedNewsCard 
                    {...featuredNews} 
                    onClick={() => navigate(`/news/${featuredNews.id}`)}
                  />
                  {otherNews.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-xl sm:text-2xl text-gray-800 mb-4 sm:mb-6">Tin tức khác</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {otherNews.map((item) => (
                          <NewsCard 
                            key={item.id} 
                            {...item} 
                            onClick={() => navigate(`/news/${item.id}`)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <Link
                      to="/news"
                      className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      <Newspaper size={18} className="sm:w-5 sm:h-5" />
                      <span>Xem thêm tin tức</span>
                      <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Chưa có tin tức nào</p>
                </div>
              )}
            </div>

            {/* Statistics Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 sm:py-10 lg:py-12">
              <div className="px-4 sm:px-6 lg:px-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  <StatCard
                    icon={<Users size={40} className="mx-auto opacity-90" />}
                    value="181.317"
                    label="Dân số"
                    subLabel="cư dân"
                  />
                  <StatCard
                    icon={<FileText size={40} className="mx-auto opacity-90" />}
                    value={allProcedures ? allProcedures.length.toString() : "..."}
                    label="Thủ tục"
                    subLabel="trực tuyến"
                  />
                  <StatCard
                    icon={<CircleCheckBig size={40} className="mx-auto opacity-90" />}
                    value="98%"
                    label="Hài lòng"
                    subLabel="khảo sát"
                  />
                  <StatCard
                    icon={<Clock size={40} className="mx-auto opacity-90" />}
                    value="&lt; 24h"
                    label="Phản hồi"
                    subLabel="trung bình"
                  />
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="bg-white border-t border-gray-200 py-10 sm:py-12 lg:py-16">
              <div className="px-4 sm:px-6 lg:px-12 text-center">
                <h2 className="text-2xl sm:text-3xl text-gray-800 mb-3 sm:mb-4">Cần hỗ trợ?</h2>
                <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
                  Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ cư dân. Gửi phản ánh hoặc liên hệ trực tiếp với chúng tôi.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-4">
                  <button 
                    onClick={() => navigate('/report')}
                    className="px-6 py-3 sm:px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <MessageSquare size={18} className="sm:w-5 sm:h-5" />
                    <span>Gửi phản ánh ngay</span>
                  </button>
                  <a
                    href="tel:02812345678"
                    className="px-6 py-3 sm:px-8 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Phone size={18} className="text-green-600 sm:w-5 sm:h-5" />
                    <span>Hotline: (028) 1234 5678</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
