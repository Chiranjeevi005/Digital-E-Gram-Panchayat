import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import User from '@/models/User'
import dbConnect from '@/lib/dbConnect'

// Load environment variables
dotenv.config()

// Predefined accounts
const predefinedAccounts = [
  {
    name: 'Officer User',
    email: 'officer@epanchayat.com',
    password: 'OfficerPass123!',
    role: 'Officer',                  // Officer role
    provider: 'local'
  },
  {
    name: 'Staff User 1',
    email: 'staff1@epanchayat.com',
    password: 'StaffPass123!',
    role: 'Staff',
    provider: 'local'
  },
  {
    name: 'Staff User 2',
    email: 'staff2@epanchayat.com',
    password: 'StaffPass123!',
    role: 'Staff',
    provider: 'local'
  }
]

async function initializeAccounts() {
  try {
    // Connect to database
    await dbConnect()
    
    console.log('Connected to database')
    
    // Create predefined accounts
    for (const account of predefinedAccounts) {
      // Check if account already exists
      const existingUser = await User.findOne({ email: account.email })
      
      if (existingUser) {
        console.log(`Account ${account.email} already exists`)
        continue
      }
      
      // Create user - let the pre-save hook hash the password
      const user = new User({
        name: account.name,
        email: account.email,
        password: account.password, // Plain text password - will be hashed by pre-save hook
        role: account.role,
        provider: account.provider,
        emailVerified: new Date()
      })
      
      await user.save()
      console.log(`Created account: ${account.email} with role: ${account.role}`)
    }
    
    console.log('Account initialization completed')
    process.exit(0)
  } catch (error) {
    console.error('Error initializing accounts:', error)
    process.exit(1)
  }
}

// Run the initialization
initializeAccounts()