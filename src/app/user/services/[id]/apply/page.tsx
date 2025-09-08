'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Card from '@/components/Card'
import SkeletonLoader from '@/components/SkeletonLoader'
import ApplicationFormWizard from '@/components/ApplicationFormWizard'

interface ServiceType {
  _id: string
  name: string
  description: string
  requirements: string[]
  processingTime: number
}

// Define the props type to match Next.js expectations
interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<any>
}

export default function ApplyService({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [service, setService] = useState<ServiceType | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
    } else if (session?.user && resolvedParams) {
      fetchService()
    }
  }, [session, status, router, resolvedParams])

  const fetchService = async () => {
    if (!resolvedParams) return
    
    try {
      const response = await fetch(`/api/services/${resolvedParams.id}`)
      const data = await response.json()
      if (response.ok) {
        setService(data)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      console.error('Error fetching service:', error)
      setError('Failed to load service details')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: Record<string, string | string[] | File | { url: string; publicId: string } | null>) => {
    if (!resolvedParams) return
    
    setSubmitting(true)
    setError('')

    try {
      // Prepare form data for submission
      const submissionData: Record<string, any> = {}
      
      // Handle file uploads and other data
      Object.keys(formData).forEach(key => {
        const value = formData[key]
        if (value instanceof File) {
          // For now, we'll just store the file name
          // In a real implementation, you would upload the file and store the URL
          submissionData[key] = value.name
        } else {
          submissionData[key] = value
        }
      })

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: resolvedParams.id,
          formData: submissionData
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      // Application created successfully
      router.push('/user/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
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
              onClick={() => router.push('/user/services')}
              className="btn-primary"
            >
              Back to Services
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
          <h1 className="text-3xl font-heading font-bold text-neutral-900">Apply for Service</h1>
          <p className="mt-2 text-neutral-600">{service?.name}</p>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          {service && (
            <ApplicationFormWizard
              service={service}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={error}
            />
          )}
        </div>
      </main>
    </div>
  )
}