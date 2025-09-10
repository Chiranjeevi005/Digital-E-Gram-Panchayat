import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '@/models/User'
import dbConnect from '@/lib/dbConnect'
import bcrypt from 'bcrypt'

// Load environment variables
dotenv.config()

async function testAuthFlow() {
  try {
    // Connect to database
    await dbConnect()
    
    console.log('Connected to database')
    
    // Test citizen registration
    console.log('\n--- Testing Citizen Registration ---')
    const citizenEmail = 'testcitizen@example.com'
    
    // Check if test citizen already exists
    let citizen = await User.findOne({ email: citizenEmail })
    if (citizen) {
      console.log('Test citizen already exists')
    } else {
      // Create test citizen
      citizen = new User({
        name: 'Test Citizen',
        email: citizenEmail,
        password: 'TestPass123!',
        role: 'Citizens', // Fixed: Use correct role name
        provider: 'local'
      })
      
      await citizen.save()
      console.log('Created test citizen account')
    }
    
    // Test staff login
    console.log('\n--- Testing Staff Login ---')
    const staffUser = await User.findOne({ email: 'staff1@epanchayat.com' })
    if (staffUser) {
      console.log('Staff account found:', staffUser.email, staffUser.role)
      // Test password verification (password was hashed during save)
      const isPasswordValid = await bcrypt.compare('StaffPass123!', staffUser.password)
      console.log('Staff password valid:', isPasswordValid)
    } else {
      console.log('Staff account not found')
    }
    
    // Test admin login
    console.log('\n--- Testing Admin Login ---')
    const adminUser = await User.findOne({ email: 'admin@epanchayat.com' })
    if (adminUser) {
      console.log('Admin account found:', adminUser.email, adminUser.role)
      // Test password verification (password was hashed during save)
      const isPasswordValid = await bcrypt.compare('AdminPass123!', adminUser.password)
      console.log('Admin password valid:', isPasswordValid)
    } else {
      console.log('Admin account not found')
    }
    
    // Test citizen login
    console.log('\n--- Testing Citizen Login ---')
    const citizenUser = await User.findOne({ email: 'testcitizen@example.com' })
    if (citizenUser) {
      console.log('Citizen account found:', citizenUser.email, citizenUser.role)
      // Test password verification (password was hashed during save)
      const isPasswordValid = await bcrypt.compare('TestPass123!', citizenUser.password)
      console.log('Citizen password valid:', isPasswordValid)
    } else {
      console.log('Citizen account not found')
    }
    
    console.log('\n--- Authentication Flow Test Completed ---')
    process.exit(0)
  } catch (error) {
    console.error('Error testing auth flow:', error)
    process.exit(1)
  }
}

// Run the test
testAuthFlow()