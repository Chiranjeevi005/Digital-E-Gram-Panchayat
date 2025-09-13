import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'default' | 'completed' | 'processing'
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors duration-300'
  
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[0.6rem]',
    sm: 'px-2 py-0.5 text-[0.65rem]',
    md: 'px-2.5 py-1 text-xs'
  }
  
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
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}