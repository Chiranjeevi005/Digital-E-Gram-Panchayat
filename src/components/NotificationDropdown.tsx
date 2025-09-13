'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { BellIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface NotificationType {
  _id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: string
}

export default function NotificationDropdown() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get user role for API endpoint
  const getUserRole = () => {
    if (!session?.user) return null
    return (session.user as any).role?.toLowerCase() || null
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const role = getUserRole()
      if (!role) return

      const response = await fetch(`/api/notifications?role=${role}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true } 
              : notification
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Get notification icon color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      case 'success': return 'text-green-500'
      default: return 'text-blue-500'
    }
  }

  // Get user dashboard path
  const getDashboardPath = () => {
    const role = getUserRole()
    if (!role) return '/'
    return `/${role}/dashboard`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 sm:-top-1 sm:-right-1 flex h-4 w-4 sm:h-5 sm:w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-[0.5rem] sm:text-xs text-white items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 sm:w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-64 sm:max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 sm:py-10 text-center">
                <BellIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                <p className="mt-2 text-xs sm:text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`p-3 sm:p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => markAsRead(notification._id)}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        <BellIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                      </div>
                      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                          {notification.title}
                        </p>
                        <p className="mt-1 text-[0.65rem] sm:text-xs text-gray-500 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[0.55rem] sm:text-[0.6rem] text-gray-400">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 ml-2 sm:ml-3 flex items-center">
                          <span className="inline-flex items-center justify-center h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 sm:p-4 border-t border-gray-200">
            <Link 
              href={`${getDashboardPath()}/notifications`}
              className="block text-center text-xs sm:text-sm text-indigo-600 hover:text-indigo-900 font-medium py-1"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}