import mongoose, { Connection } from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
if (typeof process.env.MONGODB_URI === 'undefined') {
  console.log('MONGODB_URI not found in environment variables')
  // Try to load from .env.local explicitly
  try {
    dotenv.config({ path: '.env.local' })
  } catch (e) {
    console.log('Failed to load .env.local:', e)
  }
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: {
    conn: Connection | null
    promise: Promise<Connection> | null
  }
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('MongoDB connected successfully')
      return mongoose.connection
    }).catch((error) => {
      console.error('MongoDB connection error:', error)
      throw new Error('Failed to connect to MongoDB. Please check your connection string and network connectivity.')
    })
  }
  
  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (e) {
    console.error('Database connection failed:', e)
    cached.promise = null
    throw new Error('Database connection failed. Please try again later.')
  }
}

export default dbConnect