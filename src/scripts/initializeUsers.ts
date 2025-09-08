import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' }) // Load environment variables from .env.local

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

// Test user data
const usersData = [
  {
    name: 'John Citizen',
    email: 'john@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Jane Staff',
    email: 'jane@example.com',
    password: 'password123',
    role: 'staff'
  },
  {
    name: 'Bob Officer',
    email: 'bob@example.com',
    password: 'password123',
    role: 'officer'
  }
]

async function initializeUsers() {
  try {
    console.log('Connecting to database...')
    await dbConnect()
    
    console.log('Checking existing users...')
    const existingUsers = await User.find({})
    
    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing users.`)
      
      // Check if test users already exist
      for (const userData of usersData) {
        const existingUser = await User.findOne({ email: userData.email, role: userData.role })
        if (existingUser) {
          console.log(`User ${userData.email} (${userData.role}) already exists.`)
        } else {
          // Create the user (password will be hashed by the pre-save hook)
          const user = new User(userData)
          await user.save()
          console.log(`Created user: ${user.name} (${user.email}) as ${user.role}`)
        }
      }
    } else {
      console.log('No existing users found. Creating test users...')
      
      // Create test users (password will be hashed by the pre-save hook)
      for (const userData of usersData) {
        const user = new User(userData)
        await user.save()
        console.log(`Created user: ${user.name} (${user.email}) as ${user.role}`)
      }
    }
    
    console.log('User initialization completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error initializing users:', error)
    process.exit(1)
  }
}

// Run the initialization
initializeUsers()