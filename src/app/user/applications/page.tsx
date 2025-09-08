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
import SkeletonLoader from '@/components/SkeletonLoader'
import { 
  DocumentTextIcon, 
  Bars3Icon, 
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

interface ApplicationType {
  _id: string
  service: {
    name: string
  }
  status: 'pending' | 'in-progress' | 'approved' | 'rejected'
  submittedAt: string
  downloadStatus?: 'pending' | 'processing' | 'ready' | 'completed'
}

export default function UserApplications() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<ApplicationType[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ApplicationType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // If we're server-side rendering, don't render anything
    if (typeof window === 'undefined') {
      return
    }
    
    if (status === 'loading') return // Wait for session to load
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role && 
               session.user.role !== 'user' && session.user.role !== 'citizen') {
      // Redirect if not a user or citizen
      router.push(`/${session.user.role}/dashboard`)
    } else if (session?.user) {
      fetchApplications()
    }
  }, [session, status, router])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const data = await response.json()
      if (response.ok) {
        setApplications(data)
        setFilteredApplications(data)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterApplications(query, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterApplications(searchQuery, status)
  }

  const filterApplications = (query: string, status: string) => {
    let result = applications
    
    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase()
      result = result.filter(app => 
        app.service.name.toLowerCase().includes(lowerQuery)
      )
    }
    
    // Filter by status
    if (status !== 'all') {
      result = result.filter(app => app.status === status)
    }
    
    setFilteredApplications(result)
  }

  const statusOptions = ['all', 'pending', 'in-progress', 'approved', 'rejected']

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1">
          <div className="hidden md:block w-64">
            <SkeletonLoader type="card" className="h-full" />
          </div>
          <div className="flex-1 p-6">
            <SkeletonLoader type="card" className="h-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Mobile sidebar */}
      <div className="md:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <Sidebar role="user" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-1">
        <div className="hidden md:block w-64">
          <Sidebar role="user" />
        </div>
        
        <main className="flex-1 p-6">
          <div className="md:hidden mb-4">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">View and manage all your applications</p>
          </div>
          
          <Card>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-heading font-semibold text-gray-900">Application History</h2>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <SearchBar 
                    onSearch={handleSearch} 
                    placeholder="Search applications..." 
                    className="w-full sm:w-48 md:w-64"
                  />
                  
                  <select 
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 sm:px-4 sm:py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm sm:text-base"
                  >
                    {statusOptions.map(option => (
                      <option key={option} value={option} className="bg-white">
                        {option === 'all' ? 'All Statuses' : option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <SkeletonLoader type="table" />
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'You haven\'t submitted any applications yet'}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setFilteredApplications(applications)
                    }}
                    className="mt-4 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear filters
                  </button>
                )}
                {!searchQuery && statusFilter === 'all' && (
                  <button
                    onClick={() => router.push('/user/services')}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply for a Service
                  </button>
                )}
              </div>
            ) : (
              <Table>
                <Table.Head>
                  <Table.HeadCell>Service</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Submitted</Table.HeadCell>
                  <Table.HeadCell className="text-right">Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {filteredApplications.map((application) => (
                    <Table.Row key={application._id}>
                      <Table.Cell>
                        <div className="text-sm font-medium text-gray-900">{application.service?.name}</div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={application.status}>
                          {application.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-sm text-gray-500">
                          {new Date(application.submittedAt).toLocaleDateString()}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <button
                          onClick={() => router.push(`/user/applications/${application._id}`)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}