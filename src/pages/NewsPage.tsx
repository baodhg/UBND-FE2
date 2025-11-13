import React from 'react'
import { NewsCard } from '../components/molecules/NewsCard'

export const NewsPage: React.FC = () => {
  const news = [
    {
      title: 'Triển khai dịch vụ công trực tuyến mức độ 4 tại Phường Tăng Nhơn Phú',
      description: 'UBND Phường Tăng Nhơn Phú chính thức triển khai các thủ tục hành chính trực tuyến toàn trình, giúp người dân không cần đến trực tiếp mà vẫn hoàn tất mọi thủ tục từ xa.',
      date: '5 Tháng 11, 2025',
      views: 2500,
      category: 'Dịch vụ công',
      featured: true,
    },
    {
      title: 'Thông báo lịch tiếp công dân tháng 11/2025',
      description: 'UBND Phường thông báo lịch tiếp công dân và giải quyết thủ tục hành chính trong tháng 11',
      date: '4 Tháng 11',
      views: 1800,
      category: 'Thông báo',
    },
    {
      title: 'Hội nghị giao ban cán bộ khu phố tháng 11/2025',
      description: 'Tổng kết công tác tháng 10 và triển khai nhiệm vụ trọng tâm tháng 11',
      date: '3 Tháng 11',
      views: 1200,
      category: 'Sự kiện',
    },
  ]

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tin tức</h1>
        <p className="text-gray-600 mb-8">Cập nhật thông tin từ UBND Phường</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <NewsCard key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  )
}

