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

// Validation schema for profile update
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
  
  // Validate address fields if provided
  if (data.address !== undefined && typeof data.address !== 'string') {
    errors.push('Address must be a string')
  }
  
  if (data.district !== undefined && typeof data.district !== 'string') {
    errors.push('District must be a string')
  }
  
  if (data.state !== undefined && typeof data.state !== 'string') {
    errors.push('State must be a string')
  }
  
  if (data.pincode !== undefined) {
    if (typeof data.pincode !== 'string') {
      errors.push('Pincode must be a string')
    }
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
    
    // Normalize role checking to handle both old and new role names
    const isCitizen = typedSessionUser.role === 'user' || typedSessionUser.role === 'citizen' || typedSessionUser.role === 'Citizens';
    if (!isCitizen) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    if (body.address !== undefined) updateData.address = body.address
    if (body.district !== undefined) updateData.district = body.district
    if (body.state !== undefined) updateData.state = body.state
    if (body.pincode !== undefined) updateData.pincode = body.pincode
    
    // Update user's profile
    const updatedUser = await User.findByIdAndUpdate(
      typedSessionUser.id,
      { $set: updateData },
      { new: true, select: 'name phone address district state pincode email role' }
    )
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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
    
    // Normalize role checking to handle both old and new role names
    const isCitizen = typedSessionUser.role === 'user' || typedSessionUser.role === 'citizen' || typedSessionUser.role === 'Citizens';
    if (!isCitizen) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user's profile data
    const user = await User.findById(typedSessionUser.id).select('name phone address district state pincode')
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}