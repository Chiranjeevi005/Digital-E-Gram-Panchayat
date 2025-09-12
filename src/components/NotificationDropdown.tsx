'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Transition } from '@headlessui/react'
import { 
  BellIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline'
import { useSocket, NotificationData } from '@/lib/useSocket'

interface Notification {
  _id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: string
}

export default function NotificationDropdown() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const newlyOpenedRef = useRef(false)

  // Handle real-time notifications
  const handleNotification = (data: NotificationData) => {
    // Add the new notification to the top of the list
    const newNotification: Notification = {
      _id: data.id,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: data.read,
      createdAt: data.timestamp.toString()
    }
    
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + (data.read ? 0 : 1))
    
    // Automatically open the dropdown when a new unread notification arrives
    if (!data.read) {
      setIsOpen(true)
      newlyOpenedRef.current = true
      
      // Clear any existing timeout
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current)
      }
      
      // Set timeout to close the dropdown after 7 seconds
      autoCloseTimeoutRef.current = setTimeout(() => {
        setIsOpen(false)
        newlyOpenedRef.current = false
      }, 7000)
    }
  }

  // Initialize Socket.IO connection
  useSocket(session?.user?.id || null, handleNotification)

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user) return
      
      try {
        const response = await fetch('/api/notifications')
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.slice(0, 5)) // Limit to 5 latest notifications
          setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    fetchNotifications()
  }, [session])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        newlyOpenedRef.current = false
        
        // Clear timeout when closing by clicking outside
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      // Clear timeout on unmount
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current)
      }
    }
  }, [])

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setNotifications(notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        ))
        setUnreadCount(unreadCount - 1)
        // Close dropdown instantly when marking as read
        setIsOpen(false)
        newlyOpenedRef.current = false
        
        // Clear any existing timeout
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current)
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Get user role for notification path
  const getUserNotificationsPath = () => {
    if (!session?.user) return '/'
    const role = (session.user as any).role
    switch (role) {
      case 'citizen': 
      case 'user': 
      case 'Citizens':  // Add the new role name
        return '/citizen/notifications'
      case 'staff': 
      case 'Staff':  // Add the new role name
        return '/staff/notifications'
      case 'admin': 
      case 'officer':
      case 'Officer':  // Add the new role name
        return '/officer/notifications'
      default: 
        return '/'
    }
  }

  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
    }
  }

  // Get background color based on notification type
  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 hover:bg-green-100'
      case 'warning':
        return 'bg-yellow-50 hover:bg-yellow-100'
      case 'error':
        return 'bg-red-50 hover:bg-red-100'
      default:
        return 'bg-blue-50 hover:bg-blue-100'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full transition-colors duration-200"
        title="Notifications"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span 
            className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount}
          </span>
        )}
      </button>

      <Transition
        show={isOpen}
        enter="transition ease-out duration-300"
        enterFrom="transform opacity-0 scale-90"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-200"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-90"
      >
        <div className="absolute right-0 mt-2 w-80 md:w-96 origin-top-right rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
             role="menu"
             aria-label="Notifications dropdown">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <button
                onClick={() => {
                  setIsOpen(false)
                  newlyOpenedRef.current = false
                  // Clear any existing timeout
                  if (autoCloseTimeoutRef.current) {
                    clearTimeout(autoCloseTimeoutRef.current)
                  }
                }}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
                aria-label="Close notifications"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id}
                    className={`p-4 ${getBgColor(notification.type)} ${!notification.isRead ? 'border-l-4 border-blue-500' : ''} transition-all duration-200 ease-in-out`}
                    role="menuitem"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="flex-shrink-0 ml-2 text-xs text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                          aria-label={`Mark "${notification.title}" as read`}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={() => {
                setIsOpen(false)
                newlyOpenedRef.current = false
                // Clear any existing timeout
                if (autoCloseTimeoutRef.current) {
                  clearTimeout(autoCloseTimeoutRef.current)
                }
                router.push(getUserNotificationsPath())
              }}
              className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
              aria-label="View all notifications"
            >
              View all notifications
            </button>
          </div>
        </div>
      </Transition>
    </div>
  )
}