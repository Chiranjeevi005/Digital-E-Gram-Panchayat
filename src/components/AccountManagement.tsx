'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Card from '@/components/Card'

export default function AccountManagement() {
  const { update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  // Download account data
  const handleDownloadData = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const response = await fetch('/api/user/account/data')
      
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setSuccess('Account data downloaded successfully')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to download account data')
      }
    } catch (err) {
      setError('Failed to download account data')
      console.error('Error downloading account data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Deactivate account
  const handleDeactivateAccount = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const response = await fetch('/api/user/deactivate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setSuccess('Account deactivated successfully')
        // Sign out the user after a short delay
        setTimeout(() => {
          update()
          router.push('/auth/signin')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to deactivate account')
      }
    } catch (err) {
      setError('Failed to deactivate account')
      console.error('Error deactivating account:', err)
    } finally {
      setLoading(false)
      setShowDeactivateModal(false)
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const response = await fetch('/api/user/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
      }
      })
      
      if (response.ok) {
        setSuccess('Account deleted successfully')
        // Sign out the user after a short delay
        setTimeout(() => {
          update()
          router.push('/auth/signin')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete account')
      }
    } catch (err) {
      setError('Failed to delete account')
      console.error('Error deleting account:', err)
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <>
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Deactivate Account</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to deactivate your account? You can reactivate it later by signing in.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivateAccount}
                disabled={loading}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
              >
                {loading ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Card title="Account Management">
        <div className="space-y-4">
          <button 
            onClick={handleDownloadData}
            disabled={loading}
            className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <h3 className="font-medium text-gray-900">Download Account Data</h3>
            <p className="text-sm text-gray-500 mt-1">Get a copy of your personal data</p>
          </button>
          
          <button 
            onClick={() => setShowDeactivateModal(true)}
            disabled={loading}
            className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <h3 className="font-medium text-gray-900">Deactivate Account</h3>
            <p className="text-sm text-gray-500 mt-1">Temporarily disable your account</p>
          </button>
          
          <button 
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            className="w-full text-left px-4 py-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <h3 className="font-medium text-red-700">Delete Account</h3>
            <p className="text-sm text-red-500 mt-1">Permanently delete your account and data</p>
          </button>
        </div>
      </Card>
    </>
  )
}