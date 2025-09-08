import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import Application from '@/models/Application'
import { Session } from 'next-auth'

type SessionUser = {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    const fieldName = searchParams.get('fieldName')
    
    if (!applicationId || !fieldName) {
      return NextResponse.json(
        { error: 'Missing required parameters: applicationId and fieldName' },
        { status: 400 }
      )
    }
    
    // Find the application
    const application: any = await Application.findById(applicationId)
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Check permissions
    const isAuthorized = 
      (typedSessionUser.role === 'user' && application.applicant.toString() === typedSessionUser.id) ||
      (typedSessionUser.role === 'staff' && application.assignedTo && application.assignedTo.toString() === typedSessionUser.id) ||
      typedSessionUser.role === 'officer'
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the file information from formData
    const fileData = application.formData[fieldName]
    
    if (!fileData || !fileData.url) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    // Return the file URL
    return NextResponse.json({
      url: fileData.url,
      publicId: fileData.publicId
    })
  } catch (error: any) {
    console.error('Error retrieving file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}