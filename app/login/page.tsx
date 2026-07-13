'use client'

import { useState, FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const params = useSearchParams()
  const from = params.get('from') || '/'
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    if (res.ok) {
      // Full-document navigation so the browser sends the freshly-set
      // hg_auth cookie and middleware evaluates it on a clean request.
      // A soft router.push() can race the Set-Cookie commit and get
      // bounced back to /login.
      window.location.assign(from)
    } else {
      setError('Incorrect access code. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">📸</span>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mt-3">Honeymoon Gallery</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter your access code to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Access code"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 text-center text-xl tracking-widest"
            autoFocus
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition-colors"
          >
            {loading ? 'Verifying…' : 'Enter Gallery'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-gray-400">Loading…</span></div>}>
      <LoginForm />
    </Suspense>
  )
}
