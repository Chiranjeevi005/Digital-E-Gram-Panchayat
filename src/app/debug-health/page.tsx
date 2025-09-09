'use client'

import { useState, useEffect } from 'react'

export default function DebugHealth() {
  const [healthData, setHealthData] = useState<any>(null)
  const [googleConfigData, setGoogleConfigData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [googleTestResult, setGoogleTestResult] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch health data
        const healthResponse = await fetch('/api/health-check')
        const healthData = await healthResponse.json()
        setHealthData(healthData)
        
        // Fetch Google config data
        const googleConfigResponse = await fetch('/api/test-google-config')
        const googleConfigData = await googleConfigResponse.json()
        setGoogleConfigData(googleConfigData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const testGoogleAuth = async () => {
    setGoogleTestResult('Testing Google OAuth configuration...')
    try {
      // This is a client-side test to check if Google OAuth is properly configured
      const redirectUri = `${healthData?.envCheck?.NEXTAUTH_URL}/api/auth/callback/google`
      const clientId = healthData?.envCheck?.GOOGLE_CLIENT_ID
      
      if (!clientId || clientId === 'NOT SET') {
        setGoogleTestResult('❌ Google Client ID is not configured')
        return
      }
      
      if (!healthData?.envCheck?.NEXTAUTH_URL || healthData.envCheck.NEXTAUTH_URL === 'NOT SET') {
        setGoogleTestResult('❌ NEXTAUTH_URL is not configured')
        return
      }
      
      setGoogleTestResult(`✅ Configuration looks good. Redirect URI: ${redirectUri}`)
    } catch (err) {
      setGoogleTestResult(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

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
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Google OAuth Configuration</h2>
                  {googleConfigData?.success ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-600">✅ Configuration check passed</p>
                      <p className="text-sm text-gray-600">
                        Expected Redirect URI: <span className="font-mono break-all">{googleConfigData?.configuration?.expectedRedirectUri}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Client ID: {googleConfigData?.configuration?.googleClientId}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-red-600">❌ Configuration check failed</p>
                      {googleConfigData?.error && (
                        <p className="text-sm text-gray-600">{googleConfigData.error}</p>
                      )}
                      {googleConfigData?.missing && (
                        <div>
                          <p className="text-sm text-gray-600">Missing variables:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {googleConfigData.missing.map((item: string) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Google OAuth Test</h2>
                  <button
                    onClick={testGoogleAuth}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Test Google OAuth Configuration
                  </button>
                  {googleTestResult && (
                    <p className="mt-2 text-sm text-gray-600">
                      {googleTestResult}
                    </p>
                  )}
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

        {/* Troubleshooting Guide */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-yellow-50">
            <h2 className="text-lg font-medium text-yellow-800">Troubleshooting Guide</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">If you're still experiencing issues:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Verify that your Google OAuth client is properly configured in the Google Cloud Console</li>
                <li>Ensure the redirect URI exactly matches: <span className="font-mono break-all">{googleConfigData?.configuration?.expectedRedirectUri}</span></li>
                <li>Check that your OAuth client is not restricted to certain domains</li>
                <li>Make sure the Google+ API is enabled for your project</li>
                <li>Verify that your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct</li>
                <li>Check that your OAuth client is not in "Testing" mode if you're not a test user</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}