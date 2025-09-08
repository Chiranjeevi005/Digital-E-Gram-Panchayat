'use client'

import { useState, useEffect } from 'react'

export default function TestServices() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/test-services')
      const data = await response.json()
      
      if (response.ok) {
        setServices(data.services)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch services')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Services Test Page</h1>
      
      {loading && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p>Loading services...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <div className="bg-green-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Services Data</h2>
          <p>Total services: {services.length}</p>
          
          {services.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Services List:</h3>
              <ul className="list-disc pl-5">
                {services.map((service) => (
                  <li key={service._id} className="mb-1">
                    {service.name} - {service.isActive ? 'Active' : 'Inactive'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}