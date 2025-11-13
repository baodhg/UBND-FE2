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
  subLabel 
}) => {
  return (
    <div className="text-center">
      <div className="mb-3">{icon}</div>
      <div className="text-3xl lg:text-4xl mb-1">{value}</div>
      <div className="text-blue-100">{label}</div>
      {subLabel && (
        <div className="text-sm text-blue-200 opacity-75">{subLabel}</div>
      )}
    </div>
  )
}
