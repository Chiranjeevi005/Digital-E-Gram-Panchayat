import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from './client-layout'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Digital E-Panchayat',
  description: 'A digital platform for village-level governance services',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen">
        <ThemeProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}