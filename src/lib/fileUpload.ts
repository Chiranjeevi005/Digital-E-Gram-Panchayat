import { v2 as cloudinary } from 'cloudinary'
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'
import { createSignedUrl } from './security'

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
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not properly configured. Please check environment variables.')
  }
  
  // Configure Cloudinary on each call to ensure fresh configuration
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
  
  // Determine the correct resource type based on file extension
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  let resourceType: 'image' | 'raw' | 'auto' = 'auto';
  
  // For PDF files, we should use 'raw' to prevent image transformations
  if (fileExtension === '.pdf') {
    resourceType = 'raw'; // Use 'raw' for PDF files to prevent transformations
  }
  
  // Use a simpler approach without streams to avoid worker issues
  try {
    const result = await cloudinary.uploader.upload(
      `data:${getFileMimeType(fileName)};base64,${fileBuffer.toString('base64')}`,
      {
        folder: folder,
        public_id: fileName,
        resource_type: resourceType, // Use the determined resource type
        overwrite: false,
        unique_filename: true,
        // Add security transformations for images only (not PDFs)
        transformation: fileExtension !== '.pdf' ? {
          quality: 'auto',
          fetch_format: 'auto'
        } : undefined
      }
    );
    
    return result;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Cloudinary upload failed: ${error.message || error}`);
  }
}

/**
 * Get MIME type based on file extension
 * @param fileName - The file name
 * @returns The MIME type
 */
function getFileMimeType(fileName: string): string {
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @returns Promise with deletion result
 */
export async function deleteFileFromCloudinary(publicId: string): Promise<any> {
  // Check if Cloudinary is configured
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not properly configured. Please check environment variables.')
  }
  
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
}

/**
 * Get file URL from Cloudinary public ID with signed URL
 * @param publicId - The public ID of the file
 * @param expiresIn - Expiration time in milliseconds (default 1 hour)
 * @returns The signed URL of the file
 */
export function getSignedFileUrl(publicId: string, expiresIn: number = 3600000): string {
  // Check if Cloudinary is configured
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not properly configured. Please check environment variables.')
  }
  
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
  
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
  // Check if Cloudinary is configured
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not properly configured. Please check environment variables.')
  }
  
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
  
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