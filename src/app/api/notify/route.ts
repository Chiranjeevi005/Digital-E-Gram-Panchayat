import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendSystemNotification } from '@/lib/notificationService'
import { Session } from 'next-auth'

type SessionUser = {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function POST(_request: NextRequest) {
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
    const body = await _request.json()
    const { message, type } = body
    
    // Send notification
    await sendSystemNotification(typedSessionUser.id, message, type || 'info')
    
    return NextResponse.json({ message: 'Notification sent successfully' })
  } catch (error: any) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}