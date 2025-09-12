import dotenv from 'dotenv'
import User from '@/models/User'
import dbConnect from '@/lib/dbConnect'

// Load environment variables
dotenv.config()

async function checkUsers() {
  try {
    // Connect to database
    await dbConnect()
    
    console.log('Connected to database')
    
    // Find all users
    const users = await User.find({})
    
    console.log('Existing users:')
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Role: ${user.role}, Provider: ${user.provider}`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('Error checking users:', error)
    process.exit(1)
  }
}

// Run the check
checkUsers()