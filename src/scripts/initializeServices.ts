import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' }) // Load environment variables from .env.local

import dbConnect from '@/lib/dbConnect'
import Service from '@/models/Service'
import User from '@/models/User'

// Sample officer user ID - in a real scenario, you would get this from your database
// For now, we'll create a placeholder
const OFFICER_ID = '64f8b8e7d8e5c3a8d8e5c3a8' // This is a placeholder ID

// Service data for the four required services - all free now
const servicesData = [
  {
    name: 'Birth & Death Certificates',
    description: 'Apply for birth and death certificates online. Upload required documents and track your application status.',
    requirements: [
      'Full Name',
      'Date of Birth/Death',
      'Place of Birth/Death',
      'Father\'s Name',
      'Mother\'s Name',
    'Address',
      'Document Type (Birth/Death)',
      ' supporting documents (Hospital Certificate, Parent ID, etc.)'
    ],
    processingTime: 0, // Immediate processing
    category: 'Certificates',
    instantDownloadFees: {
      pdf: 0, // Free download
      jpeg: 0 // Free download
    },
    isActive: true
  },
  {
    name: 'Government Schemes',
    description: 'Access and apply for various government schemes available for different categories of citizens.',
    requirements: [
      'Scheme Name',
      'Full Name',
      'Aadhar Number',
      'Category (General/OBC/SC/ST)',
      'Income Certificate',
      'Residence Proof',
      'Caste Certificate (if applicable)'
    ],
    processingTime: 0, // Immediate processing
    category: 'Welfare',
    instantDownloadFees: {
      pdf: 0, // Free download
      jpeg: 0 // Free download
    },
    isActive: true
  },
  {
    name: 'Grievance Redressal',
    description: 'Raise complaints regarding civic issues and track their resolution status.',
    requirements: [
      'Complaint Category (Water, Electricity, Roads, etc.)',
      'Complaint Description',
      'Location/Area',
      'Contact Information',
      'Supporting Documents (if any)'
    ],
    processingTime: 0, // Immediate processing
    category: 'Complaints',
    instantDownloadFees: {
      pdf: 0, // Free download
      jpeg: 0 // Free download
    },
    isActive: true
  },
  {
    name: 'Land Records & Utility Connections',
    description: 'Request digital land records or apply for new utility connections (electricity, water, sanitation).',
    requirements: [
      'Service Type (Land Record/Utility Connection)',
      'Full Name',
      'Aadhar Number',
      'Property Details (Survey Number/Address)',
      'Land Ownership Documents',
      'Utility Type (Electricity/Water/Sanitation)'
    ],
    processingTime: 0, // Immediate processing
    category: 'Property',
    instantDownloadFees: {
      pdf: 0, // Free download
      jpeg: 0 // Free download
    },
    isActive: true
  }
]

async function initializeServices() {
  try {
    console.log('Connecting to database...')
    await dbConnect()
    
    // Check if admin user exists, if not create a placeholder
    let admin = await User.findOne({ email: 'admin@digitalgram.com' })
    if (!admin) {
      console.log('Creating placeholder admin user...')
      admin = new User({
        name: 'Admin User',
        email: 'admin@digitalgram.com',
        password: 'placeholder-password', // This would be hashed in a real scenario
        role: 'Officer' // Changed from 'admin' to 'Officer'
      })
      await admin.save()
      console.log('Created admin user with ID:', admin._id)
    } else {
      console.log('Admin user already exists with ID:', admin._id)
    }
    
    console.log('Checking existing services...')
    const existingServices = await Service.find({})
    
    // Create a map of existing services by name for easy lookup
    const existingServiceMap = new Map(existingServices.map(service => [service.name, service]))
    
    console.log(`Found ${existingServices.length} existing services.`)
    
    // Process each service in our data
    for (const serviceData of servicesData) {
      const existingService = existingServiceMap.get(serviceData.name)
      
      if (existingService) {
        // Update existing service with category and download fee information
        console.log(`Updating existing service: ${serviceData.name}`)
        existingService.category = serviceData.category
        existingService.instantDownloadFees = serviceData.instantDownloadFees
        existingService.processingTime = serviceData.processingTime
        await existingService.save()
        console.log(`Updated service: ${existingService.name}`)
      } else {
        // Create new service
        console.log(`Creating new service: ${serviceData.name}`)
        const service = new Service({
          ...serviceData,
          createdBy: admin._id
        })
        await service.save()
        console.log(`Created service: ${service.name}`)
      }
    }
    
    console.log('Service initialization completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error initializing services:', error)
    process.exit(1)
  }
}

// Run the initialization
initializeServices()