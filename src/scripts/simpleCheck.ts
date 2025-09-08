import dotenv from 'dotenv'
import mongoose from 'mongoose'
dotenv.config({ path: '.env.local' }) // Load environment variables from .env.local

// Import models after loading environment variables
import Application from '@/models/Application'
import User from '@/models/User'

async function checkApplications() {
  try {
    console.log('Connecting to database...')
    console.log('MONGODB_URI:', process.env.MONGODB_URI)
    
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('Connected to database!')
    
    // List all users
    console.log('\nFetching all users...')
    const users = await User.find({}).lean()
    
    console.log(`Found ${users.length} users:`)
    console.log('=====================================')
    
    for (const user of users) {
      console.log(`User ID: ${user._id}`)
      console.log(`Name: ${user.name}`)
      console.log(`Email: ${user.email}`)
      console.log(`Role: ${user.role}`)
      console.log('---')
    }
    
    await mongoose.disconnect()
    console.log('Check completed!')
    process.exit(0)
  } catch (error) {
    console.error('Error checking applications:', error)
    process.exit(1)
  }
}

checkApplications()