import dbConnect from '@/lib/dbConnect'
import Service from '@/models/Service'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testDbConnection() {
  try {
    console.log('Testing database connection...')
    
    // Connect to database
    const connection = await dbConnect()
    console.log('Connected to database successfully!')
    
    // Test fetching services
    console.log('Fetching services...')
    const services = await Service.find({ isActive: true }).limit(5)
    console.log(`Found ${services.length} active services`)
    
    if (services.length > 0) {
      console.log('First service:', services[0].name)
    }
    
    console.log('Database test completed successfully!')
  } catch (error) {
    console.error('Database test failed:', error)
  }
}

testDbConnection()