import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'default' | 'completed' | 'processing'
  className?: string
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors duration-300'
  
  const variantClasses = {
    'pending': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'default': 'bg-gray-100 text-gray-800',
    'completed': 'bg-green-100 text-green-800',
    'processing': 'bg-yellow-100 text-yellow-800',
  }

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}