import React from 'react'

interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
  subLabel?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  subLabel,
}) => {
  return (
    <div className="text-center">
      <div className="mb-3 sm:mb-4">
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2" dangerouslySetInnerHTML={{ __html: value }} />
      <div className="text-sm sm:text-base lg:text-lg opacity-90">{label}</div>
      {subLabel && (
        <div className="text-xs sm:text-sm opacity-75 mt-1">{subLabel}</div>
      )}
    </div>
  )
}



