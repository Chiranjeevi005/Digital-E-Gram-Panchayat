import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Application from '@/models/Application'
import DownloadHistory from '@/models/DownloadHistory'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Session } from 'next-auth'

interface DownloadHistoryType {
  _id: string
  service: {
    name: string
  }
  fileType: 'pdf' | 'jpeg'
  status: 'pending' | 'completed'
  createdAt: string
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
    if (typedSessionUser.role !== 'user' && typedSessionUser.role !== 'citizen') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const downloads: any = await DownloadHistory.find({ user: typedSessionUser.id })
      .populate('service', 'name')
      .sort({ createdAt: -1 })
    
    const downloadResponse: DownloadHistoryType[] = downloads.map((download: any) => ({
      _id: download._id.toString(),
      service: download.service,
      fileType: download.fileType,
      status: download.status,
      createdAt: download.createdAt,
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
    if (typedSessionUser.role !== 'user' && typedSessionUser.role !== 'citizen') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { applicationId, fileType } = body
    
    // Verify the application belongs to the user and is approved
    const application: any = await Application.findById(applicationId)
      .populate('service', 'name')
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    if (application.applicant.toString() !== typedSessionUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (application.status !== 'approved') {
      return NextResponse.json(
        { error: 'Application not approved' },
        { status: 400 }
      )
    }
    
    // Create a download history entry
    const downloadHistory = new DownloadHistory({
      application: applicationId,
      user: typedSessionUser.id,
      service: application.service._id,
      fileType: fileType,
      status: 'completed'
    })
    
    await downloadHistory.save()
    
    // Return success response with download information
    return NextResponse.json({
      message: 'Document ready for download',
      applicationId,
      fileType,
      serviceName: application.service.name
    })
  } catch (error: any) {
    console.error('Error processing download:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}