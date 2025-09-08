import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Service from '@/models/Service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { Session } from 'next-auth'

// Validation schema
const serviceSchema = z.object({
  name: z.string().min(1, { message: 'Service name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  requirements: z.array(z.string()).optional(),
  processingTime: z.number().min(1, { message: 'Processing time must be at least 1 day' }),
  isActive: z.boolean().optional(),
})

interface ServiceType {
  _id: string
  name: string
  description: string
  requirements: string[]
  processingTime: number
  isActive: boolean
  category?: string
  createdBy: string // Changed from object to string
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

export async function GET(_request: NextRequest) {
  try {
    await dbConnect()
    
    // Removed populate to avoid schema issues
    const services: any = await Service.find({ isActive: true })
    
    const serviceResponse: ServiceType[] = services.map((service: any) => ({
      _id: service._id.toString(),
      name: service.name,
      description: service.description,
      requirements: service.requirements,
      processingTime: service.processingTime,
      isActive: service.isActive,
      category: service.category,
      createdBy: service.createdBy.toString(), // Convert to string
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }))
    
    return NextResponse.json(serviceResponse)
  } catch (error: any) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and is an admin (changed from officer)
    if (!session || !(session as Session & { user: { id?: string } }).user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const typedSessionUser = (session as Session & { user: SessionUser }).user;
    
    // Changed from 'officer' to 'admin'
    if (typedSessionUser.role !== 'admin') {
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
    
    // Create service
    const service = new Service({
      ...validatedData.data,
      createdBy: typedSessionUser.id,
    })
    
    await service.save()
    
    const serviceResponse: ServiceType = {
      _id: service._id.toString(),
      name: service.name,
      description: service.description,
      requirements: service.requirements,
      processingTime: service.processingTime,
      isActive: service.isActive,
      category: service.category,
      createdBy: service.createdBy.toString(), // Convert to string
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }
    
    return NextResponse.json(serviceResponse, { status: 201 })
  } catch (error: any) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}