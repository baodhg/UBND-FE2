import React from 'react'
import { Calendar, User } from 'lucide-react'

interface NewsCardProps {
  id: string
  title: string
  description: string
  date: string
  author?: string
  category?: string
  image?: string
  onClick?: () => void
}

export const NewsCard: React.FC<NewsCardProps> = ({
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
      className="bg-card text-card-foreground flex flex-col gap-4 sm:gap-6 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100">
        <img
          src={image || 'https://images.unsplash.com/photo-1544562258-d7a25aa0e669?w=400&h=300&fit=crop'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {category && (
          <span 
            className="rounded-md border px-1.5 py-0.5 sm:px-2 font-medium w-fit shrink-0 absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 text-gray-700 text-xs break-all max-w-[calc(100%-1rem)] overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-all'
            }}
          >
            {category}
          </span>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 mb-2 sm:mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={11} className="sm:w-3 sm:h-3" />
            <span className="text-xs">{date}</span>
          </span>
          {author && (
            <span className="flex items-center gap-1">
              <User size={11} className="sm:w-3 sm:h-3" />
              <span className="text-xs">{author}</span>
            </span>
          )}
        </div>
        <h4 className="text-base sm:text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
    </div>
  )
}

