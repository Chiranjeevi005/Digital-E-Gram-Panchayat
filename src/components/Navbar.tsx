'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import NotificationDropdown from '@/components/NotificationDropdown'

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true after component mounts to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Log session changes for debugging
  useEffect(() => {
    console.log('Navbar session update:', { status, session })
  }, [status, session])

  const getUserDashboardPath = () => {
    if (!session?.user) return '/'
    const role = (session.user as any).role
    console.log('User role for dashboard path:', role) // Debug log
    switch (role) {
      case 'citizen': 
      case 'user': // Handle 'user' role as well for backward compatibility
        return '/user/dashboard'
      case 'staff': return '/staff/dashboard'
      case 'admin': 
      case 'officer': return '/officer/dashboard'
      default: return '/'
    }
  }

  const handleLinkClick = () => setIsMenuOpen(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href)
  }

  // Don't render anything on the server to avoid hydration issues
  if (!isClient) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center focus:outline-none">
                {/* Logo placeholder for SSR */}
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                </div>
                <span className="ml-2 text-sm sm:text-lg font-heading font-bold text-gray-900">
                  Digital Gram Panchayat
                </span>
              </div>
            </div>
            
            {/* Desktop Navigation Placeholder */}
            <div className="hidden md:flex md:items-center md:space-x-1">
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center ml-2">
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center focus:outline-none"
              onClick={handleLinkClick}
            >
              {/* Logo container with proper sizing for mobile */}
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
                <Image
                  src="/navbar-logo.png"
                  alt="Digital E-Panchayat Logo"
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>

              {/* Brand name - visible on mobile with smaller text */}
              <span className="ml-2 text-sm sm:text-lg font-heading font-bold text-gray-900">
                Digital Gram Panchayat
              </span>
            </Link>
          </div>

          {/* Right side - Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <Link
              href="/user/services"
              onClick={handleLinkClick}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive('/user/services')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              Services
            </Link>
            <Link
              href="/contact"
              onClick={handleLinkClick}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive('/contact')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              Contact
            </Link>

            {/* User menu */}
            {status === 'loading' ? (
              <div className="ml-6 flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              </div>
            ) : session?.user ? (
              <div className="flex items-center ml-6 space-x-3">
                <NotificationDropdown />
                <Link
                  href={getUserDashboardPath()}
                  className="banner-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="banner-gradient text-white rounded-full w-8 h-8 flex items-center justify-center font-medium text-sm">
                    {session.user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">
                    {session.user.name || session.user.email || 'User'}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-gray-900 focus:outline-none transition-colors duration-200"
                  title="Sign out"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center ml-6">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login/Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center ml-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="border-t border-gray-200 bg-white shadow-lg">
          <div className="pt-2 pb-3 space-y-1 px-2">
            <Link
              href="/user/services"
              onClick={handleLinkClick}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive('/user/services')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
            >
              Services
            </Link>
            <Link
              href="/contact"
              onClick={handleLinkClick}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive('/contact')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
            >
              Contact
            </Link>
          </div>

          {session?.user ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="banner-gradient text-white rounded-full w-10 h-10 flex items-center justify-center font-medium text-sm flex-shrink-0">
                  {session.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {session.user.name || session.user.email || 'User'}
                  </div>
                  <div className="text-sm font-medium text-gray-500">{session.user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <Link
                  href={getUserDashboardPath()}
                  onClick={handleLinkClick}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    handleLinkClick()
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="mt-3 space-y-1 px-2">
                <Link
                  href="/auth/signin"
                  onClick={handleLinkClick}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                >
                  Login/Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}