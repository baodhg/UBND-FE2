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
      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl overflow-hidden mb-8 border-0 shadow-xl hover:shadow-2xl transition-shadow group cursor-pointer"
      onClick={onClick}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="relative h-64 lg:h-auto overflow-hidden">
          <img
            src={image || 'https://images.unsplash.com/photo-1758556549027-879615701c61?w=1200&h=600&fit=crop'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm flex items-center gap-1">
            <Flame size={16} />
            <span>Nổi bật</span>
          </span>
        </div>
        <div className="p-8 lg:p-10 flex flex-col justify-center bg-white">
          <div className="flex items-center gap-3 mb-4">
            {category && (
              <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
                {category}
              </span>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {date}
              </span>
              {author && (
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {author}
                </span>
              )}
            </div>
          </div>
          <h3 className="text-2xl lg:text-3xl text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">{description}</p>
          <div className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <span>Đọc thêm</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  )
}

