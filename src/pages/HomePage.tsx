import React from 'react'
import { Link } from 'react-router-dom'
import { ProcedureCard } from '../components/molecules/ProcedureCard'
import { NewsCard } from '../components/molecules/NewsCard'
import { FeaturedNewsCard } from '../components/molecules/FeaturedNewsCard'
import { StatCard } from '../components/molecules/StatCard'
import { ChevronRight, Newspaper, Users, FileText, CircleCheckBig, Clock, MessageSquare, Phone } from 'lucide-react'

export const HomePage: React.FC = () => {
  const procedures = [
    { title: 'Hộ tịch', count: 5, color: 'blue' as const },
    { title: 'Hộ khẩu', count: 2, color: 'green' as const },
    { title: 'Đất đai', count: 1, color: 'purple' as const },
    { title: 'Xây dựng', count: 1, color: 'orange' as const },
    { title: 'Kinh doanh', count: 1, color: 'pink' as const },
    { title: 'Y tế', count: 1, color: 'red' as const },
  ]

  const featuredNews = {
    title: 'Triển khai dịch vụ công trực tuyến mức độ 4 tại Phường Tăng Nhơn Phú',
    description: 'UBND Phường Tăng Nhơn Phú chính thức triển khai các thủ tục hành chính trực tuyến toàn trình, giúp người dân không cần đến trực tiếp mà vẫn hoàn tất mọi thủ tục từ xa.',
    date: '5 Tháng 11, 2025',
    views: 2500,
    category: 'Dịch vụ công',
    image: 'https://images.unsplash.com/photo-1758556549027-879615701c61?w=1200&h=600&fit=crop',
  }

  const otherNews = [
    {
      title: 'Thông báo lịch tiếp công dân tháng 11/2025',
      description: 'UBND Phường thông báo lịch tiếp công dân và giải quyết thủ tục hành chính trong tháng 11',
      date: '4 Tháng 11',
      views: 1800,
      category: 'Thông báo',
      image: 'https://images.unsplash.com/photo-1544562258-d7a25aa0e669?w=400&h=300&fit=crop',
    },
    {
      title: 'Hội nghị giao ban cán bộ khu phố tháng 11/2025',
      description: 'Tổng kết công tác tháng 10 và triển khai nhiệm vụ trọng tâm tháng 11',
      date: '3 Tháng 11',
      views: 1200,
      category: 'Sự kiện',
      image: 'https://images.unsplash.com/photo-1759922378100-89dca9fe3c98?w=400&h=300&fit=crop',
    },
    {
      title: 'Triển khai dự án cải tạo hạ tầng khu vực Tăng Nhơn Phú A',
      description: 'Dự án nâng cấp đường nội bộ và hệ thống thoát nước đang được triển khai',
      date: '2 Tháng 11',
      views: 980,
      category: 'Xây dựng',
      image: 'https://images.unsplash.com/photo-1576330291966-2b3482e0bd87?w=400&h=300&fit=crop',
    },
    {
      title: 'Phát động phong trào "Phường xanh - Sạch - Đẹp"',
      description: 'Kêu gọi toàn thể cư dân tham gia bảo vệ môi trường và giữ gìn vệ sinh chung',
      date: '1 Tháng 11',
      views: 856,
      category: 'Môi trường',
      image: 'https://images.unsplash.com/photo-1546526474-8bfb84574027?w=400&h=300&fit=crop',
    },
    {
      title: 'Tập huấn nghiệp vụ cho tổ trưởng dân phố năm 2025',
      description: 'Nâng cao năng lực công tác quản lý cơ sở cho đội ngũ cán bộ khu phố',
      date: '30 Tháng 10',
      views: 742,
      category: 'Đào tạo',
      image: 'https://images.unsplash.com/photo-1761250246894-ee2314939662?w=400&h=300&fit=crop',
    },
    {
      title: 'Kết quả triển khai "Tháng hành động vì trẻ em" năm 2025',
      description: 'Nhiều hoạt động ý nghĩa đã được tổ chức nhằm chăm lo quyền lợi trẻ em',
      date: '28 Tháng 10',
      views: 621,
      category: 'Xã hội',
      image: 'https://images.unsplash.com/photo-1544562258-d7a25aa0e669?w=400&h=300&fit=crop',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat text-white overflow-hidden -mx-4 lg:-mx-8 -mt-8"
        style={{
          backgroundImage: 'url("https://hochiminhcity.gov.vn/documents/39403/49303/background-trong-dong.png")'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25"></div>
        <div className="relative z-10 w-full px-4 lg:px-8 py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl mb-6 lg:mb-8 text-white"
                style={{
                  textShadow: 'rgba(0, 0, 0, 0.6) 3px 3px 10px, rgba(0, 0, 0, 0.4) 0px 0px 30px'
                }}
              >
                Cổng thông tin điện tử
              </h1>
              <div className="inline-block bg-white rounded-2xl px-6 py-6 lg:px-10 lg:py-8 shadow-2xl max-w-3xl">
                <p className="text-xl md:text-2xl lg:text-3xl mb-4 lg:mb-5 leading-relaxed text-gray-800">
                  Kết nối cư dân với chính quyền địa phương
                </p>
                <p className="text-base md:text-lg lg:text-xl text-gray-700 mb-5 lg:mb-6">
                  Dịch vụ hành chính công hiện đại, minh bạch và hiệu quả
                </p>
                <div className="pt-4 lg:pt-6 border-t-2 border-gray-200">
                  <p className="text-base md:text-lg lg:text-xl text-blue-700">
                    Phường Tăng Nhơn Phú, Quận 9, TP. Thủ Đức
                  </p>
                </div>
              </div>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-5 rounded-xl transition-all shadow-lg hover:shadow-xl text-white">
                  <p className="text-center leading-relaxed">Dịch vụ công trực tuyến</p>
                </button>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-5 rounded-xl transition-all shadow-lg hover:shadow-xl text-white">
                  <p className="text-center leading-relaxed">Dịch vụ công trực tuyến của Đảng</p>
                </button>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-5 rounded-xl transition-all shadow-lg hover:shadow-xl text-white">
                  <p className="text-center leading-relaxed">Dịch vụ công liên thông: Khai sinh, Khai tử</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Procedures Section */}
      <section className="bg-gray-50 py-16 -mx-4 lg:-mx-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl text-gray-800 mb-2">Lĩnh vực thủ tục</h2>
              <p className="text-gray-600">Các loại thủ tục hành chính phổ biến</p>
            </div>
            <Link
              to="/procedures"
              className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Xem tất cả</span>
              <ChevronRight size={20} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {procedures.map((procedure) => (
              <ProcedureCard
                key={procedure.title}
                title={procedure.title}
                count={procedure.count}
                color={procedure.color}
              />
            ))}
          </div>
          <div className="text-center mt-6 md:hidden">
            <Link
              to="/procedures"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg"
            >
              <span>Xem tất cả thủ tục</span>
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl text-gray-800 mb-2">Tin tức mới nhất</h2>
              <p className="text-gray-600">Cập nhật thông tin từ UBND Phường</p>
            </div>
          </div>
          <FeaturedNewsCard {...featuredNews} />
          <div className="mb-8">
            <h3 className="text-2xl text-gray-800 mb-6">Tin tức khác</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherNews.map((item, index) => (
                <NewsCard key={index} {...item} />
              ))}
            </div>
          </div>
          <div className="text-center">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
              <Newspaper size={20} />
              <span>Xem thêm tin tức</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 -mx-4 lg:-mx-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              icon={<Users size={40} className="mx-auto opacity-90" />}
              value="45,000+"
              label="Dân số"
              subLabel="cư dân"
            />
            <StatCard
              icon={<FileText size={40} className="mx-auto opacity-90" />}
              value="150+"
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
      </section>

      {/* Support Section */}
      <section className="bg-white border-t border-gray-200 py-16 -mx-4 lg:-mx-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl text-gray-800 mb-4">Cần hỗ trợ?</h2>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ cư dân. Gửi phản ánh hoặc liên hệ trực tiếp với chúng tôi.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center gap-2">
              <MessageSquare size={20} />
              <span>Gửi phản ánh ngay</span>
            </button>
            <a
              href="tel:02812345678"
              className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2"
            >
              <Phone size={20} className="text-green-600" />
              <span>Hotline: (028) 1234 5678</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
