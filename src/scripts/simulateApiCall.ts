import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Import the actual API route handler
import { POST } from '@/app/api/applications/route'
import { NextRequest } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import Service from '@/models/Service'
import * as nextAuth from 'next-auth'

// Mock NextRequest
class MockNextRequest {
  body: any
  headers: Map<string, string>
  
  constructor(body: any) {
    this.body = body
    this.headers = new Map()
  }
  
  async json() {
    return this.body
  }
}

async function simulateApiCall() {
  try {
    console.log('Simulating API call to /api/applications...')
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
    
    // Create mock session (this is what would normally be provided by next-auth)
    const mockSession = {
      user: {
        id: citizenUser._id.toString(),
        name: citizenUser.name,
        email: citizenUser.email,
        role: citizenUser.role
      }
    }
    
    // Mock the getServerSession function
    const originalGetServerSession = nextAuth.getServerSession
    // We'll use jest mocking in tests instead of this approach
    
    // Create the request data
    const requestData = {
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
    
    console.log('Request data:', JSON.stringify(requestData, null, 2))
    
    // Create a mock request
    const mockRequest = new MockNextRequest(requestData) as unknown as NextRequest
    
    // Call the API route handler directly
    console.log('Calling API route handler...')
    const response = await POST(mockRequest)
    
    console.log('Response status:', response.status)
    const responseData = await response.json()
    console.log('Response data:', JSON.stringify(responseData, null, 2))
    
    await mongoose.disconnect()
    console.log('\nAPI call simulation completed!')
    process.exit(0)
  } catch (error) {
    console.error('ERROR in API call simulation:', error)
    process.exit(1)
  }
}

simulateApiCall()