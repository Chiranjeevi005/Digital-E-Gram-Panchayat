import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  actions?: React.ReactNode
}

export default function Card({ children, className = '', title, actions }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}>
      {(title || actions) && (
        <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            {title && (
              <h3 className="text-base sm:text-lg font-heading font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {actions && (
              <div className="flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="px-3 sm:px-4 py-3 sm:py-4">
        {children}
      </div>
    </div>
  )
}