'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'

export default function TestSupportingDocument() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fieldName', 'supportingDocument')
      formData.append('applicationId', `test_${Date.now()}`)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Supporting Document Upload Test</h1>
        
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Supporting Document (PDF, JPEG, or PNG)
              </label>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                uploading || !file
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload Supporting Document'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                <strong>Error:</strong> {error}
              </div>
            )}

            {result && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                <strong>Success!</strong>
                <p className="mt-2 text-sm">File uploaded successfully.</p>
                <p className="mt-1 text-sm">URL: {result.url}</p>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Document
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}