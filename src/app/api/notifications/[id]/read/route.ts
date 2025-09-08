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

// Handle POST request (used by the notification dropdown)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
    
    // Find the notification and ensure it belongs to the user
    const notification = await Notification.findOne({
      _id: params.id,
      user: typedSessionUser.id
    })
    
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }
    
    // Mark as read
    notification.isRead = true
    notification.readAt = new Date()
    await notification.save()
    
    return NextResponse.json({ 
      message: 'Notification marked as read',
      notification: {
        ...notification.toObject(),
        _id: notification._id.toString(),
        createdAt: notification.createdAt.toISOString(),
        readAt: notification.readAt?.toISOString()
      }
    })
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle PUT request (for backward compatibility)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
    
    // Find the notification and ensure it belongs to the user
    const notification = await Notification.findOne({
      _id: params.id,
      user: typedSessionUser.id
    })
    
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }
    
    // Mark as read
    notification.isRead = true
    notification.readAt = new Date()
    await notification.save()
    
    return NextResponse.json({ 
      message: 'Notification marked as read',
      notification: {
        ...notification.toObject(),
        _id: notification._id.toString(),
        createdAt: notification.createdAt.toISOString(),
        readAt: notification.readAt?.toISOString()
      }
    })
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}