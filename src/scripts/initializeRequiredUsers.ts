import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local - try multiple possible paths
const envPath = path.resolve(__dirname, '../../.env.local')
dotenv.config({ path: envPath })

import User from '@/models/User'

// Required users
const requiredUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'officer' as const, // Only one officer allowed
    status: 'active' as const
  },
  {
    name: 'Staff Member 1',
    email: 'staff1@example.com',
    password: 'password123',
    role: 'staff' as const, // First staff member
    status: 'active' as const
  },
  {
    name: 'Staff Member 2',
    email: 'staff2@example.com',
    password: 'password123',
    role: 'staff' as const, // Second staff member
    status: 'active' as const
  },
  {
    name: 'Test Citizen',
    email: 'citizen@example.com',
    password: 'password123',
    role: 'user' as const, // Citizen user
    status: 'active' as const
  }
]

async function initializeRequiredUsers() {
  try {
    console.log('Script directory:', __dirname)
    console.log('Environment file path:', envPath)
    console.log('MONGODB_URI:', process.env.MONGODB_URI)
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }
    
    console.log('Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    
    console.log('Checking existing users...')
    const existingUsers = await User.find({})
    
    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing users. Skipping initialization.`)
      await mongoose.disconnect()
      process.exit(0)
    }
    
    console.log('Creating required users...')
    
    for (const userData of requiredUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email })
      if (existingUser) {
        console.log(`User ${userData.email} already exists.`)
        continue
      }
      
      // Create the user (password will be hashed by the pre-save hook)
      const user = new User(userData)
      await user.save()
      console.log(`Created user: ${user.name} (${user.email}) as ${user.role}`)
    }
    
    console.log('User initialization completed successfully!')
    
    // List all users
    console.log('\nCurrent users in database:')
    const users = await User.find({}).select('-password')
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`)
    })
    
    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Error initializing users:', error)
    process.exit(1)
  }
}

initializeRequiredUsers()