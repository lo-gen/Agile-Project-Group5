import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../context/AuthContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, signup } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setIsSubmitting(true)

    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await signup(email, password)
      }
      onClose()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm rounded-lg bg-eco-panel p-6 shadow-lg">
        <div className="mb-6 flex gap-2 border-b border-eco-border">
          <button
            onClick={() => {
              setTab('login')
              setLocalError(null)
            }}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === 'login'
                ? 'border-b-2 border-eco-green text-eco-green'
                : 'text-eco-muted hover:text-eco-text'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setTab('signup')
              setLocalError(null)
            }}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === 'signup'
                ? 'border-b-2 border-eco-green text-eco-green'
                : 'text-eco-muted hover:text-eco-text'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-eco-text">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-eco-text placeholder-eco-muted focus:border-eco-green focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-eco-text">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-eco-text placeholder-eco-muted focus:border-eco-green focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {localError && (
            <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">{localError}</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-eco-green px-4 py-2 text-sm font-medium text-eco-bg transition hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Loading...' : tab === 'login' ? 'Log In' : 'Sign Up'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-eco-border px-4 py-2 text-sm font-medium text-eco-text transition hover:border-eco-green hover:text-eco-green"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
