'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Card from '@/components/Card'
import StatusTracker from '@/components/StatusTracker'
import Form from '@/components/Form'
import FileViewer from '@/components/FileViewer'

interface ApplicationType {
  _id: string
  service: {
    name: string
    description: string
  }
  applicant: {
    name: string
    email: string
  }
  status: 'pending' | 'in-progress' | 'approved' | 'rejected'
  submittedAt: string
  updatedAt: string
  formData: Record<string, string>
  remarks?: string
}

// Define the props type to match Next.js expectations
interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<any>
}

export default function StaffApplicationDetail({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [application, setApplication] = useState<ApplicationType | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [remarks, setRemarks] = useState('')
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
        setRemarks(data.remarks || '')
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Error fetching application:', error)
      setError('Failed to load application details')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (newStatus: 'in-progress' | 'approved' | 'rejected') => {
    if (!resolvedParams) return
    
    setUpdating(true)
    setError('')

    try {
      const response = await fetch(`/api/applications/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          remarks
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setApplication(prev => prev ? { ...prev, status: newStatus, remarks } : null)
      } else {
        throw new Error(data.error || 'Failed to update application')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(false)
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
        <div className="flex justify-center items-center h-screen">Loading application details...</div>
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
              onClick={() => router.push('/staff/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Navbar />
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900">Application Details</h1>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-heading font-bold text-neutral-900">
                        {application?.service.name}
                      </h2>
                      <p className="text-neutral-600">
                        Submitted by {application?.applicant.name} on {new Date(application?.submittedAt || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600">Application ID</p>
                      <p className="font-mono text-neutral-900">{application?._id}</p>
                    </div>
                  </div>
                  
                  <StatusTracker status={application?.status || 'pending'} />
                </div>
                
                <div className="mb-8">
                  <h3 className="font-medium text-neutral-900 mb-4">Application Data</h3>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    {application?.formData && Object.keys(application.formData).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(application.formData).map(([key, value], index) => {
                          // Check if this is a file upload field
                          if (value && typeof value === 'object' && 'url' in value && 'publicId' in value) {
                            return (
                              <div key={index}>
                                <FileViewer 
                                  fileData={value as { url: string; publicId: string }} 
                                  fieldName={key} 
                                  label={key.replace(/([A-Z])/g, ' $1').trim()} 
                                />
                              </div>
                            )
                          }
                          
                          return (
                            <div key={index} className="flex justify-between">
                              <span className="text-neutral-600">{key}:</span>
                              <span className="font-medium text-neutral-900">{value}</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-neutral-500">No application data provided</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => router.push('/staff/dashboard')}
                    className="btn-secondary"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </Card>
            </div>
            
            <div>
              <Card title="Update Status">
                <Form onSubmit={(e) => e.preventDefault()}>
                  <Form.Field label="Remarks">
                    <Form.Textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={4}
                      placeholder="Add any remarks or notes about this application"
                    />
                  </Form.Field>
                  
                  <div className="flex flex-wrap gap-2 mt-6">
                    <button
                      onClick={() => updateApplicationStatus('in-progress')}
                      disabled={updating}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {updating ? 'Updating...' : 'Mark as In Progress'}
                    </button>
                    
                    <button
                      onClick={() => updateApplicationStatus('approved')}
                      disabled={updating}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {updating ? 'Updating...' : 'Approve'}
                    </button>
                    
                    <button
                      onClick={() => updateApplicationStatus('rejected')}
                      disabled={updating}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {updating ? 'Updating...' : 'Reject'}
                    </button>
                  </div>
                  
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                </Form>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}