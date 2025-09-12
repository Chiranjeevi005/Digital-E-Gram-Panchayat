'use client'

import { useState, useEffect } from 'react'
import { useNotification } from '@/contexts/NotificationContext'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface ToastProps {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  onDismiss: () => void
}

function Toast({ id, title, message, type, duration = 5000, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onDismiss()
    }, 300)
  }

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-400" />
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div 
      className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 ${
        isLeaving ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      } ${getBackgroundColor()}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ToastContainer() {
  const { notifications, markAsRead } = useNotification()
  const [toasts, setToasts] = useState<Array<{id: string, notification: any}>>([])

  // Show new notifications as toasts
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0]
      // Only show unread notifications as toasts
      if (!latestNotification.read) {
        const toastId = `toast-${Date.now()}`
        setToasts(prev => [
          { id: toastId, notification: latestNotification },
          ...prev.slice(0, 2) // Keep only the latest 3 toasts
        ])
        
        // Mark as read after showing
        setTimeout(() => {
          markAsRead(latestNotification.id)
        }, 1000)
      }
    }
  }, [notifications, markAsRead])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <div className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50">
      <div className="w-full flex flex-col space-y-4">
        {toasts.map(({ id, notification }) => (
          <Toast
            key={id}
            id={notification.id}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onDismiss={() => removeToast(id)}
          />
        ))}
      </div>
    </div>
  )
}