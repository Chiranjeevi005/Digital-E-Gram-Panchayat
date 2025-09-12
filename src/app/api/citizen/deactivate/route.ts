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

export async function PUT(_request: NextRequest) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    
    // Check if session and user exist
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
    
    // Update user to mark as deactivated
    const user = await User.findByIdAndUpdate(
      typedSessionUser.id,
      { 
        isDeactivated: true,
        deactivatedAt: new Date()
      },
      { new: true }
    )
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      message: 'Account deactivated successfully',
      deactivatedAt: user.deactivatedAt
    })
  } catch (error: any) {
    console.error('Error deactivating account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}