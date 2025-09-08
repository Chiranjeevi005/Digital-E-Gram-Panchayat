// Test script for account management features
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Application from '@/models/Application'

async function testAccountManagement() {
  try {
    await dbConnect()
    console.log('Connected to database')
    
    // Create a test user if one doesn't exist
    let user = await User.findOne({ email: 'test@example.com' })
    if (!user) {
      user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
        notificationPreferences: {
          email: true,
          sms: false,
          push: true,
          types: {
            applicationUpdates: true,
            serviceAnnouncements: true,
            systemNotifications: false
          }
        }
      })
      await user.save()
      console.log('Created test user')
    } else {
      console.log('Test user already exists')
    }
    
    // Create a test application if one doesn't exist
    let application = await Application.findOne({ applicant: user._id })
    if (!application) {
      application = new Application({
        service: '66d8f3b7a1b3c4d7e8f9a0b1', // Sample service ID
        applicant: user._id,
        status: 'pending',
        formData: {
          name: 'Test Application',
          description: 'This is a test application'
        }
      })
      await application.save()
      console.log('Created test application')
    } else {
      console.log('Test application already exists')
    }
    
    console.log('Test data setup complete')
    console.log('User ID:', user._id.toString())
    console.log('Application ID:', application._id.toString())
    
  } catch (error) {
    console.error('Error in test:', error)
  }
}

testAccountManagement()