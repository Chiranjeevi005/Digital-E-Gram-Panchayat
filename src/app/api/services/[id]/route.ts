import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Service from '@/models/Service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { Session } from 'next-auth'

// Validation schema
const serviceSchema = z.object({
  name: z.string().min(1, { message: 'Service name is required' }).optional(),
  description: z.string().min(1, { message: 'Description is required' }).optional(),
  requirements: z.array(z.string()).optional(),
  processingTime: z.number().min(1, { message: 'Processing time must be at least 1 day' }).optional(),
  isActive: z.boolean().optional(),
})

interface ServiceType {
  _id: string
  name: string
  description: string
  requirements: string[]
  processingTime: number
  isActive: boolean
  createdBy: {
    _id: string
    name: string
  }
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
    
    const service: any = await Service.findById(params.id).populate('createdBy', 'name')
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }
    
    const serviceResponse: ServiceType = {
      _id: service._id.toString(),
      name: service.name,
      description: service.description,
      requirements: service.requirements,
      processingTime: service.processingTime,
      isActive: service.isActive,
      createdBy: service.createdBy,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }
    
    return NextResponse.json(serviceResponse)
  } catch (error: any) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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
    
    // Check if user is authenticated and is an officer
    if (!session || !(session as Session & { user: { id?: string } }).user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const typedSessionUser = (session as Session & { user: SessionUser }).user;
    
    if (typedSessionUser.role !== 'officer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validate input
    const validatedData = serviceSchema.safeParse(body)
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validatedData.error.flatten() },
        { status: 400 }
      )
    }
    
    const service: any = await Service.findByIdAndUpdate(
      params.id,
      validatedData.data,
      { new: true }
    )
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }
    
    const serviceResponse: ServiceType = {
      _id: service._id.toString(),
      name: service.name,
      description: service.description,
      requirements: service.requirements,
      processingTime: service.processingTime,
      isActive: service.isActive,
      createdBy: service.createdBy,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }
    
    return NextResponse.json(serviceResponse)
  } catch (error: any) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and is an officer
    if (!session || !(session as Session & { user: { id?: string } }).user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const typedSessionUser = (session as Session & { user: SessionUser }).user;
    
    if (typedSessionUser.role !== 'officer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const service = await Service.findByIdAndDelete(params.id)
    
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}