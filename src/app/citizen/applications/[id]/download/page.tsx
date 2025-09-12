'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Card from '@/components/Card'
import Button from '@/components/Button'
import ProgressBar from '@/components/ProgressBar'
import { showNotification } from '@/lib/documentGenerator'
import { sendUserNotification } from '@/lib/notificationUtils'
import { generatePDF, generateJPG, downloadBlob } from '@/lib/documentGenerator'

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
  submittedAt: string
  processedAt?: string
  createdAt: string
  updatedAt: string
}

interface DownloadState {
  status: 'waiting' | 'approved' | 'downloading' | 'completed' | 'error'
  progress: number
  message: string
  trackingId?: string
}

// Define the props type to match Next.js expectations
interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<any>
}

export default function DownloadProcessingPage({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [application, setApplication] = useState<ApplicationType | null>(null)
  const [downloadState, setDownloadState] = useState<DownloadState>({
    status: 'waiting',
    progress: 0,
    message: 'Your application is being processed. Please wait 10 seconds...'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
        }
      }
    }
    
    resolveParams()
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && resolvedParams?.id) {
      fetchApplication()
    }
  }, [session, status, router, resolvedParams])

  const fetchApplication = async () => {
    if (!resolvedParams?.id) return
    
    try {
      const response = await fetch(`/api/applications/${resolvedParams.id}`)
      const data = await response.json()
      if (response.ok) {
        setApplication(data)
        // Start the approval simulation
        simulateApprovalProcess()
      } else {
        if (response.status === 401) {
          setError('You are not authorized to view this application.')
        } else if (response.status === 404) {
          setError('Application not found.')
        } else {
          // Provide more specific error information
          setError(data.error || data.details || 'Failed to load application details')
        }
      }
    } catch (error: any) {
      console.error('Error fetching application:', error)
      setError('Failed to load application details. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const simulateApprovalProcess = () => {
    // Simulate waiting period
    const interval = setInterval(() => {
      setDownloadState(prev => {
        const newProgress = Math.min(prev.progress + 10, 90)
        return {
          ...prev,
          progress: newProgress,
          message: newProgress < 90 
            ? `Your application is being processed. Please wait ${Math.ceil((100 - newProgress) / 10)} seconds...` 
            : 'Almost there...'
        }
      })
    }, 1000)

    // After 10 seconds, simulate approval
    setTimeout(() => {
      clearInterval(interval)
      setDownloadState({
        status: 'approved',
        progress: 100,
        message: 'Application Approved ✅',
        trackingId: `TRK-${Math.floor(100000 + Math.random() * 900000)}`
      })
    }, 10000)
  }

  const handleDownload = async (fileType: 'pdf' | 'jpeg') => {
    if (!application || !resolvedParams) return;

    try {
      setDownloadState(prev => ({
        ...prev,
        status: 'downloading',
        progress: 0,
        message: 'Generating document...'
      }))

      // Simulate document generation progress
      const progressInterval = setInterval(() => {
        setDownloadState(prev => {
          const newProgress = Math.min(prev.progress + 20, 90)
          return {
            ...prev,
            progress: newProgress,
            message: newProgress < 90 
              ? `Generating ${fileType.toUpperCase()}... ${newProgress}%` 
              : 'Finalizing document...'
          }
        })
      }, 300)

      // Generate the document
      setTimeout(async () => {
        clearInterval(progressInterval)
        
        try {
          let blob: Blob;
          
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
          
          // Complete progress bar
          setDownloadState(prev => ({
            ...prev,
            progress: 100,
            message: 'Download ready!'
          }))
          
          // Small delay to show completion
          setTimeout(() => {
            // Download the file
            const filename = `GramPanchayat_${application.service.name.replace(/\s+/g, '_')}.${fileType}`
            downloadBlob(blob, filename)
            
            // Show success notification
            showNotification(`Your ${fileType.toUpperCase()} file has been downloaded successfully 🎉`)
            sendUserNotification(
              `Download completed: ${application.service.name} (${fileType.toUpperCase()})`,
              'success'
            )
            
            // Update state to completed
            setDownloadState(prev => ({
              ...prev,
              status: 'completed',
              message: 'Your file has been downloaded successfully 🎉'
            }))
            
            // Record download in history
            fetch('/api/downloads', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                applicationId: resolvedParams.id,
                fileType
              })
            }).catch(err => {
              console.error('Failed to record download:', err)
            })
          }, 500)
        } catch (err: any) {
          console.error('Document generation error:', err)
          throw new Error(err.message || 'Failed to generate document')
        }
      }, 2000)
    } catch (err: any) {
      console.error('Download error:', err)
      setDownloadState(prev => ({
        ...prev,
        status: 'error',
        message: 'Download failed. Please try again.'
      }))
      showNotification('Error downloading document. Please try again.')
    }
  }

  const copyTrackingId = () => {
    if (downloadState.trackingId) {
      navigator.clipboard.writeText(downloadState.trackingId)
      showNotification('Tracking ID copied to clipboard!')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex justify-center items-center h-screen">Loading...</div>
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
              onClick={() => router.push('/citizen/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </Card>
        </div>
      </div>
    )
  }

  // Update all references to params.id to use resolvedParams.id
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Navbar />
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900">Document Download</h1>
        </div>
      </div>

      <main className="flex-grow max-w-3xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <div className="text-center mb-8">
              <h2 className="text-xl font-heading font-bold text-neutral-900 mb-2">
                {application?.service.name}
              </h2>
              <p className="text-neutral-600">
                Application ID: {application?._id.substring(0, 8)}
              </p>
            </div>

            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">
                  {downloadState.message}
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  {downloadState.progress}%
                </span>
              </div>
              <ProgressBar value={downloadState.progress} max={100} />
            </div>

            {downloadState.status === 'waiting' && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-neutral-600">Please wait while we process your application</p>
              </div>
            )}

            {downloadState.status === 'approved' && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Application Approved ✅</h3>
                <p className="text-neutral-600 mb-6">Your document is ready for download</p>
                
                {downloadState.trackingId && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700">Tracking ID</p>
                        <p className="font-mono text-blue-900">{downloadState.trackingId}</p>
                      </div>
                      <button
                        onClick={copyTrackingId}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-neutral-50 rounded-lg p-6 mb-6">
                  <h4 className="font-heading font-semibold text-neutral-900 mb-4">Download Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="primary"
                      onClick={() => handleDownload('pdf')}
                      className="flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Download PDF 📄
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDownload('jpeg')}
                      className="flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      Download JPG 🖼️
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {downloadState.status === 'downloading' && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Downloading...</h3>
                <p className="text-neutral-600 mb-4">{downloadState.message}</p>
                <ProgressBar value={downloadState.progress} max={100} />
              </div>
            )}

            {downloadState.status === 'completed' && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Download Complete! 🎉</h3>
                <p className="text-neutral-600 mb-6">{downloadState.message}</p>
                <Button
                  variant="primary"
                  onClick={() => router.push('/citizen/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            )}

            {downloadState.status === 'error' && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Download Failed</h3>
                <p className="text-neutral-600 mb-6">{downloadState.message}</p>
                <div className="flex justify-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/citizen/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setDownloadState({
                      status: 'approved',
                      progress: 100,
                      message: 'Application Approved ✅',
                      trackingId: downloadState.trackingId
                    })}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}