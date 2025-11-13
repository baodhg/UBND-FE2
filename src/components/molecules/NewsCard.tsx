import React from 'react'
import { Calendar, Eye } from 'lucide-react'

interface NewsCardProps {
  title: string
  description: string
  date: string
  views: number
  category?: string
  image?: string
}

export const NewsCard: React.FC<NewsCardProps> = ({
  title,
  description,
  date,
  views,
  category,
  image,
}) => {
  return (
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={image || 'https://images.unsplash.com/photo-1544562258-d7a25aa0e669?w=400&h=300&fit=crop'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {category && (
          <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 absolute top-3 left-3 bg-white/95 text-gray-700 text-xs">
            {category}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views}
          </span>
        </div>
        <h4 className="text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
    </div>
  )
}
