import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCurrentAdmin } from '@/services/adminService'
import Spinner from '@/components/ui/Spinner'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<unknown>(null)

  useEffect(() => {
    getCurrentAdmin()
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner className="h-10 w-10" />
  if (!user) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}