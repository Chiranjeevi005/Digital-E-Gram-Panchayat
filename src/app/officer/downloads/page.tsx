'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Form from '@/components/Form'
import Button from '@/components/Button'
import SkeletonLoader from '@/components/SkeletonLoader'

interface ServiceType {
  _id: string
  name: string
  category?: string
  processingTime: number
}

export default function DownloadManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<ServiceType | null>(null)
  const [formData, setFormData] = useState({
    processingTime: 0 // Immediate processing
  })

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role !== 'officer') {
      router.push(`/${session.user.role}/dashboard`)
    } else if (session?.user) {
      fetchServices()
    }
  }, [session, status, router])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      if (response.ok) {
        setServices(data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (service: ServiceType) => {
    setEditingService(service)
    setFormData({
      processingTime: 0 // Immediate processing
    })
  }

  const handleSave = async () => {
    if (!editingService) return;
    
    try {
      // Update local state to reflect free service
      setServices(services.map(service => 
        service._id === editingService._id 
          ? { 
              ...service, 
              processingTime: 0 // Immediate processing
            } 
          : service
      ))
      
      setEditingService(null)
      alert('Service updated successfully! All services are now free.')
    } catch (error) {
      console.error('Error updating service:', error)
      alert('Error updating service. Please try again.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex">
          <Sidebar role="Officer" />
          <div className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
            <div className="px-4 py-6 sm:px-0">
              <div className="mb-8">
                <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4 animate-pulse"></div>
              </div>
              <SkeletonLoader type="table" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Navbar />
      
      <div className="flex-grow flex">
        <Sidebar role="Officer" />
        
        <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-2xl font-heading font-bold text-neutral-900">Service Management</h1>
              <p className="text-neutral-600 mt-1">Manage service settings and download options</p>
            </div>
            
            {editingService ? (
              <Card>
                <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
                  Edit {editingService.name}
                </h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-yellow-700">
                      <span className="font-semibold">Free Service Policy:</span> All services are completely free for citizens. 
                      Processing time is immediate for all downloads.
                    </p>
                  </div>
                </div>
                
                <Form onSubmit={(e) => {
                  e.preventDefault()
                  handleSave()
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Form.Field label="Processing Time (days)">
                      <input
                        type="number"
                        value={0} // Immediate processing
                        readOnly
                        className="w-full rounded-md border-neutral-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <p className="mt-1 text-sm text-green-600">Immediate processing</p>
                    </Form.Field>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => setEditingService(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                    >
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </Card>
            ) : (
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-heading font-semibold text-gray-900">Service Download Settings</h2>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-700">
                      <span className="font-semibold">Free Service:</span> All services are completely free for citizens. 
                      Documents are available for immediate download after application approval.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <SkeletonLoader type="table" />
                ) : (
                  <Table>
                    <Table.Head>
                      <Table.HeadCell>Service</Table.HeadCell>
                      <Table.HeadCell>Category</Table.HeadCell>
                      <Table.HeadCell>Processing Time</Table.HeadCell>
                      <Table.HeadCell>Actions</Table.HeadCell>
                    </Table.Head>
                    <Table.Body>
                      {services.map((service) => (
                        <Table.Row key={service._id}>
                          <Table.Cell className="font-medium text-neutral-900">
                            {service.name}
                          </Table.Cell>
                          <Table.Cell>
                            {service.category || 'N/A'}
                          </Table.Cell>
                          <Table.Cell>
                            {service.processingTime || 0} days
                            <span className="ml-1 text-xs text-green-600">(Immediate)</span>
                          </Table.Cell>
                          <Table.Cell>
                            <button
                              onClick={() => handleEdit(service)}
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                              Edit
                            </button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}