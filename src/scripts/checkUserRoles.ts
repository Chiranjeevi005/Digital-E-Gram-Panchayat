import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

async function checkUserRoles() {
  try {
    console.log('Checking user roles in the database...')
    await dbConnect()
    
    // Get all unique roles
    const roles = await User.distinct('role')
    console.log('Available roles:', roles)
    
    // Count users by role
    console.log('\nUser count by role:')
    for (const role of roles) {
      const count = await User.countDocuments({ role })
      console.log(`  ${role}: ${count}`)
    }
    
    // Show sample users for each role
    console.log('\nSample users by role:')
    for (const role of roles) {
      const users = await User.find({ role }).limit(3)
      console.log(`\n${role}:`)
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`)
      })
    }
    
    await mongoose.disconnect()
    console.log('\nRole check completed!')
    process.exit(0)
  } catch (error) {
    console.error('Error checking user roles:', error)
    process.exit(1)
  }
}

checkUserRoles()