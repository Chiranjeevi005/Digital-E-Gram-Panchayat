'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Card from '@/components/Card'
import Badge from '@/components/Badge'
import SkeletonLoader from '@/components/SkeletonLoader'

interface ServiceType {
  _id: string
  name: string
  description: string
  requirements: string[]
  processingTime: number
  isActive: boolean
  category?: string
}

// Define the props type to match Next.js expectations
interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<any>
}

export default function ServiceDetail({ params }: PageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [service, setService] = useState<ServiceType | null>(null)
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
          setError('Invalid service ID')
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
        setError(data.error || 'Failed to load service details')
      }
    } catch (error: any) {
      console.error('Error fetching service:', error)
      setError('Failed to load service details. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4 animate-pulse"></div>
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
          <h1 className="text-3xl font-heading font-bold text-neutral-900">Service Details</h1>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h2 className="text-2xl font-heading font-bold text-neutral-900">
                    {service?.name}
                  </h2>
                  <Badge variant={service?.isActive ? 'approved' : 'rejected'}>
                    {service?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-neutral-600">
                  {service?.description}
                </p>
              </div>
              
              <button
                onClick={() => router.push(`/user/services/${service?._id}/apply`)}
                disabled={!service?.isActive}
                className={`btn-primary ${!service?.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Apply Now
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-neutral-50 rounded-lg p-6">
                <h3 className="font-heading font-semibold text-lg text-neutral-900 mb-4">Processing Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Processing Time</span>
                    <span className="font-medium">{service?.processingTime} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Cost</span>
                    <span className="font-medium text-green-600">Free of Charge</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-neutral-50 rounded-lg p-6">
                <h3 className="font-heading font-semibold text-lg text-neutral-900 mb-4">Requirements</h3>
                {service?.requirements && service.requirements.length > 0 ? (
                  <ul className="space-y-2">
                    {service.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-neutral-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-600">No specific requirements listed.</p>
                )}
              </div>
            </div>
            
            {service?.category && (
              <div className="mb-6">
                <h3 className="font-heading font-semibold text-lg text-neutral-900 mb-3">Category</h3>
                <span className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                  {service.category}
                </span>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}