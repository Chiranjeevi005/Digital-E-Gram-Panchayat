import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Application from '@/models/Application'
import Service from '@/models/Service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { sendApplicationStatusUpdate } from '@/lib/notificationService'
import { Session } from 'next-auth'

// Validation schema
const applicationSchema = z.object({
  service: z.string().min(1, { message: 'Service ID is required' }),
  formData: z.record(z.string(), z.any()),
})

// Define the SessionUser type
type SessionUser = {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ApplicationType {
  _id: string;
  service: {
    _id: string;
    name: string;
  } | string;
  applicant: {
    _id: string;
    name: string;
    email: string;
  } | string;
  status: 'pending' | 'in-progress' | 'approved' | 'rejected';
  formData: Record<string, any>;
  assignedTo?: string | null;
  remarks?: string | null;
  submittedAt: Date;
  processedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

export async function GET() {
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
    
    let applications: ApplicationType[] = []
    
    // Different queries based on user role
    // Normalize role checking to handle both old and new role names
    const isCitizen = typedSessionUser.role === 'user' || typedSessionUser.role === 'citizen' || typedSessionUser.role === 'Citizens';
    const isStaff = typedSessionUser.role === 'staff' || typedSessionUser.role === 'Staff';
    const isOfficer = typedSessionUser.role === 'officer' || typedSessionUser.role === 'Officer';
    
    if (isCitizen) {
      // Users can only see their own applications
      const apps: any = await Application.find({ applicant: typedSessionUser.id })
        .populate('service', 'name')
        .populate('applicant', 'name email')
        .sort({ createdAt: -1 })
      
      applications = apps.map((app: any) => ({
        _id: app._id.toString(),
        service: app.service,
        applicant: app.applicant,
        status: app.status,
        formData: app.formData,
        assignedTo: app.assignedTo,
        remarks: app.remarks,
        submittedAt: app.submittedAt,
        processedAt: app.processedAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      }))
    } else if (isStaff) {
      // Staff can see applications assigned to them
      const apps: any = await Application.find({ assignedTo: typedSessionUser.id })
        .populate('service', 'name')
        .populate('applicant', 'name email')
        .sort({ createdAt: -1 })
      
      applications = apps.map((app: any) => ({
        _id: app._id.toString(),
        service: app.service,
        applicant: app.applicant,
        status: app.status,
        formData: app.formData,
        assignedTo: app.assignedTo,
        remarks: app.remarks,
        submittedAt: app.submittedAt,
        processedAt: app.processedAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      }))
    } else if (isOfficer) {
      // Officers can see all applications
      const apps: any = await Application.find()
        .populate('service', 'name')
        .populate('applicant', 'name email')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
      
      applications = apps.map((app: any) => ({
        _id: app._id.toString(),
        service: app.service,
        applicant: app.applicant,
        status: app.status,
        formData: app.formData,
        assignedTo: app.assignedTo,
        remarks: app.remarks,
        submittedAt: app.submittedAt,
        processedAt: app.processedAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      }))
    } else {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(applications)
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Function to generate a download link for the application data
function generateDownloadLink(applicationId: string, fileType: 'pdf' | 'jpeg'): string {
  // In a real implementation, this would generate an actual PDF/JPEG file
  // For now, we'll return a placeholder link
  return `/api/downloads/${applicationId}.${fileType}`;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session || !(session as Session & { user: { id?: string } }).user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to submit an application' },
        { status: 401 }
      )
    }
    
    console.log('Session data:', JSON.stringify(session, null, 2));
    
    const typedSessionUser = (session as Session & { user: SessionUser }).user;
    
    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Validate input
    const validatedData = applicationSchema.safeParse(body)
    
    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: validatedData.error.flatten(),
          message: 'Please check your form data and try again'
        },
        { status: 400 }
      )
    }
    
    // Check if service exists
    const service = await Service.findById(validatedData.data.service)
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found', message: 'The selected service could not be found' },
        { status: 404 }
      )
    }
    
    // Process file uploads in formData
    const processedFormData = { ...validatedData.data.formData }
    
    // Create application with automatic approval and download links for free service
    const application = new Application({
      ...validatedData.data,
      formData: processedFormData,
      applicant: typedSessionUser.id,
      status: 'approved', // Automatically approve for free service
      processedAt: new Date(), // Process immediately
      downloadStatus: 'ready', // Ready for immediate download
      downloadLinks: {
        pdf: generateDownloadLink(validatedData.data.service, 'pdf'),
        jpeg: generateDownloadLink(validatedData.data.service, 'jpeg')
      }
    })
    
    console.log('Application object to save:', JSON.stringify(application, null, 2));
    
    await application.save()
    
    // Send notification to the user about their application status
    await sendApplicationStatusUpdate(
      typedSessionUser.id,
      application._id.toString(),
      'approved'
    )
    
    // Populate for response
    await application.populate([
      { path: 'service', select: 'name' },
      { path: 'applicant', select: 'name email' }
    ])
    
    const appResponse: ApplicationType = {
      _id: application._id.toString(),
      service: (application as any).service,
      applicant: (application as any).applicant,
      status: application.status,
      formData: application.formData,
      assignedTo: (application as any).assignedTo,
      remarks: application.remarks,
      submittedAt: application.submittedAt,
      processedAt: application.processedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    }
    
    return NextResponse.json(appResponse, { status: 201 })
  } catch (error: any) {
    console.error('Error creating application:', error)
    
    // Provide more specific error messages
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          message: 'Please check your form data and try again',
          details: error.message 
        },
        { status: 400 }
      )
    }
    
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return NextResponse.json(
        { 
          error: 'Duplicate entry', 
          message: 'An application with this data already exists' 
        },
        { status: 409 }
      )
    }
    
    // Log the full error for debugging
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'Failed to submit application. Please try again later.',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
