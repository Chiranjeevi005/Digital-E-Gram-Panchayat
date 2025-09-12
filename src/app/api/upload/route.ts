import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFileToCloudinary } from '@/lib/fileUpload'
import dbConnect from '@/lib/dbConnect'
import { Session } from 'next-auth'

type SessionUser = {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as Session & { user: { id?: string } }).user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to upload files' },
        { status: 401 }
      )
    }
    
    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fieldName = formData.get('fieldName') as string
    const applicationId = formData.get('applicationId') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided: Please select a file to upload' },
        { status: 400 }
      )
    }
    
    // Log file details for debugging
    console.log(`File upload attempt - Name: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);
    
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: Only JPEG, PNG, and PDF files are allowed. Received: ${file.type}` },
        { status: 400 }
      )
    }
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large: File size exceeds 5MB limit' },
        { status: 400 }
      )
    }
    
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary environment variables are not set')
      return NextResponse.json(
        { error: 'File upload service is not configured properly. Please contact the administrator.' },
        { status: 500 }
      )
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Upload to Cloudinary
    const folder = `digital_e_panchayat/applications/${applicationId}`
    const fileName = `${fieldName}_${Date.now()}_${file.name}`
    
    try {
      console.log(`Uploading file: ${file.name} (${file.type}) with size ${file.size} bytes to folder: ${folder}`);
      const uploadResult = await uploadFileToCloudinary(buffer, fileName, folder)
      console.log('Upload successful:', uploadResult.secure_url)
      
      // Return the file URL and public ID
      return NextResponse.json({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fieldName: fieldName
      })
    } catch (uploadError: any) {
      console.error('Error uploading file to Cloudinary:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message || 'Unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error uploading file:', error)
    
    // Provide more specific error messages
    if (error.message && error.message.includes('Cloudinary')) {
      return NextResponse.json(
        { error: 'Cloudinary service error: Please contact the administrator' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: `Internal server error: ${error.message || 'Failed to upload file'}` },
      { status: 500 }
    )
  }
}