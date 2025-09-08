'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      fetchDebugInfo()
    }
  }, [session, status, router])

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug-auth')
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error('Error fetching debug info:', error)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-6">Authentication Debug</h1>
          
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">Session Information</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
              
              <div className="mt-6">
                <button
                  onClick={fetchDebugInfo}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}