import React from 'react'
import { Flame, Calendar, User, ArrowRight } from 'lucide-react'

interface FeaturedNewsCardProps {
  id: string
  title: string
  description: string
  date: string
  author?: string
  category?: string
  image?: string
  onClick?: () => void
}

export const FeaturedNewsCard: React.FC<FeaturedNewsCardProps> = ({
  title,
  description,
  date,
  author,
  category,
  image,
  onClick,
}) => {
  return (
    <div 
      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl overflow-hidden mb-6 sm:mb-8 border-0 shadow-xl hover:shadow-2xl transition-shadow group cursor-pointer"
      onClick={onClick}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
          <img
            src={image || 'https://images.unsplash.com/photo-1758556549027-879615701c61?w=1200&h=600&fit=crop'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 absolute top-3 left-3 sm:top-4 sm:left-4 bg-red-600 text-white px-2 py-1 sm:px-3 text-xs sm:text-sm flex items-center gap-1">
            <Flame size={14} className="sm:w-4 sm:h-4" />
            <span>Nổi bật</span>
          </span>
        </div>
        <div className="p-5 sm:p-6 lg:p-10 flex flex-col justify-center bg-white">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            {category && (
              <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
                {category}
              </span>
            )}
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm">{date}</span>
              </span>
              {author && (
                <span className="flex items-center gap-1">
                  <User size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span className="text-xs sm:text-sm">{author}</span>
                </span>
              )}
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl text-gray-800 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors leading-tight">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6 line-clamp-3 sm:line-clamp-4">{description}</p>
          <div className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base">
            <span>Đọc thêm</span>
            <ArrowRight size={16} className="sm:w-4.5 sm:h-4.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  )
}

