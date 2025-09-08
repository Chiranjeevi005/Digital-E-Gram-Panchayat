import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { Session } from 'next-auth'

// Validation schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['user', 'staff', 'officer']).default('user'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  department: z.string().optional(),
  position: z.string().optional(),
  employeeId: z.string().optional()
})

// Get all users (for admin/officer)
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()
    
    // Get session to verify user role
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and has proper role
    if (!session || !(session as Session & { user: { role?: string } }).user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userRole = (session as Session & { user: { role?: string } }).user?.role
    if (userRole !== 'officer') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    
    // Build query
    const query: any = {}
    if (role && role !== 'all') {
      query.role = role
    }
    if (status && status !== 'all') {
      query.status = status
    }
    
    // Fetch users
    const users = await User.find(query).select('-password').sort({ createdAt: -1 })
    
    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new user (for admin/officer)
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()
    
    // Get session to verify user role
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and has proper role
    if (!session || !(session as Session & { user: { role?: string } }).user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userRole = (session as Session & { user: { role?: string } }).user?.role
    if (userRole !== 'officer') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Get request body
    const body = await request.json()
    
    // Validate input
    const validatedData = userSchema.safeParse(body)
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.data.email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Security feature: Limit number of accounts based on role
    if (validatedData.data.role === 'user') {
      // Citizens can create unlimited accounts - no limit
    } else if (validatedData.data.role === 'staff') {
      // Limit staff accounts to 2
      const staffCount = await User.countDocuments({ role: 'staff' })
      if (staffCount >= 2) {
        return NextResponse.json(
          { error: 'Maximum limit of 2 staff accounts reached' },
          { status: 400 }
        )
      }
    } else if (validatedData.data.role === 'officer') {
      // Limit officer accounts to 1
      const officerCount = await User.countDocuments({ role: 'officer' })
      if (officerCount >= 1) {
        return NextResponse.json(
          { error: 'Only one officer account is allowed' },
          { status: 400 }
        )
      }
    }
    
    // Create user
    const user = new User(validatedData.data)
    await user.save()
    
    // Return user data (without password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department,
      position: user.position,
      employeeId: user.employeeId,
      createdAt: user.createdAt
    }
    
    return NextResponse.json(userData, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}