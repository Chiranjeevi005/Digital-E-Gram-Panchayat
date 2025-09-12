import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Application from '@/models/Application'
import DownloadHistory from '@/models/DownloadHistory'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Session } from 'next-auth'
import { sendSystemNotification } from '@/lib/notificationService'

interface DownloadHistoryType {
  _id: string
  service: {
    name: string
  }
  fileType: 'pdf' | 'jpeg'
  status: 'pending' | 'completed'
  createdAt: string
  applicationId: string
}

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
    
    // Only users can access their own download history
    // Normalize role checking to handle both old and new role names
    const isCitizen = typedSessionUser.role === 'user' || typedSessionUser.role === 'citizen' || typedSessionUser.role === 'Citizens';
    if (!isCitizen) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const downloads: any = await DownloadHistory.find({ user: typedSessionUser.id })
      .populate('service', 'name')
      .populate('application', 'service')
      .sort({ createdAt: -1 })
    
    const downloadResponse: DownloadHistoryType[] = downloads.map((download: any) => ({
      _id: download._id.toString(),
      service: download.service,
      fileType: download.fileType,
      status: download.status,
      createdAt: download.createdAt,
      applicationId: download.application._id.toString()
    }))
    
    return NextResponse.json(downloadResponse)
  } catch (error: any) {
    console.error('Error fetching download history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST route to handle document download requests (free service)
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
    
    // Only users can download documents
    // Normalize role checking to handle both old and new role names
    const isCitizen = typedSessionUser.role === 'user' || typedSessionUser.role === 'citizen' || typedSessionUser.role === 'Citizens';
    if (!isCitizen) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { downloadId, fileType } = body
    
    // Find the existing download history entry
    const existingDownload: any = await DownloadHistory.findById(downloadId)
      .populate('application', 'service formData')
      .populate('service', 'name')
    
    if (!existingDownload) {
      return NextResponse.json(
        { error: 'Download history not found' },
        { status: 404 }
      )
    }
    
    // Verify the download belongs to the user
    if (existingDownload.user.toString() !== typedSessionUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Create a new download history entry for the new format
    const downloadHistory = new DownloadHistory({
      application: existingDownload.application._id,
      user: typedSessionUser.id,
      service: existingDownload.service._id,
      fileType: fileType,
      status: 'completed'
    })
    
    await downloadHistory.save()
    
    // Send real-time notification
    await sendSystemNotification(
      typedSessionUser.id,
      `Your ${existingDownload.service.name} document (${fileType.toUpperCase()}) download has started`,
      'info'
    )
    
    // Simulate download progress (in a real implementation, this would be actual file generation)
    // For now, we'll just send a completion notification
    setTimeout(async () => {
      await sendSystemNotification(
        typedSessionUser.id,
        `Your ${existingDownload.service.name} document (${fileType.toUpperCase()}) has been downloaded successfully`,
        'success'
      )
    }, 3000)
    
    // Return success response with download information
    return NextResponse.json({
      message: 'Document ready for download',
      downloadId: downloadHistory._id,
      fileType,
      serviceName: existingDownload.service.name,
      applicationId: existingDownload.application._id
    })
  } catch (error: any) {
    console.error('Error processing download:', error)
    // Return a more specific error message
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid download ID format' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}