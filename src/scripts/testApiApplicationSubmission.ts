import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import dbConnect from '@/lib/dbConnect'
import Application from '@/models/Application'
import Service from '@/models/Service'
import User from '@/models/User'

// Simulate the exact data structure that the frontend sends
async function testApiApplicationSubmission() {
  try {
    console.log('Testing API application submission...')
    await dbConnect()
    
    // Find a citizen user
    const citizenUser = await User.findOne({ role: 'Citizens' })
    if (!citizenUser) {
      console.log('ERROR: No citizen user found!')
      process.exit(1)
    }
    
    console.log(`Using citizen user: ${citizenUser.name} (${citizenUser.email})`)
    
    // Find a service
    const service = await Service.findOne({})
    if (!service) {
      console.log('ERROR: No service found!')
      process.exit(1)
    }
    
    console.log(`Using service: ${service.name} (ID: ${service._id})`)
    
    // Simulate the exact data structure that the frontend sends
    const applicationData = {
      service: service._id.toString(),
      formData: {
        fullName: 'Test Applicant',
        email: 'test@example.com',
        mobile: '1234567890',
        address: '123 Test Street, Test City',
        documentType: 'birth',
        dateOfEvent: '2020-01-01',
        placeOfEvent: 'Test Hospital',
        fatherName: 'Test Father',
        motherName: 'Test Mother'
      }
    }
    
    console.log('Sending application data:', JSON.stringify(applicationData, null, 2))
    
    // Simulate the API call directly to the database (bypassing the API route)
    console.log('Creating application directly in database...')
    
    const application = new Application({
      service: service._id,
      applicant: citizenUser._id,
      status: 'approved',
      formData: applicationData.formData,
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
    
    console.log('Application details:')
    console.log(`  - ID: ${application._id}`)
    console.log(`  - Service: ${(application as any).service.name}`)
    console.log(`  - Applicant: ${(application as any).applicant.name} (${(application as any).applicant.email})`)
    console.log(`  - Status: ${application.status}`)
    console.log(`  - Submitted at: ${application.submittedAt}`)
    
    await mongoose.disconnect()
    console.log('\nAPI test completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('ERROR in API test:', error)
    process.exit(1)
  }
}

testApiApplicationSubmission()