'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
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
    name: 'Services', 
    href: (role: string) => role === 'Citizens' ? '/citizen/services' : '/officer/services',
    icon: BuildingOfficeIcon,
    roles: ['Citizens', 'Officer']
  },
  { 
    name: 'My Applications', 
    href: (role: string) => '/citizen/applications', 
    icon: DocumentTextIcon,
    roles: ['Citizens']
  },
  { 
    name: 'Download History', 
    href: (role: string) => '/citizen/downloads', 
    icon: ArrowDownTrayIcon,
    roles: ['Citizens']
  },
  { 
    name: 'Assigned Applications', 
    href: (role: string) => '/staff/applications', 
    icon: ClipboardIcon,
    roles: ['Staff']
  },
  { 
    name: 'All Applications', 
    href: (role: string) => '/officer/applications', 
    icon: ClipboardIcon,
    roles: ['Officer']
  },
  { 
    name: 'Download Management', 
    href: (role: string) => '/officer/downloads', 
    icon: ArrowDownTrayIcon,
    roles: ['Officer']
  },
  { 
    name: 'Users', 
    href: (role: string) => '/officer/users', 
    icon: UsersIcon,
    roles: ['Officer']
  },
  { 
    name: 'Analytics', 
    href: (role: string) => '/officer/analytics', 
    icon: ChartBarIcon,
    roles: ['Officer']
  },
  { 
    name: 'Notifications', 
    href: (role: string) => {
      if (role === 'Citizens') {
        return '/citizen/notifications';
      }
      return `/${role.toLowerCase()}/notifications`;
    }, 
    icon: BellIcon,
    roles: ['Citizens', 'Staff', 'Officer']
  },
  { 
    name: 'Settings', 
    href: (role: string) => {
      if (role === 'Citizens') {
        return '/citizen/settings';
      }
      return `/${role.toLowerCase()}/settings`;
    }, 
    icon: CogIcon,
    roles: ['Citizens', 'Staff', 'Officer']
  },
]

interface SidebarProps {
  role: 'Citizens' | 'Staff' | 'Officer'
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  
  const filteredNavigation = navigation.filter(item => item.roles.includes(role))

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-14 sm:h-16 px-3 sm:px-4 border-b border-gray-200">
        <Link href="/" className="flex items-center focus:outline-none">
          {/* Logo container with proper sizing for all devices */}
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
            <img
              src="/navbar-logo.png"
              alt="Digital E-Panchayat Logo"
              className="object-contain w-full h-full"
              width={32}
              height={32}
            />
          </div>
          {/* Brand name - visible on all devices with responsive text sizing */}
          <span className="ml-2 sm:ml-3 text-sm sm:text-base font-heading font-bold text-gray-900 whitespace-nowrap overflow-hidden">
            Digital Gram Panchayat
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-3 sm:py-4">
        <nav className="px-2 space-y-0.5 sm:space-y-1">
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
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-primary-700 border-l-2 sm:border-l-4 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-r-lg transition-all duration-200`}
              >
                <Icon
                  className={`${
                    isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-2 sm:mr-3 flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5`}
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