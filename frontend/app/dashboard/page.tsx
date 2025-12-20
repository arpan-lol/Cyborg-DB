'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const jwt = searchParams.get('jwt')
    
    if (jwt) {
      fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: jwt }),
      })
        .then(() => {
          router.replace('/dashboard/sessions')
        })
        .catch((error) => {
          console.error('Failed to set JWT cookie:', error)
          router.replace('/auth/login?error=token_failed')
        })
    } else {
      router.replace('/dashboard/sessions')
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
}
