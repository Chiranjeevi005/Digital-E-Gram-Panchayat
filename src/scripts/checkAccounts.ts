import dotenv from 'dotenv'
import User from '@/models/User'
import dbConnect from '@/lib/dbConnect'

// Load environment variables
dotenv.config()

async function checkAccounts() {
  try {
    // Connect to database
    await dbConnect()
    
    console.log('Connected to database')
    
    // Check admin account
    console.log('\n--- Admin Account ---')
    const adminUser = await User.findOne({ email: 'admin@epanchayat.com' })
    if (adminUser) {
      console.log('Email:', adminUser.email)
      console.log('Role:', adminUser.role)
      console.log('Password (hashed):', adminUser.password)
      console.log('Provider:', adminUser.provider)
    } else {
      console.log('Admin account not found')
    }
    
    // Check staff accounts
    console.log('\n--- Staff Accounts ---')
    const staffUsers = await User.find({ role: 'staff' })
    staffUsers.forEach((user, index) => {
      console.log(`Staff ${index + 1}:`)
      console.log('  Email:', user.email)
      console.log('  Role:', user.role)
      console.log('  Password (hashed):', user.password)
      console.log('  Provider:', user.provider)
    })
    
    // Check test citizen account
    console.log('\n--- Test Citizen Account ---')
    const citizenUser = await User.findOne({ email: 'testcitizen@example.com' })
    if (citizenUser) {
      console.log('Email:', citizenUser.email)
      console.log('Role:', citizenUser.role)
      console.log('Password (hashed):', citizenUser.password)
      console.log('Provider:', citizenUser.provider)
    } else {
      console.log('Test citizen account not found')
    }
    
    console.log('\n--- Account Check Completed ---')
    process.exit(0)
  } catch (error) {
    console.error('Error checking accounts:', error)
    process.exit(1)
  }
}

// Run the check
checkAccounts()