'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

// Define the shape of our notification data
export interface NotificationData {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
}

// Store the socket instance
let socket: Socket | null = null

/**
 * Custom hook for managing Socket.IO connections
 * @param userId The user ID to connect with
 * @param onNotification Callback function to handle incoming notifications
 */
export function useSocket(
  userId: string | null,
  onNotification: (data: NotificationData) => void
) {
  const connectedRef = useRef(false)

  useEffect(() => {
    // Only initialize if we have a user ID and haven't connected yet
    if (userId && !connectedRef.current) {
      // Create socket connection if it doesn't exist
      if (!socket) {
        socket = io({
          path: '/api/socketio'
        })
      }

      // Join the user's room
      socket.emit('join', userId)

      // Listen for notifications
      socket.on('notification', onNotification)

      // Mark as connected
      connectedRef.current = true

      console.log('Socket connected for user:', userId)
    }

    // Cleanup function
    return () => {
      if (socket) {
        socket.off('notification', onNotification)
        // Don't disconnect the socket here as it might be used by other components
      }
      connectedRef.current = false
    }
  }, [userId, onNotification])

  return socket
}