'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  initialValue?: string // Add initialValue prop
}

export default function SearchBar({ onSearch, placeholder = 'Search...', className = '', initialValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)

  // Update query when initialValue changes
  useEffect(() => {
    setQuery(initialValue)
  }, [initialValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 pl-10 shadow-sm transition-all duration-200 hover:shadow-md"
        placeholder={placeholder}
      />
      <button type="submit" className="hidden">Search</button>
    </form>
  )
}