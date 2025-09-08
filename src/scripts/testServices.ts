import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' }) // Load environment variables from .env.local

import dbConnect from '@/lib/dbConnect'
import Service from '@/models/Service'

async function testServices() {
  try {
    console.log('Connecting to database...')
    await dbConnect()
    
    console.log('Fetching all services...')
    const services = await Service.find({}) // Removed populate to avoid schema issues
    
    console.log(`Found ${services.length} services:`)
    services.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name} (Category: ${service.category || 'Uncategorized'}) - ${service.isActive ? 'Active' : 'Inactive'}`)
      console.log(`   Description: ${service.description.substring(0, 50)}...`)
      console.log(`   Created by: ${service.createdBy}`)
    })
    
    console.log('\nService initialization test completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error testing services:', error)
    process.exit(1)
  }
}

// Run the test
testServices()