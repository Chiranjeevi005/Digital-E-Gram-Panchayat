'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [trackingId, setTrackingId] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/user/services?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleTrackApplication = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingId.trim()) {
      router.push(`/user/applications/${trackingId}`)
    }
  }

  // Popular services data - updated to match our four core services
  const services = [
    {
      id: 'birth-death',
      title: "Birth & Death Certificates",
      description: "Apply for birth and death certificates online with minimal documentation.",
      category: "Certificates",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'government-schemes',
      title: "Government Schemes",
      description: "Access information and apply for various government welfare schemes.",
      category: "Welfare",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: 'grievance',
      title: "Grievance Redressal",
      description: "File complaints and track their resolution status online.",
      category: "Complaints",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      id: 'land-records',
      title: "Land Records & Utility Connections",
      description: "Request digital land records or apply for new utility connections.",
      category: "Property",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    }
  ]

  // Benefits data
  const benefits = [
    {
      title: "Fast Processing",
      description: "Get your documents processed quickly with our streamlined digital workflow.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Zero Cost",
      description: "All services are completely free of charge for citizens.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Accessibility",
      description: "Services available anytime, anywhere with minimal travel.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: "Transparency",
      description: "Track your applications and view processing status in real-time.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <Navbar />
      
      {/* Header */}
      <div className="relative w-full h-[700px]">
        {/* Banner image with 80% blur effect */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="https://res.cloudinary.com/ds2qnwvrk/image/upload/v1757176917/Digital_E-Gram_Banner_rhmdud.png"
            alt="Digital E-Gram Panchayat"
            className="w-full h-full object-cover blur-[2px]"
          />
          {/* Additional overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Overlay text with modern professional styling */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-2xl font-heading leading-tight">
            Digital E-Gram <span className="block mt-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Panchayat</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl lg:text-2xl drop-shadow-xl max-w-3xl mx-auto px-4 font-light">
            Empowering villages through digital governance with <span className="font-medium">transparency</span> and <span className="font-medium">efficiency</span>
          </p>
          
          {/* Action Buttons with enhanced styling */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href={status === 'authenticated' ? '/user/services' : '/auth/register'}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-xl text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-blue-900 transition-all duration-300 transform hover:-translate-y-1"
            >
              Apply for Services
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link 
              href="#track-application" 
              className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-xl shadow-xl text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-blue-900 transition-all duration-300 backdrop-blur-sm"
            >
              Track Application
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {/* Additional info card */}
          <div className="mt-16 max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <p className="text-white/90 text-lg">
              Serving <span className="font-bold text-white">10,000+</span> citizens across villages with seamless digital services
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Below the banner */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 3. Why Digital E-Gram Panchayat? */}
          <div className="py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 font-heading">
                Why Digital E-Gram Panchayat?
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                Transforming village governance through digital innovation
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex flex-col items-center text-center group">
                    <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300 transform group-hover:scale-110">
                      {benefit.icon}
                    </div>
                    <div className="mt-5">
                      <h3 className="text-lg font-semibold text-gray-900 font-heading">
                        {benefit.title}
                      </h3>
                      <p className="mt-2 text-base text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Popular Services */}
          <div id="services" className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 font-heading">
                Popular Services
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                Access essential government services online with just a few clicks
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-3">
                        {service.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 font-heading">
                          {service.title}
                        </h3>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                        {service.category}
                      </span>
                    </div>
                    <p className="mt-3 text-gray-600">
                      {service.description}
                    </p>
                    <div className="mt-6">
                      <Link
                        href={status === 'authenticated' ? `/user/services` : '/auth/register'}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors duration-200"
                      >
                        Apply Now
                        <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Track Your Application */}
          <div id="track-application" className="mb-20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 font-heading mb-4">
                Track Your Application
              </h2>
              <p className="text-lg text-gray-600 mb-10">
                Check the status of your application using your application ID
              </p>
              
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 shadow-lg">
                <form onSubmit={handleTrackApplication} className="relative max-w-2xl mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 placeholder-gray-500"
                    placeholder="Enter your application ID"
                  />
                  <button
                    type="submit"
                    className="mt-4 w-full sm:w-auto sm:absolute sm:right-2.5 sm:bottom-2.5 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Track Application
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold font-heading">Digital E-Gram Panchayat</h3>
              <p className="mt-4 text-gray-300 max-w-md">
                Empowering villages through digital governance. Bringing transparency, accessibility, and efficiency to government services at your doorstep.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold font-heading">Quick Links</h4>
              <ul className="mt-4 space-y-2">
                <li><Link href="/user/services" className="text-gray-300 hover:text-white transition-colors duration-200">Services</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">Contact</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors duration-200">About Us</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors duration-200">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold font-heading">Contact Us</h4>
              <ul className="mt-4 space-y-2 text-gray-300">
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">Panchayat Office, Village Name, District</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="ml-2">+91 98765 43210</span>
                </li>
                <li className="flex items-start">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="ml-2">info@digitalgrampanchayat.gov.in</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 Digital E-Gram Panchayat. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white mr-6 transition-colors duration-200">Privacy Policy</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</Link>
            </div>
          </div>
          
          <div className="mt-8 text-center md:text-right">
            <p className="text-gray-400">
              Helpline: <span className="font-semibold text-white">1800-123-4567</span> (Toll-free)
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}