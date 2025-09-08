import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { Session } from 'next-auth'

// Validation schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['user', 'staff', 'officer']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  employeeId: z.string().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
})

// Update a user (for admin/officer)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    
    const resolvedParams = await params;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      resolvedParams.id,
      { $set: validatedData.data },
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete a user (for admin/officer)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    
    const resolvedParams = await params;
    
    // Delete user
    const user = await User.findByIdAndDelete(resolvedParams.id)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}