'use client'

import { useState, useEffect } from 'react'

export default function DebugHealth() {
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/health-check')
        const data = await response.json()
        setHealthData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchHealthData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking health...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-blue-50">
            <h1 className="text-2xl font-bold text-blue-800">Health Check Debug</h1>
            <p className="mt-1 text-sm text-blue-600">
              Application health and environment configuration status
            </p>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Status</h2>
                  <p className={`text-sm ${healthData?.success ? 'text-green-600' : 'text-red-600'}`}>
                    {healthData?.success ? '✅ Healthy' : '❌ Unhealthy'}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Environment Configuration</h2>
                  <div className="mt-2 grid grid-cols-1 gap-3">
                    {healthData?.envCheck && Object.entries(healthData.envCheck).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">{key}</span>
                        <span className={`text-sm font-medium ${value === 'SET' || (typeof value === 'string' && value !== 'NOT SET') ? 'text-green-600' : 'text-red-600'}`}>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Redirect URI</h2>
                  <p className="text-sm text-gray-600 break-all">
                    {healthData?.redirectUri}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Timestamp</h2>
                  <p className="text-sm text-gray-600">
                    {healthData?.timestamp}
                  </p>
                </div>

                {healthData?.message && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Message</h2>
                    <p className="text-sm text-gray-600">
                      {healthData.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}