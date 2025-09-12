'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket, NotificationData } from '@/lib/useSocket'

interface NotificationContextType {
  notifications: NotificationData[]
  unreadCount: number
  markAsRead: (id: string) => void
  addNotification: (notification: NotificationData) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Handle real-time notifications
  const handleNotification = (data: NotificationData) => {
    setNotifications(prev => [data, ...prev])
    setUnreadCount(prev => prev + (data.read ? 0 : 1))
    
    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.title, {
        body: data.message,
        icon: '/favicon.ico'
      })
    }
  }

  // Initialize Socket.IO connection
  useSocket(session?.user?.id || null, handleNotification)

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + (notification.read ? 0 : 1))
  }

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        addNotification 
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}