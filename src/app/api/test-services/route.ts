import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Service from '@/models/Service'

export async function GET(_request: NextRequest) {
  try {
    await dbConnect()
    
    // Fetch all services without populate
    const services: any = await Service.find({ isActive: true })
    
    const serviceResponse = services.map((service: any) => ({
      _id: service._id.toString(),
      name: service.name,
      description: service.description,
      requirements: service.requirements,
      processingTime: service.processingTime,
      isActive: service.isActive,
      category: service.category,
      createdBy: service.createdBy.toString(),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }))
    
    return NextResponse.json({
      success: true,
      count: serviceResponse.length,
      services: serviceResponse
    })
  } catch (error: any) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    )
  }
}