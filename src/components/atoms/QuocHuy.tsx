import React from 'react'

interface QuocHuyProps {
  className?: string
}

export const QuocHuy: React.FC<QuocHuyProps> = ({ 
  className = ''
}) => {
  return (
    <img 
      src="https://hochiminhcity.gov.vn/o/portal-home-multi-theme/images/icons/quoc-huy.png" 
      alt="Quốc huy Việt Nam" 
      className={`w-full h-full object-contain ${className}`}
    />
  )
}
