import { useAuth } from '../../context/AuthContext'

interface AuthButtonProps {
  onLoginClick: () => void
}

export default function AuthButton({ onLoginClick }: AuthButtonProps) {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <button disabled className="px-3 py-1.5 text-xs font-medium text-eco-muted">
        Loading...
      </button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-eco-muted">{user.email}</span>
        <button
          onClick={logout}
          className="rounded-md border border-eco-border px-3 py-1.5 text-xs font-medium text-eco-text transition hover:border-eco-green hover:text-eco-green"
        >
          Log Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={onLoginClick}
      className="rounded-md border border-eco-border px-3 py-1.5 text-xs font-medium text-eco-text transition hover:border-eco-green hover:text-eco-green"
    >
      Log In
    </button>
  )
}
