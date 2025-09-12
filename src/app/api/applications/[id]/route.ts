import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Application from '@/models/Application'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { sendApplicationStatusUpdate } from '@/lib/notificationService'
import { Session } from 'next-auth'

// Validation schema for status update
const statusUpdateSchema = z.object({
  status: z.enum(['in-progress', 'approved', 'rejected']).optional(),
  remarks: z.string().optional(),
  assignedTo: z.string().optional(),
  formData: z.record(z.string(), z.any()).optional()
})

interface ApplicationType {
  _id: string
  service: {
    _id: string
    name: string
    description: string
    processingTime: number
  }
  applicant: {
    _id: string
    name: string
    email: string
  }
  status: 'pending' | 'in-progress' | 'approved' | 'rejected'
  formData: Record<string, any>
  assignedTo?: {
    _id: string
    name: string
  }
  remarks?: string
  // Download-related fields
  processingTime: number
  downloadStatus?: 'pending' | 'processing' | 'ready' | 'completed'
  downloadLinks?: {
    pdf?: string
    jpeg?: string
  }
  submittedAt: string
  processedAt?: string
  createdAt: string
  updatedAt: string
}

type SessionUser = {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function GET(
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
    
    const application: any = await Application.findById(params.id)
      .populate('service', 'name description processingTime')
      .populate('applicant', 'name email')
      .populate('assignedTo', 'name')
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Check permissions
    // Normalize role checking to handle both old and new role names
    const isCitizen = typedSessionUser.role === 'user' || typedSessionUser.role === 'citizen' || typedSessionUser.role === 'Citizens';
    const isStaff = typedSessionUser.role === 'staff' || typedSessionUser.role === 'Staff';
    const isOfficer = typedSessionUser.role === 'officer' || typedSessionUser.role === 'Officer';
    
    if (isCitizen && application.applicant && application.applicant._id.toString() !== typedSessionUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (isStaff && application.assignedTo && application.assignedTo.toString() !== typedSessionUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Ensure applicant exists before accessing its properties
    const applicantData = application.applicant ? {
      _id: application.applicant._id.toString(),
      name: application.applicant.name,
      email: application.applicant.email
    } : {
      _id: '',
      name: 'Unknown User',
      email: 'unknown@example.com'
    };
    
    const appResponse: ApplicationType = {
      _id: application._id.toString(),
      service: application.service,
      applicant: applicantData,
      status: application.status,
      formData: application.formData,
      assignedTo: application.assignedTo,
      remarks: application.remarks,
      // Download-related fields
      processingTime: application.processingTime,
      downloadStatus: application.downloadStatus,
      downloadLinks: application.downloadLinks,
      submittedAt: application.submittedAt,
      processedAt: application.processedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    }
    
    return NextResponse.json(appResponse)
  } catch (error: any) {
    console.error('Error fetching application:', error)
    // Return a more specific error message
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid application ID format' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

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
    
    const body = await request.json()
    
    // Validate input
    const validatedData = statusUpdateSchema.safeParse(body)
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }
    
    const application: any = await Application.findById(params.id)
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Store the previous status for comparison
    const previousStatus = application.status;
    
    // Check permissions and update based on role
    // Normalize role checking to handle both old and new role names
    const isCitizen = typedSessionUser.role === 'user' || typedSessionUser.role === 'citizen' || typedSessionUser.role === 'Citizens';
    const isStaff = typedSessionUser.role === 'staff' || typedSessionUser.role === 'Staff';
    const isOfficer = typedSessionUser.role === 'officer' || typedSessionUser.role === 'Officer';
    
    if (isCitizen) {
      // Users can only update their own applications if still pending
      if (application.applicant._id.toString() !== typedSessionUser.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      if (application.status !== 'pending') {
        return NextResponse.json(
          { error: 'Cannot update application that is not pending' },
          { status: 400 }
        )
      }
      
      // Users can only update form data
      if (validatedData.data.formData) {
        Object.assign(application.formData, validatedData.data.formData)
      }
    } else if (isStaff) {
      // Staff can update status if application is assigned to them
      if (!application.assignedTo || application.assignedTo.toString() !== typedSessionUser.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      // Update status and remarks
      if (validatedData.data.status) {
        application.status = validatedData.data.status
      }
      
      if (validatedData.data.remarks) {
        application.remarks = validatedData.data.remarks
      }
      
      if (validatedData.data.status && validatedData.data.status !== 'in-progress') {
        application.processedAt = new Date()
      }
    } else if (isOfficer) {
      // Officers can update anything
      if (validatedData.data.status) {
        application.status = validatedData.data.status
      }
      
      if (validatedData.data.remarks) {
        application.remarks = validatedData.data.remarks
      }
      
      if (validatedData.data.assignedTo) {
        application.assignedTo = validatedData.data.assignedTo
      }
      
      if (validatedData.data.status && validatedData.data.status !== 'in-progress') {
        application.processedAt = new Date()
      }
    } else {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    await application.save()
    
    // Send notification if status has changed
    if (validatedData.data.status && validatedData.data.status !== previousStatus) {
      await sendApplicationStatusUpdate(
        application.applicant._id.toString(),
        application._id.toString(),
        validatedData.data.status
      )
    }
    
    // Populate for response
    await application.populate([
      { path: 'service', select: 'name description processingTime' },
      { path: 'applicant', select: 'name email' },
      { path: 'assignedTo', select: 'name' }
    ])

    const appResponse: ApplicationType = {
      _id: application._id.toString(),
      service: application.service,
      applicant: application.applicant,
      status: application.status,
      formData: application.formData,
      assignedTo: application.assignedTo,
      remarks: application.remarks,
      // Download-related fields
      processingTime: application.processingTime,
      downloadStatus: application.downloadStatus,
      downloadLinks: application.downloadLinks,
      submittedAt: application.submittedAt,
      processedAt: application.processedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };

    return NextResponse.json(appResponse)
  } catch (error: any) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}