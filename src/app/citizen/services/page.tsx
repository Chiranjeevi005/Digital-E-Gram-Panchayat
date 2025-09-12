'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import SearchBar from '@/components/SearchBar'
import Card from '@/components/Card'
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

export default function Services() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<ServiceType[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)

  useEffect(() => {
    // Initialize searchParams safely
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search))
    }
  }, [])

  useEffect(() => {
    console.log('Services page session:', { status, session }) // Debug log
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role) {
      // Normalize role checking to handle both old and new role names
      const isCitizen = session.user.role === 'user' || session.user.role === 'citizen' || session.user.role === 'Citizens';
      if (!isCitizen) {
        router.push(`/${session.user.role === 'user' ? 'citizen' : session.user.role.toLowerCase()}/dashboard`)
      } else {
        fetchServices()
      }
    }
  }, [session, status, router])

  const fetchServices = async () => {
    try {
      console.log('Fetching services...') // Debug log
      const response = await fetch('/api/services')
      const data = await response.json()
      console.log('Services API response:', { ok: response.ok, data }) // Debug log
      if (response.ok) {
        setServices(data.sort((a: ServiceType, b: ServiceType) => a.name.localeCompare(b.name)))
        setFilteredServices(data.sort((a: ServiceType, b: ServiceType) => a.name.localeCompare(b.name)))
      } else {
        console.error('Error fetching services:', data.error)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterServices(query, selectedCategory)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    filterServices(searchQuery, category)
  }

  const filterServices = (query: string, category: string) => {
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

    // Apply category filter
    if (category !== 'all') {
      result = result.filter(service => 
        category === 'uncategorized' 
          ? !service.category 
          : service.category === category
      )
    }

    setFilteredServices(result.sort((a: ServiceType, b: ServiceType) => a.name.localeCompare(b.name)))
  }

  // Get unique categories for filter
  const getCategories = () => {
    const categories = services
      .map(service => service.category)
      .filter((category): category is string => category !== undefined && category !== null) // Type guard to ensure category is string
      .filter((category, index, self) => self.indexOf(category) === index)
      .sort()
    return categories
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Navbar />
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900">Available Services</h1>
          <p className="mt-1 text-neutral-600">Browse and apply for government services</p>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <SearchBar
                placeholder="Search services..."
                onSearch={handleSearch}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryFilter('all')}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    selectedCategory === 'all'
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleCategoryFilter('uncategorized')}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    selectedCategory === 'uncategorized'
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Uncategorized
                </button>
                {getCategories().map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`px-3 py-1.5 text-sm rounded-md ${
                      selectedCategory === category
                        ? 'bg-primary-100 text-primary-800 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <SkeletonLoader key={index} type="card" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No services are currently available.'}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service._id}>
                  <div className="flex flex-col h-full">
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-heading font-semibold text-neutral-900 line-clamp-2">
                          {service.name}
                        </h3>
                        {service.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                        {service.description}
                      </p>
                      
                      {service.category && (
                        <span className="inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full mb-2 sm:mb-3">
                          {service.category}
                        </span>
                      )}
                      
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Processing Time:</span>
                          <span className="font-medium">{service.processingTime} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Cost:</span>
                          <span className="font-medium text-green-600">Free</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => router.push(`/citizen/services/${service._id}/apply`)}
                      disabled={!service.isActive}
                      className={`btn-primary w-full py-2 text-sm mt-4 ${!service.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Apply Now
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}