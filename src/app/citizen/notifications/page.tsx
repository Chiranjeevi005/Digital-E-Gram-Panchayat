'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import Notification from '@/components/Notification'
import SkeletonLoader from '@/components/SkeletonLoader'
import { 
  Bars3Icon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface NotificationType {
  _id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: string
  readAt?: string
}

export default function UserNotifications() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role) {
      // Normalize role checking to handle both old and new role names
      const isCitizen = session.user.role === 'user' || session.user.role === 'citizen' || session.user.role === 'Citizens';
      if (!isCitizen) {
        router.push(`/${session.user.role === 'user' ? 'citizen' : session.user.role.toLowerCase()}/dashboard`)
      } else {
        fetchNotifications()
      }
    }
  }, [session, status, router])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        setNotifications(notifications.map(notification => 
          notification._id === id 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        ))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT'
      })
      
      if (response.ok) {
        setNotifications(notifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        })))
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotifications(notifications.filter(notification => notification._id !== id))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'read') return notification.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1">
          <div className="hidden md:block w-64">
            <SkeletonLoader type="card" className="h-full" />
          </div>
          <div className="flex-1 p-4 sm:p-6">
            <SkeletonLoader type="card" className="h-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Mobile sidebar */}
      <div className="md:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <Sidebar role="Citizens" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-1">
        <div className="hidden md:block w-64">
          <Sidebar role="Citizens" />
        </div>
        
        <main className="flex-1 p-4 sm:p-6">
          <div className="md:hidden mb-4">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="mb-5 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` 
                : 'All notifications are read'}
            </p>
          </div>
          
          <Card className="w-full">
            <div className="mb-5 sm:mb-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-heading font-semibold text-gray-900">Your Notifications</h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                        filter === 'all'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('unread')}
                      className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                        filter === 'unread'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Unread
                    </button>
                    <button
                      onClick={() => setFilter('read')}
                      className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                        filter === 'read'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Read
                    </button>
                  </div>
                  
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {loading ? (
              <SkeletonLoader type="card" count={3} />
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto bg-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4">
                  <InformationCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  {filter === 'unread' 
                    ? 'No unread notifications' 
                    : filter === 'read' 
                      ? 'No read notifications' 
                      : 'No notifications'}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {filter === 'all' 
                    ? 'You don\'t have any notifications yet.' 
                    : `You don't have any ${filter} notifications.`}
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`rounded-lg border p-3 sm:p-4 shadow-sm ${
                      notification.isRead 
                        ? 'bg-white border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 mt-0.5">
                        {notification.type === 'success' && (
                          <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                        )}
                        {notification.type === 'warning' && (
                          <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                        )}
                        {notification.type === 'error' && (
                          <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                        )}
                        {notification.type === 'info' && (
                          <InformationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                        )}
                      </div>
                      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className={`text-sm font-medium ${
                            notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'
                          }`}>
                            {notification.title}
                          </h3>
                          <div className="flex space-x-2">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-900"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              className="text-xs text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs sm:text-sm text-gray-600">
                          <p>{notification.message}</p>
                        </div>
                        <div className="mt-2 text-[0.65rem] sm:text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}