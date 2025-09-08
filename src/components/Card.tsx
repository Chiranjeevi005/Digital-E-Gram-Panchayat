'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  actions?: React.ReactNode
}

export default function Card({ children, className = '', title, actions }: CardProps) {
  return (
    <div className={`bg-white shadow-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      {title || actions ? (
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            {title && (
              <h3 className="text-lg font-heading font-semibold text-gray-900">{title}</h3>
            )}
            {actions && (
              <div className="mt-2 sm:mt-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      ) : null}
      <div className="px-4 py-5 sm:p-6">
        {children}
      </div>
    </div>
  )
}