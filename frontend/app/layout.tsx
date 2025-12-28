import type { Metadata } from 'next'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "next-themes";
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'
import Providers from '@/components/Providers'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Veil',
  description: 'Encrypted document intelligence. Search millions of documents without exposing your sources.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground font-sans antialiased',
          outfit.variable,
          jetbrainsMono.variable
        )}
      >
      <ThemeProvider attribute="class" defaultTheme="system">
        <div className="relative flex min-h-screen flex-col bg-background">
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </div>
      </ThemeProvider>
      </body>
    </html>
  )
}
