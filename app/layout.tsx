import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ForwardProvider } from './forward-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Dima's Toys Shop",
  description: "Support global causes and initiatives at Dima's Toys Shop",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            <ForwardProvider>
              {children}
            </ForwardProvider>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}