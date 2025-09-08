import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Session } from 'next-auth'

type SessionUser = {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Validation schema for staff profile update
const validateProfileUpdate = (data: any) => {
  const errors: string[] = []
  
  // Validate name if provided
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name must be a non-empty string')
    }
  }
  
  // Validate phone if provided
  if (data.phone !== undefined) {
    if (typeof data.phone !== 'string') {
      errors.push('Phone must be a string')
    }
  }
  
  // Validate staff-specific fields if provided
  if (data.department !== undefined && typeof data.department !== 'string') {
    errors.push('Department must be a string')
  }
  
  if (data.position !== undefined && typeof data.position !== 'string') {
    errors.push('Position must be a string')
  }
  
  if (data.employeeId !== undefined && typeof data.employeeId !== 'string') {
    errors.push('Employee ID must be a string')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as Session & { user: { id?: string } }).user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const typedSessionUser = (session as Session & { user: SessionUser }).user;
    
    // Check if user has staff role
    if (typedSessionUser.role !== 'staff') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validate input
    const validation = validateProfileUpdate(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.errors },
        { status: 400 }
      )
    }
    
    // Prepare update data - only include fields that are provided
    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.department !== undefined) updateData.department = body.department
    if (body.position !== undefined) updateData.position = body.position
    if (body.employeeId !== undefined) updateData.employeeId = body.employeeId
    
    // Update user's profile
    const updatedUser = await User.findByIdAndUpdate(
      typedSessionUser.id,
      { $set: updateData },
      { new: true, select: 'name phone department position employeeId' }
    )
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error updating staff profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(_request: NextRequest) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as Session & { user: { id?: string } }).user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const typedSessionUser = (session as Session & { user: SessionUser }).user;
    
    // Check if user has staff role
    if (typedSessionUser.role !== 'staff') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Get user's profile data
    const user = await User.findById(typedSessionUser.id).select('name phone department position employeeId')
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error fetching staff profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
