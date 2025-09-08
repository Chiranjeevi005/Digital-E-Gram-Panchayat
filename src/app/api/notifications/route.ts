import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Notification from '@/models/Notification'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Types } from 'mongoose'
import { Session } from 'next-auth'

type SessionUser = {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
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
    
    // Fetch notifications for the user, sorted by creation date (newest first)
    const notifications = await Notification.find({ user: typedSessionUser.id })
      .sort({ createdAt: -1 })
      .lean()
    
    // Convert ObjectId to string for serialization
    const serializedNotifications = notifications.map(notification => ({
      ...notification,
      _id: (notification._id as Types.ObjectId).toString(),
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt ? notification.readAt.toISOString() : undefined
    }))
    
    return NextResponse.json(serializedNotifications)
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new notification (for testing purposes)
export async function POST(request: NextRequest) {
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
    const body = await request.json()
    
    const notification = new Notification({
      user: typedSessionUser.id,
      title: body.title,
      message: body.message,
      type: body.type || 'info'
    })
    
    await notification.save()
    
    // Convert ObjectId to string for serialization
    const serializedNotification = {
      ...notification.toObject(),
      _id: (notification._id as Types.ObjectId).toString(),
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt ? notification.readAt.toISOString() : undefined
    }
    
    return NextResponse.json(serializedNotification)
  } catch (error: any) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}