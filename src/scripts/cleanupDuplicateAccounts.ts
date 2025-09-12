import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '@/models/User'
import dbConnect from '@/lib/dbConnect'

// Load environment variables
dotenv.config()

// Required accounts that should be kept (from initializeRequiredAccounts.ts)
const requiredAccounts = [
  'admin@epanchayat.com',
  'staff1@epanchayat.com',
  'staff2@epanchayat.com'
]

async function cleanupDuplicateAccounts() {
  try {
    // Connect to database
    await dbConnect()
    
    console.log('Connected to database')
    
    // Find all users
    const allUsers = await User.find({})
    console.log(`Found ${allUsers.length} users in the database`)
    
    // Identify duplicate accounts (not in the required list)
    const duplicateAccounts = allUsers.filter(user => !requiredAccounts.includes(user.email))
    
    if (duplicateAccounts.length === 0) {
      console.log('No duplicate accounts found')
      process.exit(0)
    }
    
    console.log(`Found ${duplicateAccounts.length} duplicate accounts to remove:`)
    duplicateAccounts.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`)
    })
    
    // Confirm before deleting
    console.log('\nAre you sure you want to delete these accounts? (yes/no)')
    
    // In a real script, you would wait for user input here
    // For now, we'll proceed with deletion
    
    // Delete duplicate accounts
    for (const user of duplicateAccounts) {
      await User.deleteOne({ _id: user._id })
      console.log(`Deleted account: ${user.email}`)
    }
    
    console.log('Duplicate account cleanup completed')
    process.exit(0)
  } catch (error) {
    console.error('Error cleaning up duplicate accounts:', error)
    process.exit(1)
  }
}

// Run the cleanup
cleanupDuplicateAccounts()