import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Application from '@/models/Application'
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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    console.log('Debug app route called with params:', params);
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    console.log('Session:', session);
    
    if (!session || !(session as Session & { user: { id?: string } }).user) {
      console.log('No session or user found');
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }
    
    const typedSessionUser = (session as Session & { user: SessionUser }).user;
    console.log('Typed session user:', typedSessionUser);
    
    const application: any = await Application.findById(params.id)
      .populate('applicant', 'name email')
    
    if (!application) {
      console.log('Application not found');
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    console.log('Application found:', application._id);
    console.log('Applicant:', application.applicant);
    
    // Debug information
    const applicantId = application.applicant.toString();
    const sessionId = typedSessionUser.id;
    const isAuthorized = typedSessionUser.role === 'user' && applicantId === sessionId;
    
    console.log('Debug info:');
    console.log('Application applicant ID:', applicantId);
    console.log('Session user ID:', sessionId);
    console.log('Session user role:', typedSessionUser.role);
    console.log('Is authorized:', isAuthorized);
    console.log('Comparison result:', applicantId === sessionId);
    
    return NextResponse.json({
      message: 'Debug info',
      applicationId: application._id,
      applicantId: applicantId,
      sessionId: sessionId,
      sessionUserRole: typedSessionUser.role,
      isAuthorized: isAuthorized,
      isEqual: applicantId === sessionId,
      applicantDetails: {
        name: application.applicant.name,
        email: application.applicant.email
      }
    })
  } catch (error: any) {
    console.error('Error in debug app:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}