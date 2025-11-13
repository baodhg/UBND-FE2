import React from 'react'
import { ProcedureCard } from '../components/molecules/ProcedureCard'

export const ProceduresPage: React.FC = () => {
  const procedures = [
    { title: 'Hộ tịch', count: 5, color: 'blue' as const },
    { title: 'Hộ khẩu', count: 2, color: 'green' as const },
    { title: 'Đất đai', count: 1, color: 'purple' as const },
    { title: 'Xây dựng', count: 1, color: 'orange' as const },
    { title: 'Kinh doanh', count: 1, color: 'pink' as const },
    { title: 'Y tế', count: 1, color: 'red' as const },
  ]

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thủ tục hành chính</h1>
        <p className="text-gray-600 mb-8">Các loại thủ tục hành chính phổ biến</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {procedures.map((procedure) => (
            <ProcedureCard
              key={procedure.title}
              title={procedure.title}
              count={procedure.count}
              color={procedure.color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

