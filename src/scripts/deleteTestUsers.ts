import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' }) // Load environment variables from .env.local

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

// Test user emails to delete
const testUserEmails = [
  'john@example.com',
  'jane@example.com',
  'bob@example.com'
]

async function deleteTestUsers() {
  try {
    console.log('Connecting to database...')
    await dbConnect()
    
    console.log('Deleting test users...')
    for (const email of testUserEmails) {
      const result = await User.deleteMany({ email: email })
      console.log(`Deleted ${result.deletedCount} user(s) with email: ${email}`)
    }
    
    console.log('Test users deletion completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error deleting test users:', error)
    process.exit(1)
  }
}

// Run the deletion
deleteTestUsers()