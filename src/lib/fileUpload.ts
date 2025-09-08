import { v2 as cloudinary } from 'cloudinary'
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'
import { createSignedUrl } from './security'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

/**
 * Validate file before upload
 * @param fileBuffer - The file buffer to validate
 * @param fileName - The original file name
 * @param mimeType - The MIME type of the file
 * @returns Boolean indicating if the file is valid
 */
export function validateFile(fileBuffer: Buffer, fileName: string, mimeType: string): boolean {
  // Check file size
  if (fileBuffer.length > MAX_FILE_SIZE) {
    return false;
  }
  
  // Check MIME type
  if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
    return false;
  }
  
  // Check file extension
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
    return false;
  }
  
  return true;
}

/**
 * Upload a file to Cloudinary
 * @param fileBuffer - The file buffer to upload
 * @param fileName - The original file name
 * @param folder - The folder to upload to in Cloudinary
 * @returns Promise with upload result or error
 */
export async function uploadFileToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'digital_e_panchayat'
): Promise<UploadApiResponse | UploadApiErrorResponse> {
  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not properly configured')
  }
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: fileName,
        resource_type: 'auto',
        overwrite: false,
        unique_filename: true,
        // Add security transformations
        transformation: {
          quality: 'auto',
          fetch_format: 'auto'
        }
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          reject(new Error(`Cloudinary upload failed: ${error.message}`))
        } else {
          resolve(result!)
        }
      }
    )
    
    uploadStream.end(fileBuffer)
  })
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @returns Promise with deletion result
 */
export async function deleteFileFromCloudinary(publicId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
  })
}

/**
 * Get file URL from Cloudinary public ID with signed URL
 * @param publicId - The public ID of the file
 * @param expiresIn - Expiration time in milliseconds (default 1 hour)
 * @returns The signed URL of the file
 */
export function getSignedFileUrl(publicId: string, expiresIn: number = 3600000): string {
  // Create a signed URL for secure access
  const signedUrl = createSignedUrl(publicId, expiresIn);
  return signedUrl.url;
}

/**
 * Get file URL from Cloudinary public ID (public access)
 * @param publicId - The public ID of the file
 * @returns The URL of the file
 */
export function getFileUrl(publicId: string): string {
  return cloudinary.url(publicId)
}

/**
 * Simulate virus scanning (in production, integrate with ClamAV or similar)
 * @param fileBuffer - The file buffer to scan
 * @returns Promise indicating if file is clean
 */
export async function scanFileForViruses(fileBuffer: Buffer): Promise<boolean> {
  // In production, integrate with ClamAV or a cloud-based virus scanning service
  // This is a placeholder implementation
  console.warn('Virus scanning not implemented - implement ClamAV integration in production');
  
  // Simulate scanning delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return true to indicate file is clean (placeholder)
  return true;
}