'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function AuthVerify() {
  const { data: session, status } = useSession()
  const [apiSession, setApiSession] = useState<any>(null)

  useEffect(() => {
    const fetchApiSession = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        const data = await response.json()
        setApiSession(data)
      } catch (error) {
        console.error('API session fetch error:', error)
      }
    }

    if (status === 'authenticated') {
      fetchApiSession()
    }
  }, [status])

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Authentication Verification</h1>
          <p className="mt-2 text-lg text-gray-600">
            Verifying the rebuilt authentication system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Client-side session */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-blue-50">
              <h2 className="text-lg leading-6 font-medium text-blue-800">
                Client-Side Session
              </h2>
            </div>
            <div className="border-t border-gray-200 p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1 text-sm text-gray-900">{status}</p>
                </div>
                
                {session?.user && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">User ID</p>
                      <p className="mt-1 text-sm text-gray-900">{session.user.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="mt-1 text-sm text-gray-900">{session.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="mt-1 text-sm text-gray-900">{session.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <p className="mt-1 text-sm text-gray-900">{session.user.role}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Server-side session */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-green-50">
              <h2 className="text-lg leading-6 font-medium text-green-800">
                Server-Side Session
              </h2>
            </div>
            <div className="border-t border-gray-200 p-6">
              <div className="space-y-4">
                {apiSession ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Success</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {apiSession.success ? 'Yes' : 'No'}
                      </p>
                    </div>
                    
                    {apiSession.user && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-500">User ID</p>
                          <p className="mt-1 text-sm text-gray-900">{apiSession.user.id}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Name</p>
                          <p className="mt-1 text-sm text-gray-900">{apiSession.user.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="mt-1 text-sm text-gray-900">{apiSession.user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Role</p>
                          <p className="mt-1 text-sm text-gray-900">{apiSession.user.role}</p>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    {status === 'authenticated' 
                      ? 'Loading server session...' 
                      : 'Not authenticated'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/auth/signin" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    </div>
  )
}