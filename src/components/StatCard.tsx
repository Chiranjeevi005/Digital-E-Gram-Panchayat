import React from 'react'

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color?: 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'indigo'
  size?: 'sm' | 'md' | 'lg'
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  size = 'md'
}: StatCardProps) {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  }

  const sizeClasses = {
    sm: {
      container: 'p-2',
      title: 'text-[0.6rem]',
      value: 'text-base',
      icon: 'h-3 w-3'
    },
    md: {
      container: 'p-3 sm:p-4',
      title: 'text-xs sm:text-sm',
      value: 'text-lg sm:text-2xl',
      icon: 'h-4 w-4 sm:h-5 sm:w-5'
    },
    lg: {
      container: 'p-4 sm:p-6',
      title: 'text-sm sm:text-base',
      value: 'text-xl sm:text-3xl',
      icon: 'h-5 w-5 sm:h-6 sm:w-6'
    }
  }

  const colors = colorClasses[color]
  const sizes = sizeClasses[size]

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg ${sizes.container} transition-all duration-300 hover:shadow-sm`}>
      <div className="flex items-center">
        <div className={`${colors.text} ${sizes.icon} flex-shrink-0`}>
          {icon}
        </div>
        <div className="ml-2 sm:ml-3 flex-1">
          <p className={`font-medium ${colors.text} ${sizes.title} truncate`}>
            {title}
          </p>
          <p className={`font-bold text-gray-900 ${sizes.value}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}