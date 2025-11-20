import React from 'react'
import { FileText } from 'lucide-react'

interface ProcedureCardProps {
  title: string
  count: number
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'red'
  onClick?: () => void
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
  red: 'from-red-500 to-red-600',
}

export const ProcedureCard: React.FC<ProcedureCardProps> = ({
  title,
  count,
  color,
  onClick,
}) => {
  return (
    <div
      className="bg-card text-card-foreground flex flex-col gap-3 sm:gap-4 lg:gap-6 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 hover:shadow-lg transition-all cursor-pointer border border-gray-200 hover:border-blue-300 group text-center"
      onClick={onClick}
    >
      <div className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-2.5 lg:mb-3 mx-auto group-hover:scale-110 transition-transform shadow-md`}>
        <FileText size={20} className="sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6 text-white" />
      </div>
      <h4 className="text-sm sm:text-base lg:text-base text-gray-800 mb-0.5 sm:mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 px-1">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-gray-500">{count} thủ tục</p>
    </div>
  )
}
