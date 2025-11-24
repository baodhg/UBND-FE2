import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ProcedureCard } from '../../components/molecules/ProcedureCard'
import { useProcedureFields } from '../../features/procedure-fields/hooks/useProcedureFields'
import { useQuery } from '@tanstack/react-query'
import { proceduresApi } from '../../features/procedures/api/proceduresApi'

export const ProcedureFieldsSection: React.FC = () => {
  const navigate = useNavigate()
  const { fields, isLoading: isLoadingFields } = useProcedureFields()
  
  // Fetch all procedures to count them by field
  const { data: allProcedures } = useQuery({
    queryKey: ['allProcedures'],
    queryFn: () => proceduresApi.getAllProcedures(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Color palette for procedure cards
  const colors: Array<'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'red'> = [
    'blue', 'green', 'purple', 'orange', 'pink', 'red'
  ]

  // Map fields with procedure counts
  const procedures = useMemo(() => {
    if (!fields || !allProcedures) return []

    const mappedFields = fields
      .filter(field => field.is_active && !field.is_delete)
      .slice(0, 6) // Limit to 6 items first
      .map((field, index) => {
        // Count procedures that belong to this field
        // Note: procedure.linh_vuc contains field NAMES, not IDs
        const count = allProcedures.filter(procedure => 
          procedure.linh_vuc && procedure.linh_vuc.includes(field.ten_linh_vuc)
        ).length

        return {
          id: field.id,
          title: field.ten_linh_vuc,
          count,
          color: colors[index % colors.length],
        }
      })

    return mappedFields
  }, [fields, allProcedures])

  const handleProcedureCardClick = (fieldId: string) => {
    navigate(`/procedures?idLinhVuc=${fieldId}`)
  }

  return (
    <section className="bg-gray-50 py-10 sm:py-12 lg:py-16 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl text-gray-800 mb-1 sm:mb-2">Lĩnh vực thủ tục</h2>
            <p className="text-sm sm:text-base text-gray-600">Các loại thủ tục hành chính phổ biến</p>
          </div>
          <Link
            to="/procedures"
            className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base"
          >
            <span>Xem tất cả</span>
            <ChevronRight size={20} />
          </Link>
        </div>
        
        {isLoadingFields ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 animate-pulse"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl mx-auto mb-2 sm:mb-3"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : procedures.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {procedures.map((procedure) => (
              <ProcedureCard
                key={procedure.id}
                title={procedure.title}
                count={procedure.count}
                color={procedure.color}
                onClick={() => handleProcedureCardClick(procedure.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-gray-500">Chưa có lĩnh vực thủ tục nào</p>
          </div>
        )}
        
        <div className="text-center mt-4 sm:mt-6 md:hidden">
          <Link
            to="/procedures"
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg text-sm sm:text-base"
          >
            <span>Xem tất cả thủ tục</span>
            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

