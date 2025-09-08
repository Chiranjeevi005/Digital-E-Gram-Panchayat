import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Notification from '@/models/Notification'
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
    
    if (!session || !(session as Session & { user: { id?: string } }).user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const typedSessionUser = (session as Session & { user: SessionUser }).user;
    
    // Mark all notifications as read for the user
    await Notification.updateMany(
      { user: typedSessionUser.id, readAt: { $exists: false } },
      { readAt: new Date() }
    )
    
    return NextResponse.json({ message: 'All notifications marked as read' })
  } catch (error: any) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}