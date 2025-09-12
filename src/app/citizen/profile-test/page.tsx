'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function ProfileTest() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role && 
               session.user.role !== 'user' && session.user.role !== 'citizen') {
      router.push(`/${session.user.role}/dashboard`)
    } else if (session?.user) {
      // Display the session user data
      setProfileData(session.user)
    }
  }, [session, status, router])

  const refreshSession = async () => {
    // Force refresh the session
    await update()
    // Update local state with new session data
    setProfileData(session?.user || null)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
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
          
          <div className="mb-6">
            <h1 className="text-3xl font-heading font-bold text-gray-900">Profile Test</h1>
            <p className="text-gray-600 mt-2">View and test profile data synchronization</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Session Data">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Name</h3>
                  <p className="text-gray-700">{profileData?.name || 'Not available'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email</h3>
                  <p className="text-gray-700">{profileData?.email || 'Not available'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Role</h3>
                  <p className="text-gray-700">{profileData?.role || 'Not available'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Phone</h3>
                  <p className="text-gray-700">{(profileData as any)?.phone || 'Not available'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Address</h3>
                  <p className="text-gray-700">{(profileData as any)?.address || 'Not available'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">District</h3>
                  <p className="text-gray-700">{(profileData as any)?.district || 'Not available'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">State</h3>
                  <p className="text-gray-700">{(profileData as any)?.state || 'Not available'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Pincode</h3>
                  <p className="text-gray-700">{(profileData as any)?.pincode || 'Not available'}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={refreshSession}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Refresh Session
                </button>
              </div>
            </Card>
            
            <Card title="Instructions">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Testing Profile Updates</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Go to the Settings page</li>
                    <li>Update your profile information</li>
                    <li>Come back to this page</li>
                    <li>Click &quot;Refresh Session&quot; to see updated data</li>
                  </ol>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Note</h4>
                  <p className="text-sm text-blue-800">
                    Profile updates should automatically appear throughout the application after saving. 
                    If they don&apos;t appear immediately, click the &quot;Refresh Session&quot; button.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}