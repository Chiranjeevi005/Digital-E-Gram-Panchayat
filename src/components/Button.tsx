import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'accent'
  children: React.ReactNode
  className?: string
}

export default function Button({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg border border-transparent font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
    accent: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500'
  }
  
  // Default padding and sizing
  const sizeClasses = 'px-4 py-2 text-sm'
  
  // Responsive padding for different screen sizes
  const responsiveClasses = 'sm:px-4 sm:py-2'
  
  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses} ${responsiveClasses} ${className}`}
    >
      {children}
    </button>
  )
}