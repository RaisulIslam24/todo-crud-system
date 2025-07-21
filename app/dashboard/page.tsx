'use client'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUserEmail(user.email!)
      else router.push('/login')
    })
    return () => unsub()
  }, [])

  const logout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl">Welcome, {userEmail}</h1>
        <nav className="space-x-4">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/todos">Todos</Link>
          <button onClick={logout} className="text-red-500">Logout</button>
        </nav>
      </div>
      <p>This is your dashboard.</p>
    </div>
  )
}
