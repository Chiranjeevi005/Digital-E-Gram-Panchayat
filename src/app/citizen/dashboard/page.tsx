'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import SkeletonLoader from '@/components/SkeletonLoader'
import StatCard from '@/components/StatCard'
import QuickAction from '@/components/QuickAction'
import Notification from '@/components/Notification'
import { 
  DocumentTextIcon, 
  ClipboardIcon, 
  ArrowDownTrayIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  Bars3Icon,
  XMarkIcon
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

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<ApplicationType[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true after component mounts to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    console.log('User dashboard session:', { status, session }) // Debug log
    if (status === 'loading') return; // Wait for session to load
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role) {
      console.log('User role:', session.user.role) // Debug log
      // Check if user has the correct role
      // Normalize role checking to handle both old and new role names
      const isCitizen = session.user.role === 'user' || session.user.role === 'citizen' || session.user.role === 'Citizens';
      if (!isCitizen) {
        // Redirect to appropriate dashboard based on role
        console.log('Redirecting to role dashboard:', session.user.role) // Debug log
        router.push(`/${session.user.role === 'user' ? 'citizen' : session.user.role.toLowerCase()}/dashboard`)
      } else {
        // For citizens, fetch applications
        console.log('Fetching applications for citizen') // Debug log
        fetchApplications()
      }
    }
  }, [session, status, router])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications')
      const data = await response.json()
      if (response.ok) {
        setApplications(data)
        // Calculate stats
        const total = data.length
        const pending = data.filter((app: ApplicationType) => app.status === 'pending').length
        const approved = data.filter((app: ApplicationType) => app.status === 'approved').length
        const rejected = data.filter((app: ApplicationType) => app.status === 'rejected').length
        setStats({ total, pending, approved, rejected })
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickServices = [
    { 
      name: 'Birth Certificate', 
      icon: <DocumentTextIcon className="h-6 w-6" />,
      onClick: () => router.push('/citizen/services?category=certificates')
    },
    { 
      name: 'Death Certificate', 
      icon: <DocumentTextIcon className="h-6 w-6" />,
      onClick: () => router.push('/citizen/services?category=certificates')
    },
    { 
      name: 'Government Schemes', 
      icon: <ChartBarIcon className="h-6 w-6" />,
      onClick: () => router.push('/citizen/services?category=schemes')
    },
    { 
      name: 'Grievance', 
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
      onClick: () => router.push('/citizen/services?category=complaints')
    },
    { 
      name: 'Land Records', 
      icon: <ClipboardIcon className="h-6 w-6" />,
      onClick: () => router.push('/citizen/services?category=property')
    }
  ]

  // Don't render anything on the server to avoid hydration issues
  if (!isClient) {
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

  // If user is not a citizen, don't render the dashboard
  if (session?.user && 'role' in session.user && session.user.role !== 'Citizens' && session.user.role !== 'user') {  // Changed 'citizen' to 'Citizens'
    return null; // Will be redirected by useEffect
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
                <Sidebar role="Citizens" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-1">
        <div className="hidden md:block w-64">
          <Sidebar role="Citizens" />
        </div>
        
        <main className="flex-1 p-4 sm:p-6">
          <div className="md:hidden mb-4">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-10 w-10 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">Citizen Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Welcome, {session?.user?.name || session?.user?.email || 'User'}
            </p>
          </div>
          
          {/* Stats Overview - Responsive grid for mobile */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <StatCard 
              title="Total" 
              value={stats.total} 
              icon={<ClipboardIcon className="h-5 w-5" />} 
              color="blue" 
            />
            <StatCard 
              title="Pending" 
              value={stats.pending} 
              icon={<ClockIcon className="h-5 w-5" />} 
              color="yellow" 
            />
            <StatCard 
              title="Approved" 
              value={stats.approved} 
              icon={<CheckCircleIcon className="h-5 w-5" />} 
              color="green" 
            />
            <StatCard 
              title="Rejected" 
              value={stats.rejected} 
              icon={<XCircleIcon className="h-5 w-5" />} 
              color="red" 
            />
          </div>
          
          {/* Notifications - Full width on mobile */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <Notification 
              title="New Scheme Available"
              message="Check out the new agricultural subsidy scheme for farmers in your district."
              type="info"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Quick Apply Services - Responsive grid */}
            <Card className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-heading font-semibold text-gray-900">Quick Apply Services</h2>
                <button
                  onClick={() => router.push('/citizen/services')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                >
                  View All Services
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {quickServices.map((service, index) => (
                  <button
                    key={index}
                    onClick={service.onClick}
                    className="bg-white rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-1 text-indigo-600">{service.icon}</div>
                    <span className="text-[0.6rem] sm:text-xs font-medium text-gray-900 text-center">{service.name}</span>
                  </button>
                ))}
              </div>
            </Card>
            
            {/* Instant Downloads - Full width card on mobile */}
            <Card className="w-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base sm:text-lg font-heading font-semibold text-gray-900">Instant Downloads</h3>
                <ArrowDownTrayIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              </div>
              <p className="text-gray-600 mb-3 text-xs sm:text-sm">
                Access your approved documents instantly
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => router.push('/citizen/downloads')}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View History
                </button>
                <button 
                  onClick={() => router.push('/citizen/test-document')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Test Document
                </button>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* My Applications - Full width on mobile */}
            <Card className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-heading font-semibold text-gray-900">My Applications</h2>
                <button
                  onClick={() => router.push('/citizen/applications')}
                  className="bg-white text-gray-700 border border-gray-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap"
                >
                  View All
                </button>
              </div>

              {loading ? (
                <SkeletonLoader type="table" />
              ) : applications.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="mx-auto bg-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-3 text-sm">You haven&apos;t applied for any services yet.</p>
                  <button
                    onClick={() => router.push('/citizen/services')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply for a Service
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                        <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.slice(0, 5).map((application) => (
                        <tr key={application._id}>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[80px] sm:max-w-xs">{application.service?.name}</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <Badge variant={application.status}>
                              {application.status}
                            </Badge>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                            {new Date(application.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                            <button
                              onClick={() => router.push(`/citizen/applications/${application._id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
            
            {/* Support & Notifications - Stacked on mobile */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="w-full">
                <h3 className="text-base sm:text-lg font-heading font-semibold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-gray-600 mb-3 text-xs sm:text-sm">
                  If you have any questions about the services or need assistance with your applications, our support team is here to help.
                </p>
                <button 
                  onClick={() => router.push('/citizen/services?category=complaints')}
                  className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-2 rounded-md text-xs sm:text-sm font-medium hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Contact Support
                </button>
              </Card>
              
              <Card className="w-full">
                <h3 className="text-base sm:text-lg font-heading font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <QuickAction 
                    title="Update Profile"
                    description="Update your personal information"
                    icon={<UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                    onClick={() => router.push('/citizen/profile')}
                  />
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}