'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ClipboardIcon, 
  ChartBarIcon, 
  CogIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  BellIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { 
    name: 'Dashboard', 
    href: (role: string) => `/${role}/dashboard`, 
    icon: HomeIcon,
    roles: ['user', 'staff', 'officer']
  },
  { 
    name: 'Services', 
    href: (role: string) => role === 'user' ? '/user/services' : '/officer/services', 
    icon: BuildingOfficeIcon,
    roles: ['user', 'officer']
  },
  { 
    name: 'My Applications', 
    href: (role: string) => '/user/applications', 
    icon: DocumentTextIcon,
    roles: ['user']
  },
  { 
    name: 'Download History', 
    href: (role: string) => '/user/downloads', 
    icon: ArrowDownTrayIcon,
    roles: ['user']
  },
  { 
    name: 'Assigned Applications', 
    href: (role: string) => '/staff/applications', 
    icon: ClipboardIcon,
    roles: ['staff']
  },
  { 
    name: 'All Applications', 
    href: (role: string) => '/officer/applications', 
    icon: ClipboardIcon,
    roles: ['officer']
  },
  { 
    name: 'Download Management', 
    href: (role: string) => '/officer/downloads', 
    icon: ArrowDownTrayIcon,
    roles: ['officer']
  },
  { 
    name: 'Users', 
    href: (role: string) => '/officer/users', 
    icon: UsersIcon,
    roles: ['officer']
  },
  { 
    name: 'Analytics', 
    href: (role: string) => '/officer/analytics', 
    icon: ChartBarIcon,
    roles: ['officer']
  },
  { 
    name: 'Notifications', 
    href: (role: string) => `/${role}/notifications`, 
    icon: BellIcon,
    roles: ['user', 'staff', 'officer']
  },
  { 
    name: 'Settings', 
    href: (role: string) => `/${role}/settings`, 
    icon: CogIcon,
    roles: ['user', 'staff', 'officer']
  },
]

interface SidebarProps {
  role: 'user' | 'staff' | 'officer'
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  
  const filteredNavigation = navigation.filter(item => item.roles.includes(role))

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <Link href="/" className="flex items-center focus:outline-none">
          {/* Logo container with proper sizing */}
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
            <Image
              src="/navbar-logo.png"
              alt="Digital E-Panchayat Logo"
              width={40}
              height={40}
              className="object-contain w-full h-full"
            />
          </div>
          <span className="ml-2 text-sm sm:text-lg font-heading font-bold text-gray-900 hidden md:block">
            Digital E-Panchayat
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const href = item.href(role)
            const isActive = pathname === href || pathname.startsWith(href + '/')
            
            return (
              <Link
                key={item.name}
                href={href}
                className={`${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-primary-700 border-l-4 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-r-lg transition-all duration-200`}
              >
                <Icon
                  className={`${
                    isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-5 w-5 sm:h-6 sm:w-6`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}