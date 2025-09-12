import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { sendApplicationStatusUpdate } from '@/lib/notificationService'

async function testNotificationService() {
  try {
    console.log('Testing notification service...')
    await dbConnect()
    
    // Find a citizen user
    const citizenUser = await User.findOne({ role: 'Citizens' })
    if (!citizenUser) {
      console.log('ERROR: No citizen user found!')
      process.exit(1)
    }
    
    console.log(`Using citizen user: ${citizenUser.name} (${citizenUser.email})`)
    
    // Test sending a notification
    console.log('Sending application status update notification...')
    await sendApplicationStatusUpdate(
      citizenUser._id.toString(),
      'test-application-id',
      'approved'
    )
    
    console.log('Notification sent successfully!')
    
    await mongoose.disconnect()
    console.log('\nNotification service test completed!')
    process.exit(0)
  } catch (error) {
    console.error('ERROR in notification service test:', error)
    process.exit(1)
  }
}

testNotificationService()