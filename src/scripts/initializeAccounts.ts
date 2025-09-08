import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from '@/models/User'
import dbConnect from '@/lib/dbConnect'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

/**
 * Initialize accounts with proper limits:
 * - Unlimited citizen accounts
 * - Maximum 2 staff accounts
 * - Maximum 1 officer account
 */

const initializeAccounts = async () => {
  try {
    // Connect to database
    await dbConnect()

    // Check existing counts
    const citizenCount = await User.countDocuments({ role: 'user' })
    const staffCount = await User.countDocuments({ role: 'staff' })
    const officerCount = await User.countDocuments({ role: 'officer' })

    console.log('Current account counts:')
    console.log(`- Citizens: ${citizenCount} (unlimited)`)
    console.log(`- Staff: ${staffCount} (max 2)`)
    console.log(`- Officers: ${officerCount} (max 1)`)

    // Create default accounts if they don't exist
    const defaultAccounts = [
      {
        name: 'John Citizen',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        status: 'active'
      },
      {
        name: 'Jane Staff',
        email: 'jane@example.com',
        password: 'password123',
        role: 'staff',
        status: 'active',
        department: 'Administration',
        position: 'Senior Staff'
      },
      {
        name: 'Bob Officer',
        email: 'bob@example.com',
        password: 'password123',
        role: 'officer',
        status: 'active',
        department: 'Administration',
        position: 'Chief Officer'
      }
    ]

    for (const account of defaultAccounts) {
      // Check if account already exists
      const existingUser = await User.findOne({ 
        email: account.email, 
        role: account.role 
      })
      
      if (!existingUser) {
        // Check role limits before creating
        if (account.role === 'staff') {
          const currentStaffCount = await User.countDocuments({ role: 'staff' })
          if (currentStaffCount >= 2) {
            console.log(`Skipping staff account creation - limit reached (${currentStaffCount}/2)`)
            continue
          }
        } else if (account.role === 'officer') {
          const currentOfficerCount = await User.countDocuments({ role: 'officer' })
          if (currentOfficerCount >= 1) {
            console.log(`Skipping officer account creation - limit reached (${currentOfficerCount}/1)`)
            continue
          }
        }

        // Hash password
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(account.password, saltRounds)

        // Create user
        const user = new User({
          ...account,
          password: hashedPassword
        })

        await user.save()
        console.log(`Created ${account.role} account: ${account.email}`)
      } else {
        console.log(`Account already exists: ${account.email} (${account.role})`)
      }
    }

    // Verify final counts
    const finalCitizenCount = await User.countDocuments({ role: 'user' })
    const finalStaffCount = await User.countDocuments({ role: 'staff' })
    const finalOfficerCount = await User.countDocuments({ role: 'officer' })

    console.log('\nFinal account counts:')
    console.log(`- Citizens: ${finalCitizenCount} (unlimited)`)
    console.log(`- Staff: ${finalStaffCount} (max 2)`)
    console.log(`- Officers: ${finalOfficerCount} (max 1)`)

    console.log('\nDefault credentials:')
    console.log('1. Citizen Account:')
    console.log('   Email: john@example.com')
    console.log('   Password: password123')
    console.log('   Role: Citizen')
    console.log('2. Staff Account:')
    console.log('   Email: jane@example.com')
    console.log('   Password: password123')
    console.log('   Role: Staff')
    console.log('3. Officer Account:')
    console.log('   Email: bob@example.com')
    console.log('   Password: password123')
    console.log('   Role: Officer')

    console.log('\nSecurity limits:')
    console.log('- Citizens: Unlimited')
    console.log('- Staff: Maximum 2 accounts')
    console.log('- Officers: Maximum 1 account')

    mongoose.connection.close()
  } catch (error) {
    console.error('Error initializing accounts:', error)
    mongoose.connection.close()
  }
}

// Run the initialization
initializeAccounts()