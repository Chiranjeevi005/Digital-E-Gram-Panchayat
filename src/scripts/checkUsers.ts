import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' }) // Load environment variables from .env.local

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

async function checkUsers() {
  try {
    console.log('Connecting to database...')
    await dbConnect()
    
    console.log('Checking existing users...')
    const users = await User.find({})
    
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('Error checking users:', error)
    process.exit(1)
  }
}

// Run the check
checkUsers()