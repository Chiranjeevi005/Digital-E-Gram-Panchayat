'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import SkeletonLoader from '@/components/SkeletonLoader'
import DownloadModal from '@/components/DownloadModal'
import FileViewer from '@/components/FileViewer'
import { generatePDF, generateJPG, downloadBlob, showNotification } from '@/lib/documentGenerator'
import { showDownloadCompletedNotification, showDownloadErrorNotification } from '@/lib/notificationUtils'

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

// Define the props type to match Next.js expectations
interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<any>
}

export default function ApplicationDetail({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [application, setApplication] = useState<ApplicationType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  // Resolve the promise params
  useEffect(() => {
    const resolveParams = async () => {
      if (params) {
        try {
          const resolved = await params
          setResolvedParams(resolved)
        } catch (err) {
          console.error('Error resolving params:', err)
          setError('Invalid application ID')
        }
      }
    }
    
    resolveParams()
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && resolvedParams) {
      fetchApplication()
    }
  }, [session, status, router, resolvedParams])

  const fetchApplication = async () => {
    if (!resolvedParams) return
    
    try {
      const response = await fetch(`/api/applications/${resolvedParams.id}`)
      const data = await response.json()
      if (response.ok) {
        setApplication(data)
      } else {
        // Handle specific error cases
        if (response.status === 401) {
          setError('You are not authorized to view this application. Please make sure you are logged in with the correct account.')
        } else if (response.status === 404) {
          setError('Application not found. The application may have been deleted or the ID is incorrect.')
        } else {
          setError(data.error || 'Failed to load application details')
        }
      }
    } catch (error: any) {
      console.error('Error fetching application:', error)
      setError('Failed to load application details. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (option: 'instant' | 'processing', fileType: 'pdf' | 'jpeg') => {
    try {
      if (!application) return

      // Generate the document based on fileType
      let blob: Blob
      // Updated filename to only include service name without applicant name
      const fileName = `GramPanchayat_${application.service.name.replace(/\s+/g, '_')}.${fileType}`

      if (fileType === 'pdf') {
        blob = await generatePDF(
          application.formData,
          application.service.name,
          application.applicant.name
        )
      } else {
        blob = await generateJPG(
          application.formData,
          application.service.name,
          application.applicant.name
        )
      }

      // Download the file
      downloadBlob(blob, fileName)

      // Update the application state to reflect the download
      setApplication({
        ...application,
        downloadStatus: 'completed'
      })

      // Show success notification
      await showDownloadCompletedNotification(application.service.name, fileType)
    } catch (err: any) {
      console.error('Download error:', err)
      
      // Show error notification
      await showDownloadErrorNotification()
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex justify-center items-center h-screen">Loading...</div>
      </div>
    )
  }

  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4 animate-pulse"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/3 animate-pulse"></div>
            </div>
            <SkeletonLoader type="card" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <div className="mx-auto bg-red-100 text-red-700 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Error</h3>
            <p className="text-neutral-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/user/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </Card>
        </div>
      </div>
    )
  }

  const isDownloadAvailable = application?.status === 'approved' && 
    (!application.downloadStatus || application.downloadStatus !== 'completed')

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Navbar />
      
      {showDownloadModal && application?.service && (
        <DownloadModal
          serviceName={application.service.name}
          onClose={() => setShowDownloadModal(false)}
          onDownload={handleDownload}
        />
      )}
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900">Application Details</h1>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-heading font-bold text-neutral-900">
                    {application?.service.name}
                  </h2>
                  <p className="text-neutral-600">
                    Submitted on {new Date(application?.submittedAt || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-600">Application ID</p>
                  <p className="font-mono text-neutral-900">{application?._id.substring(0, 8)}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge 
                  variant={
                    application?.status === 'approved' ? 'approved' :
                    application?.status === 'rejected' ? 'rejected' :
                    application?.status === 'in-progress' ? 'in-progress' : 'pending'
                  }
                >
                  {application?.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Pending'}
                </Badge>
                
                {application?.downloadStatus && (
                  <Badge 
                    variant={
                      application.downloadStatus === 'completed' ? 'completed' :
                      application.downloadStatus === 'ready' ? 'completed' :
                      application.downloadStatus === 'processing' ? 'processing' : 'pending'
                    }
                  >
                    {application.downloadStatus === 'ready' ? 'Ready for Download' : 
                     application.downloadStatus === 'completed' ? 'Downloaded' :
                     application.downloadStatus.charAt(0).toUpperCase() + application.downloadStatus.slice(1)}
                  </Badge>
                )}
                
                <Badge variant="completed">
                  Free Service
                </Badge>
              </div>
              
              {application?.remarks && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-800 mb-1">Remarks</h3>
                  <p className="text-blue-700">{application.remarks}</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-heading font-semibold text-neutral-900 mb-3">Applicant Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-neutral-600">Name</p>
                    <p className="text-neutral-900">{application?.applicant.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Email</p>
                    <p className="text-neutral-900">{application?.applicant.email}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-heading font-semibold text-neutral-900 mb-3">Service Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-neutral-600">Service</p>
                    <p className="text-neutral-900">{application?.service.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Processing Time</p>
                    <p className="text-neutral-900">Immediate</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="font-heading font-semibold text-neutral-900 mb-3">Application Data</h3>
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application?.formData && Object.entries(application.formData).map(([key, value]) => {
                    // Check if this is a file upload field
                    if (value && typeof value === 'object' && 'url' in value && 'publicId' in value) {
                      return (
                        <div key={key} className="col-span-1 md:col-span-2">
                          <FileViewer 
                            fileData={value as { url: string; publicId: string }} 
                            fieldName={key} 
                            label={key.replace(/([A-Z])/g, ' $1').trim()} 
                          />
                        </div>
                      )
                    }
                    
                    return (
                      <div key={key}>
                        <p className="text-sm text-neutral-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-neutral-900">
                          {Array.isArray(value) 
                            ? value.join(', ') 
                            : value instanceof File 
                              ? value.name 
                              : value || 'Not provided'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {isDownloadAvailable && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-green-800">Document Ready for Download</h3>
                    <p className="text-green-700 text-sm mt-1">
                      Your application has been approved and your document is ready for immediate download. 
                      All downloads are completely free of charge.
                    </p>
                    <button
                      onClick={() => setShowDownloadModal(true)}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download Document
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {application?.downloadStatus === 'completed' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-blue-800">Document Downloaded</h3>
                    <p className="text-blue-700 text-sm mt-1">
                      Your document has been downloaded successfully. You can download it again from your download history.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}