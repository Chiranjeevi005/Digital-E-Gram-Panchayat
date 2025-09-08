import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { z } from 'zod'
import logger from '@/lib/logger'
import { validatePassword } from '@/lib/passwordValidator'

// Validation schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'staff', 'citizen']).default('citizen')
})

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()
    
    // Get request body
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.safeParse(body)
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }
    
    const { name, email, password, role } = validatedData.data
    
    // Validate password strength for admin and staff roles
    if (role === 'admin' || role === 'staff') {
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          { error: 'Password does not meet requirements', details: passwordValidation.errors },
          { status: 400 }
        )
      }
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Enforce role-based account creation limits
    if (role !== 'citizen') {
      // For staff and admin roles, check existing accounts
      const existingAccounts = await User.countDocuments({ role })
      
      // Admins: limited to 1 account
      if (role === 'admin' && existingAccounts >= 1) {
        return NextResponse.json(
          { error: 'Only one admin account is allowed' },
          { status: 400 }
        )
      }
      
      // Staff: limited to 2 accounts
      if (role === 'staff' && existingAccounts >= 2) {
        return NextResponse.json(
          { error: 'Maximum of 2 staff accounts allowed' },
          { status: 400 }
        )
      }
    }
    
    // Create user - only local provider accounts need passwords
    const user = new User({
      name,
      email,
      password, // Will be hashed by the pre-save hook
      role,
      provider: 'local',
      emailVerified: null
    })
    
    await user.save()
    
    // Return user data (without password)
    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      provider: user.provider
    }, { status: 201 })
  } catch (error: any) {
    logger.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}