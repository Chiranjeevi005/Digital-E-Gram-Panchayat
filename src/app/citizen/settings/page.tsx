'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Card from '@/components/Card'
import AccountManagement from '@/components/AccountManagement'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

// Define the session user type with notification preferences
type SessionUser = {
  id: string;
  role: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    types: {
      applicationUpdates: boolean;
      serviceAnnouncements: boolean;
      systemNotifications: boolean;
    }
  };
  isDeactivated?: boolean;
}

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function UserSettings() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    state: '',
    pincode: ''
  })
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    types: {
      applicationUpdates: true,
      serviceAnnouncements: true,
      systemNotifications: true
    }
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isClient, setIsClient] = useState(false)
  const lastSavedPreferences = useRef(notifications)

  // Set isClient to true after component mounts to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchNotificationPreferences = async () => {
    try {
      const response = await fetch('/api/citizen/notification-preferences')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (err) {
      console.error('Failed to fetch notification preferences:', err)
    }
  }

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/citizen/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile({
          name: data.name || '',
          email: session?.user?.email || '',
          phone: data.phone || '',
          address: data.address || '',
          district: data.district || '',
          state: data.state || '',
          pincode: data.pincode || ''
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile data:', err)
    }
  }

  useEffect(() => {
    if (status === 'loading') return // Wait for session to load

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user && 'role' in session.user && session.user.role) {
      // Normalize role checking to handle both old and new role names
      const isCitizen = session.user.role === 'user' || session.user.role === 'citizen' || session.user.role === 'Citizens';
      if (!isCitizen) {
        // Redirect if not a citizen
        router.push(`/${session.user.role === 'user' ? 'citizen' : session.user.role.toLowerCase()}/dashboard`)
      } else {
        const typedSessionUser = session.user as SessionUser;
        // Set initial profile data from session
        setProfile({
          name: typedSessionUser.name || '',
          email: typedSessionUser.email || '',
          phone: (typedSessionUser as any).phone || '',
          address: (typedSessionUser as any).address || '',
          district: (typedSessionUser as any).district || '',
          state: (typedSessionUser as any).state || '',
          pincode: (typedSessionUser as any).pincode || ''
        })
        
        // Fetch profile data and notification preferences
        fetchProfileData()
        fetchNotificationPreferences()
        
        // Initialize lastSavedPreferences with session data if available
        if (typedSessionUser.notificationPreferences) {
          lastSavedPreferences.current = typedSessionUser.notificationPreferences
        }
      }
    }
  }, [session, status, router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Make API call to update the profile
      const response = await fetch('/api/citizen/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          district: profile.district,
          state: profile.state,
          pincode: profile.pincode
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Profile updated successfully')
        // Update the session with new profile data
        await update({
          trigger: 'profileUpdate',
          data: {
            name: data.name,
            phone: data.phone,
            address: data.address,
            district: data.district,
            state: data.state,
            pincode: data.pincode
          }
        })
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Failed to update profile')
      console.error('Profile update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password.new !== password.confirm) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    try {
      // In a real app, you would make an API call to change the password
      // For now, we'll just simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Password changed successfully')
      setPassword({ current: '', new: '', confirm: '' })
    } catch (err) {
      setError('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = (field: string, subField?: string) => {
    setNotifications(prev => {
      if (subField) {
        // Handle nested types object
        return {
          ...prev,
          types: {
            ...prev.types,
            [subField]: !prev.types[subField as keyof typeof prev.types]
          }
        }
      } else {
        // Handle top-level notification preferences
        return {
          ...prev,
          [field]: !prev[field as keyof typeof prev]
        }
      }
    })
  }

  const saveNotificationPreferences = async (preferencesToSave: typeof notifications) => {
    try {
      // Check if preferences have actually changed before saving
      if (JSON.stringify(preferencesToSave) === JSON.stringify(lastSavedPreferences.current)) {
        return // No changes to save
      }
      
      const response = await fetch('/api/citizen/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferencesToSave)
      })
      
      if (response.ok) {
        setSuccess('Notification preferences saved successfully')
        // Update the session with new preferences
        update()
        // Update the ref with the saved preferences
        lastSavedPreferences.current = preferencesToSave
      } else {
        setError('Failed to save notification preferences')
      }
    } catch (err) {
      setError('Failed to save notification preferences')
      console.error('Error saving notification preferences:', err)
    }
  }

  // Add a useEffect to automatically save when notification preferences change
  // Only trigger when notifications change, not when session/status change to avoid infinite loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    // Only save if the preferences have actually changed
    if (status === 'authenticated' && session?.user && 
        JSON.stringify(notifications) !== JSON.stringify(lastSavedPreferences.current)) {
      timer = setTimeout(() => {
        saveNotificationPreferences(notifications)
      }, 1000) // Debounce for 1 second
    }
    
    // Cleanup function to clear timer on unmount or when dependencies change
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [notifications, status, session]) // Depend on notifications, status, and session but with proper checks

  // Don't render anything on the server to avoid hydration issues
  // Only show loading state when client is ready but session is still loading
  if (!isClient) {
    return null;
  }

  // Show loading skeleton only when session is loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1">
          <div className="hidden md:block w-64 bg-white border-r border-gray-200">
            <div className="h-full animate-pulse bg-gray-200"></div>
          </div>
          <div className="flex-1 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
                <div>
                  <div className="h-64 bg-gray-200 rounded mb-6"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
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
            <h1 className="text-3xl font-heading font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Settings */}
            <div className="lg:col-span-2 space-y-6">
              <Card title="Profile Information">
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profile.email}
                        disabled
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-500 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        id="district"
                        value={profile.district}
                        onChange={(e) => setProfile({...profile, district: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={profile.state}
                        onChange={(e) => setProfile({...profile, state: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        value={profile.pincode}
                        onChange={(e) => setProfile({...profile, pincode: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      value={profile.address}
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </Card>
              
              <Card title="Change Password">
                <form onSubmit={handlePasswordChange}>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={password.current}
                        onChange={(e) => setPassword({...password, current: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={password.new}
                        onChange={(e) => setPassword({...password, new: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={password.confirm}
                        onChange={(e) => setPassword({...password, confirm: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </Card>
            </div>
            
            {/* Notification Settings */}
            <div>
              <Card title="Notification Preferences">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotificationChange('email')}
                      className={`${
                        notifications.email ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                      role="switch"
                      aria-checked={notifications.email}
                    >
                      <span
                        aria-hidden="true"
                        className={`${
                          notifications.email ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotificationChange('sms')}
                      className={`${
                        notifications.sms ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                      role="switch"
                      aria-checked={notifications.sms}
                    >
                      <span
                        aria-hidden="true"
                        className={`${
                          notifications.sms ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                      <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotificationChange('push')}
                      className={`${
                        notifications.push ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                      role="switch"
                      aria-checked={notifications.push}
                    >
                      <span
                        aria-hidden="true"
                        className={`${
                          notifications.push ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="application-updates"
                          name="application-updates"
                          type="checkbox"
                          checked={notifications.types.applicationUpdates}
                          onChange={() => handleNotificationChange('types', 'applicationUpdates')}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="application-updates" className="font-medium text-gray-700">
                          Application Updates
                        </label>
                        <p className="text-gray-500">Status changes to your applications</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="service-announcements"
                          name="service-announcements"
                          type="checkbox"
                          checked={notifications.types.serviceAnnouncements}
                          onChange={() => handleNotificationChange('types', 'serviceAnnouncements')}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="service-announcements" className="font-medium text-gray-700">
                          Service Announcements
                        </label>
                        <p className="text-gray-500">New services and updates</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="system-notifications"
                          name="system-notifications"
                          type="checkbox"
                          checked={notifications.types.systemNotifications}
                          onChange={() => handleNotificationChange('types', 'systemNotifications')}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="system-notifications" className="font-medium text-gray-700">
                          System Notifications
                        </label>
                        <p className="text-gray-500">Maintenance and system updates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <AccountManagement />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}