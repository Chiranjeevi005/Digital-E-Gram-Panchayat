import React from 'react'
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

interface NotificationProps {
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  onClose?: () => void
  className?: string
}

export default function Notification({ 
  title, 
  message, 
  type = 'info', 
  onClose,
  className = ''
}: NotificationProps) {
  const typeStyles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  }

  const typeIcons = {
    info: <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />,
    success: <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />,
    error: <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
  }

  return (
    <div className={`rounded-lg border p-3 sm:p-4 shadow-md ${typeStyles[type]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {typeIcons[type]}
        </div>
        <div className="ml-2 sm:ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-1 sm:mt-2 text-sm">
            <p className="break-words">{message}</p>
          </div>
        </div>
        {onClose && (
          <div className="ml-2 sm:ml-4 flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={onClose}
            >
              <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}