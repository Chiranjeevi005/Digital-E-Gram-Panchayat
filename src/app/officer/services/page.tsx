'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import SearchBar from '@/components/SearchBar'
import Modal from '@/components/Modal'
import Form from '@/components/Form'
import Button from '@/components/Button'
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

export default function OfficerServices() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<ServiceType[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requirements: '',
    processingTime: '',
    category: '',
    isActive: true
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && (session.user as any).role !== 'officer') {
      router.push(`/${(session.user as any).role}/dashboard`)
    } else if (session?.user) {
      fetchServices()
    }
  }, [session, status, router])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      if (response.ok) {
        setServices(data.sort((a: ServiceType, b: ServiceType) => a.name.localeCompare(b.name)))
        setFilteredServices(data.sort((a: ServiceType, b: ServiceType) => a.name.localeCompare(b.name)))
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterServices(query, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterServices(searchQuery, status)
  }

  const filterServices = (query: string, status: string) => {
    let result = services

    // Apply search filter
    if (query) {
      const lowerQuery = query.toLowerCase()
      result = result.filter(service =>
        service.name.toLowerCase().includes(lowerQuery) ||
        service.description.toLowerCase().includes(lowerQuery) ||
        (service.category && service.category.toLowerCase().includes(lowerQuery))
      )
    }

    // Apply status filter
    if (status !== 'all') {
      result = result.filter(service => 
        status === 'active' ? service.isActive : !service.isActive
      )
    }

    setFilteredServices(result.sort((a: ServiceType, b: ServiceType) => a.name.localeCompare(b.name)))
  }

  const handleEditService = (service: ServiceType) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      requirements: service.requirements.join(', '),
      processingTime: service.processingTime.toString(),
      category: service.category || '',
      isActive: service.isActive
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the service from the local state
        setServices(prev => prev.filter(service => service._id !== serviceId))
        setFilteredServices(prev => prev.filter(service => service._id !== serviceId))
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete service')
      }
    } catch (error: any) {
      console.error('Error deleting service:', error)
      alert('Failed to delete service: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    // Validate form
    if (!formData.name.trim()) {
      setFormError('Service name is required')
      return
    }

    if (!formData.description.trim()) {
      setFormError('Service description is required')
      return
    }

    if (!formData.processingTime || parseInt(formData.processingTime) <= 0) {
      setFormError('Processing time must be a positive number')
      return
    }

    try {
      const method = editingService ? 'PUT' : 'POST'
      const url = editingService ? `/api/services/${editingService._id}` : '/api/services'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
          processingTime: parseInt(formData.processingTime),
          category: formData.category,
          isActive: formData.isActive
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update the local state
        if (editingService) {
          setServices(prev =>
            prev.map(service =>
              service._id === editingService._id
                ? {
                    ...service,
                    name: data.name,
                    description: data.description,
                    requirements: data.requirements,
                    processingTime: data.processingTime,
                    category: data.category,
                    isActive: data.isActive
                  }
                : service
            )
          )
          setFilteredServices(prev =>
            prev.map(service =>
              service._id === editingService._id
                ? {
                    ...service,
                    name: data.name,
                    description: data.description,
                    requirements: data.requirements,
                    processingTime: data.processingTime,
                    category: data.category,
                    isActive: data.isActive
                  }
                : service
            )
          )
        } else {
          setServices(prev => [...prev, data])
          setFilteredServices(prev => [...prev, data])
        }

        // Close modal and reset form
        setIsModalOpen(false)
        setEditingService(null)
        setFormData({
          name: '',
          description: '',
          requirements: '',
          processingTime: '',
          category: '',
          isActive: true
        })
      } else {
        throw new Error(data.error || 'Failed to save service')
      }
    } catch (error: any) {
      console.error('Error saving service:', error)
      setFormError(error.message || 'Failed to save service')
    }
  }

  const getActiveServiceCount = () => {
    return services.filter(service => service.isActive).length
  }

  const getInactiveServiceCount = () => {
    return services.filter(service => !service.isActive).length
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Navbar />
      
      <div className="flex-grow flex">
        <Sidebar role="Officer" />
        
        <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-heading font-bold text-neutral-900">Service Management</h1>
                  <p className="text-neutral-600 mt-1">Manage services available to citizens</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingService(null)
                    setFormData({
                      name: '',
                      description: '',
                      requirements: '',
                      processingTime: '',
                      category: '',
                      isActive: true
                    })
                    setFormError('')
                    setIsModalOpen(true)
                  }}
                >
                  Add New Service
                </Button>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <SearchBar
                  placeholder="Search services..."
                  onSearch={handleSearch}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusFilter('all')}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      statusFilter === 'all'
                        ? 'bg-primary-100 text-primary-800 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleStatusFilter('active')}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      statusFilter === 'active'
                        ? 'bg-green-100 text-green-800 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleStatusFilter('inactive')}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      statusFilter === 'inactive'
                        ? 'bg-red-100 text-red-800 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
              
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-sm font-medium text-gray-900">Total Services</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">{services.length}</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-sm font-medium text-gray-900">Active Services</div>
                  <div className="mt-1 text-2xl font-bold text-green-600">{getActiveServiceCount()}</div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-sm font-medium text-gray-900">Inactive Services</div>
                  <div className="mt-1 text-2xl font-bold text-red-600">{getInactiveServiceCount()}</div>
                </div>
              </div>
            </div>
            
            <Card>
              {loading ? (
                <SkeletonLoader type="table" />
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No services</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new service.</p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(null)
                        setFormData({
                          name: '',
                          description: '',
                          requirements: '',
                          processingTime: '',
                          category: '',
                          isActive: true
                        })
                        setFormError('')
                        setIsModalOpen(true)
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create your first service
                    </button>
                  </div>
                </div>
              ) : (
                <Table>
                  <Table.Head>
                    <Table.HeadCell>Service</Table.HeadCell>
                    <Table.HeadCell>Category</Table.HeadCell>
                    <Table.HeadCell>Processing Time</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell className="text-right">Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredServices.map((service) => (
                      <Table.Row key={service._id}>
                        <Table.Cell>
                          <div className="text-sm font-medium text-neutral-900">{service.name}</div>
                          <div className="text-sm text-neutral-500 line-clamp-1">{service.description}</div>
                        </Table.Cell>
                        <Table.Cell>
                          {service.category ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {service.category}
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-sm">-</span>
                          )}
                        </Table.Cell>
                        <Table.Cell className="text-sm text-neutral-900">
                          {service.processingTime} days
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant={service.isActive ? 'approved' : 'rejected'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditService(service)}
                            className="text-primary-700 hover:text-primary-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(service._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              )}
            </Card>
          </div>
        </main>
      </div>
      
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <Form onSubmit={handleSubmit}>
          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {formError}
            </div>
          )}
          
          <div className="space-y-4">
            <Form.Field label="Name" required>
              <Form.Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter service name"
              />
            </Form.Field>

            <Form.Field label="Description" required>
              <Form.Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter service description"
              />
            </Form.Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Field label="Processing Time (days)" required>
                <Form.Input
                  type="number"
                  min="1"
                  value={formData.processingTime}
                  onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                  placeholder="Enter processing time"
                />
              </Form.Field>

              <Form.Field label="Category">
                <Form.Input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Enter category (optional)"
                />
              </Form.Field>
            </div>

            <Form.Field label="Requirements (comma separated)">
              <Form.Textarea
                rows={2}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Enter requirements separated by commas"
              />
            </Form.Field>

            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-neutral-900">
                Service is active
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              {editingService ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}