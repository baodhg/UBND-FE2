import React from 'react'

interface VietnamEmblemProps {
  size?: number
  className?: string
}

export const VietnamEmblem: React.FC<VietnamEmblemProps> = ({ 
  size = 48, 
  className = '' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red background circle */}
      <circle cx="50" cy="50" r="48" fill="#DA251D" />
      
      {/* Golden star */}
      <path
        d="M 50 15 L 55 35 L 75 35 L 60 48 L 65 68 L 50 58 L 35 68 L 40 48 L 25 35 L 45 35 Z"
        fill="#FFD700"
        stroke="#FFD700"
        strokeWidth="0.5"
      />
      
      {/* Cogwheel (simplified) */}
      <circle cx="50" cy="65" r="8" fill="#FFD700" />
      <circle cx="50" cy="65" r="5" fill="#DA251D" />
      
      {/* Rice stalks (simplified representation) */}
      <path
        d="M 30 75 Q 35 70 40 75 Q 45 70 50 75"
        stroke="#FFD700"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 50 75 Q 55 70 60 75 Q 65 70 70 75"
        stroke="#FFD700"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Ribbon text area (simplified) */}
      <rect x="20" y="80" width="60" height="8" rx="2" fill="#FFD700" opacity="0.3" />
    </svg>
  )
}

