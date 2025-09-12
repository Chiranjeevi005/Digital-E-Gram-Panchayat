import { Server as SocketIOServer } from 'socket.io'
import { NextServer } from 'next/dist/server/next'

// Store the socket.io server instance
let io: SocketIOServer | null = null

/**
 * Initialize the Socket.IO server
 * @param server The HTTP server instance
 */
export function initSocketIO(server: any) {
  if (io) {
    // Socket.IO already initialized
    return io
  }

  // Create a new Socket.IO server
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Handle user joining a room (typically their user ID)
    socket.on('join', (userId) => {
      socket.join(userId)
      console.log(`User ${userId} joined room`)
    })

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}

/**
 * Get the Socket.IO server instance
 */
export function getSocketIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized!')
  }
  return io
}

/**
 * Emit a notification to a specific user
 * @param userId The user ID to send the notification to
 * @param event The event name
 * @param data The data to send
 */
export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(userId).emit(event, data)
  }
}

/**
 * Emit a notification to all connected users
 * @param event The event name
 * @param data The data to send
 */
export function emitToAll(event: string, data: any) {
  if (io) {
    io.emit(event, data)
  }
}