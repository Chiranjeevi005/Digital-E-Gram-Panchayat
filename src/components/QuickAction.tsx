import React from 'react'

interface QuickActionProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  className?: string
}

export default function QuickAction({ 
  title, 
  description, 
  icon, 
  onClick, 
  disabled = false,
  className = ''
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-start p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left w-full ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <div className="flex-shrink-0 p-2 rounded-md bg-indigo-100 text-indigo-600">
        {icon}
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </button>
  )
}