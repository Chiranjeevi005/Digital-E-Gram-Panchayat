import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  change?: string
  changeType?: 'positive' | 'negative'
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  color,
  change,
  changeType = 'positive'
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-indigo-600',
    green: 'bg-gradient-to-r from-green-500 to-emerald-600',
    yellow: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    red: 'bg-gradient-to-r from-red-500 to-rose-600',
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-600'
  }

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} text-white mr-4`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {changeType === 'positive' ? '↑' : '↓'} {change}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}