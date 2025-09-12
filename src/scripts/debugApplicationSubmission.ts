import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import dbConnect from '@/lib/dbConnect'
import Application from '@/models/Application'
import Service from '@/models/Service'
import User from '@/models/User'

async function debugApplicationSubmission() {
  try {
    console.log('Debug: Testing application submission process...')
    await dbConnect()
    
    console.log('1. Checking database connection...')
    console.log('Database connected successfully')
    
    console.log('2. Checking collections...')
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('Available collections:', collections.map(c => c.name))
    
    console.log('3. Checking users...')
    const userCount = await User.countDocuments()
    console.log(`Total users: ${userCount}`)
    
    const users = await User.find({}).limit(5)
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`)
    })
    
    console.log('4. Checking services...')
    const serviceCount = await Service.countDocuments()
    console.log(`Total services: ${serviceCount}`)
    
    const services = await Service.find({}).limit(5)
    services.forEach(service => {
      console.log(`  - ${service.name} (ID: ${service._id})`)
    })
    
    if (services.length === 0) {
      console.log('ERROR: No services found!')
      process.exit(1)
    }
    
    if (users.length === 0) {
      console.log('ERROR: No users found!')
      process.exit(1)
    }
    
    // Find a citizen user
    const citizenUser = users.find(user => user.role === 'Citizens')
    if (!citizenUser) {
      console.log('ERROR: No citizen user found!')
      process.exit(1)
    }
    
    console.log(`5. Using citizen user: ${citizenUser.name} (${citizenUser.email})`)
    
    // Use the first service
    const service = services[0]
    console.log(`6. Using service: ${service.name} (ID: ${service._id})`)
    
    console.log('7. Creating test application...')
    const applicationData = {
      service: service._id,
      applicant: citizenUser._id,
      status: 'approved',
      formData: {
        fullName: 'Test Applicant',
        email: 'test@example.com',
        mobile: '1234567890',
        address: '123 Test Street, Test City'
      },
      processingTime: 0,
      downloadStatus: 'ready',
      downloadLinks: {
        pdf: `/api/downloads/${service._id}.pdf`,
        jpeg: `/api/downloads/${service._id}.jpeg`
      },
      submittedAt: new Date(),
      processedAt: new Date()
    }
    
    console.log('Application data:', JSON.stringify(applicationData, null, 2))
    
    const application = new Application(applicationData)
    await application.save()
    console.log(`8. Application created successfully with ID: ${application._id}`)
    
    // Populate and display the application
    await application.populate([
      { path: 'service', select: 'name' },
      { path: 'applicant', select: 'name email' }
    ])
    
    console.log('9. Application details:')
    console.log(`   - ID: ${application._id}`)
    console.log(`   - Service: ${(application as any).service.name}`)
    console.log(`   - Applicant: ${(application as any).applicant.name} (${(application as any).applicant.email})`)
    console.log(`   - Status: ${application.status}`)
    console.log(`   - Submitted at: ${application.submittedAt}`)
    
    await mongoose.disconnect()
    console.log('\nDebug test completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('ERROR in debug test:', error)
    process.exit(1)
  }
}

debugApplicationSubmission()