import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config({ path: '.env.local' }) // Load environment variables from .env.local

import User from '@/models/User'
import Application from '@/models/Application'

async function deleteAllUsers() {
  try {
    console.log('Connecting to database...')
    console.log('MONGODB_URI:', process.env.MONGODB_URI)
    
    await mongoose.connect(process.env.MONGODB_URI!)
    
    console.log('Deleting all users...')
    const result = await User.deleteMany({})
    console.log(`Deleted ${result.deletedCount} users`)
    
    console.log('Deleting all applications...')
    const appResult = await Application.deleteMany({})
    console.log(`Deleted ${appResult.deletedCount} applications`)
    
    await mongoose.disconnect()
    console.log('All users and applications deleted successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error deleting users:', error)
    process.exit(1)
  }
}

deleteAllUsers()