import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import bcrypt from 'bcrypt'

async function verifyAuth() {
  try {
    console.log('Connecting to database...')
    await dbConnect()
    
    console.log('Looking for test users...')
    const users = await User.find({ email: { $in: ['john@example.com', 'jane@example.com', 'bob@example.com'] } })
    
    console.log(`Found ${users.length} test users:`)
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`)
    })
    
    // Test password verification for john@example.com
    const testUser = await User.findOne({ email: 'john@example.com' })
    if (testUser) {
      console.log('\nTesting password verification for john@example.com...')
      const isPasswordValid = await bcrypt.compare('password123', testUser.password)
      console.log(`Password valid: ${isPasswordValid}`)
      
      console.log('\nUser details:')
      console.log(`ID: ${testUser._id}`)
      console.log(`Name: ${testUser.name}`)
      console.log(`Email: ${testUser.email}`)
      console.log(`Role: ${testUser.role}`)
    }
    
    console.log('\nVerification complete.')
  } catch (error) {
    console.error('Verification error:', error)
  }
}

verifyAuth()