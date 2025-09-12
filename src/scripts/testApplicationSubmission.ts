import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import dbConnect from '@/lib/dbConnect'
import Application from '@/models/Application'
import Service from '@/models/Service'
import User from '@/models/User'

async function testApplicationSubmission() {
  try {
    console.log('Connecting to database...')
    await dbConnect()
    
    console.log('Checking existing data...')
    
    // Check users
    const users = await User.find({})
    console.log(`Found ${users.length} users`)
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`)
    })
    
    // Check services
    const services = await Service.find({})
    console.log(`\nFound ${services.length} services`)
    services.forEach(service => {
      console.log(`- ${service.name} (ID: ${service._id})`)
    })
    
    if (services.length === 0) {
      console.log('No services found! Please run npm run init:services')
      process.exit(1)
    }
    
    if (users.length === 0) {
      console.log('No users found! Please run npm run init:required-accounts')
      process.exit(1)
    }
    
    // Find a citizen user
    const citizenUser = users.find(user => user.role === 'Citizens')
    if (!citizenUser) {
      console.log('No citizen user found!')
      process.exit(1)
    }
    
    console.log(`\nUsing citizen user: ${citizenUser.name} (${citizenUser.email})`)
    
    // Use the first service
    const service = services[0]
    console.log(`Using service: ${service.name} (ID: ${service._id})`)
    
    // Create a test application
    console.log('\nCreating test application...')
    const application = new Application({
      service: service._id,
      applicant: citizenUser._id,
      status: 'approved',
      formData: {
        name: 'Test Applicant',
        email: 'test@example.com',
        phone: '1234567890'
      },
      processingTime: 0,
      downloadStatus: 'ready',
      downloadLinks: {
        pdf: `/api/downloads/${service._id}.pdf`,
        jpeg: `/api/downloads/${service._id}.jpeg`
      },
      submittedAt: new Date(),
      processedAt: new Date()
    })
    
    await application.save()
    console.log(`Application created successfully with ID: ${application._id}`)
    
    // Populate and display the application
    await application.populate([
      { path: 'service', select: 'name' },
      { path: 'applicant', select: 'name email' }
    ])
    
    console.log('\nApplication details:')
    console.log(`- ID: ${application._id}`)
    console.log(`- Service: ${(application as any).service.name}`)
    console.log(`- Applicant: ${(application as any).applicant.name} (${(application as any).applicant.email})`)
    console.log(`- Status: ${application.status}`)
    console.log(`- Submitted at: ${application.submittedAt}`)
    
    await mongoose.disconnect()
    console.log('\nTest completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error testing application submission:', error)
    process.exit(1)
  }
}

testApplicationSubmission()