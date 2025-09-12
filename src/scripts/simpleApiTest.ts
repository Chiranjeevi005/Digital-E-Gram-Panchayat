import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import dbConnect from '@/lib/dbConnect'
import Application from '@/models/Application'
import Service from '@/models/Service'
import User from '@/models/User'
import { z } from 'zod'

// Validation schema (same as in the API route)
const applicationSchema = z.object({
  service: z.string().min(1, { message: 'Service ID is required' }),
  formData: z.record(z.string(), z.any()),
})

async function simpleApiTest() {
  try {
    console.log('Testing application submission API logic...')
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
    
    // Simulate the request body
    const body = {
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
    
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    // Validate input (same as in the API route)
    console.log('Validating input...')
    const validatedData = applicationSchema.safeParse(body)
    
    if (!validatedData.success) {
      console.log('Validation error:', validatedData.error.flatten())
      process.exit(1)
    }
    
    console.log('Input validation passed')
    
    // Check if service exists (same as in the API route)
    console.log('Checking if service exists...')
    const serviceExists = await Service.findById(validatedData.data.service)
    if (!serviceExists) {
      console.log('Service not found')
      process.exit(1)
    }
    
    console.log('Service found')
    
    // Process file uploads in formData (same as in the API route)
    const processedFormData = { ...validatedData.data.formData }
    
    // Create application (same as in the API route)
    console.log('Creating application...')
    const application = new Application({
      ...validatedData.data,
      formData: processedFormData,
      applicant: citizenUser._id,
      status: 'approved', // Automatically approve for free service
      processedAt: new Date(), // Process immediately
      downloadStatus: 'ready', // Ready for immediate download
      downloadLinks: {
        pdf: `/api/downloads/${validatedData.data.service}.pdf`,
        jpeg: `/api/downloads/${validatedData.data.service}.jpeg`
      }
    })
    
    await application.save()
    console.log(`Application created successfully with ID: ${application._id}`)
    
    // Populate for response (same as in the API route)
    await application.populate([
      { path: 'service', select: 'name' },
      { path: 'applicant', select: 'name email' }
    ])
    
    // Create response object (same as in the API route)
    const appResponse = {
      _id: application._id.toString(),
      service: (application as any).service,
      applicant: (application as any).applicant,
      status: application.status,
      formData: application.formData,
      assignedTo: (application as any).assignedTo,
      remarks: application.remarks,
      submittedAt: application.submittedAt,
      processedAt: application.processedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    }
    
    console.log('Application response:', JSON.stringify(appResponse, null, 2))
    
    await mongoose.disconnect()
    console.log('\nSimple API test completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('ERROR in simple API test:', error)
    process.exit(1)
  }
}

simpleApiTest()