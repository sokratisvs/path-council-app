'use client'

import { useEffect, useState } from 'react'
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { setupVault, unlockVault, generateSalt } from '@/lib/vault/client'
import { readVaultEntry, writeVaultEntry, clearVault } from '@/lib/vault/idb'

interface VaultScreenProps {
  onUnlocked: () => void
}

type Mode = 'loading' | 'setup' | 'unlock'
type Status = 'idle' | 'busy' | 'error'

export function VaultScreen({ onUnlocked }: VaultScreenProps) {
  const [mode, setMode] = useState<Mode>('loading')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    readVaultEntry('vault_salt').then((salt) => {
      setMode(salt ? 'unlock' : 'setup')
    })
  }, [])

  async function handleSetup(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setStatus('busy')
    try {
      const salt = generateSalt()
      const verificationToken = await setupVault(password, salt)
      await writeVaultEntry('vault_salt', salt)
      await writeVaultEntry('vault_verification', verificationToken)
      onUnlocked()
    } catch {
      setError('Failed to create vault. Please try again.')
      setStatus('error')
    }
  }

  async function handleUnlock(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setStatus('busy')
    try {
      const salt = await readVaultEntry('vault_salt')
      const token = await readVaultEntry('vault_verification')
      if (!salt || !token) {
        setError('Vault data not found. Try resetting.')
        setStatus('error')
        return
      }
      const ok = await unlockVault(password, salt, token)
      if (ok) {
        onUnlocked()
      } else {
        setError('Wrong password. Try again.')
        setStatus('idle')
      }
    } catch {
      setError('Failed to unlock vault. Please try again.')
      setStatus('error')
    }
  }

  async function handleReset() {
    if (!window.confirm('This will erase all local data. Continue?')) return
    await clearVault()
    setMode('setup')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setStatus('idle')
  }

  if (mode === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="flex items-center gap-2 text-muted text-sm">
          <Lock className="h-4 w-4 animate-pulse" />
          Loading…
        </div>
      </div>
    )
  }

  const isSetup = mode === 'setup'
  const busy = status === 'busy'

  return (
    <div className="flex min-h-screen bg-base">
      {/* Left panel */}
      <div className="hidden md:flex md:w-[420px] flex-col justify-between h-screen bg-surface border-r border-default p-10">
        <div>
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-primary font-medium text-sm">PathCouncil</span>
          </div>
          <h2 className="text-primary text-2xl font-semibold leading-snug mb-3">
            Your next chapter,<br />debated honestly.
          </h2>
          <p className="text-secondary text-sm leading-relaxed">
            A council of AI specialists analyses your profile, challenges each other,
            and surfaces three grounded paths — with confidence scores to match.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { icon: ShieldCheck, label: 'All data encrypted in your browser — never sent to us' },
            { icon: KeyRound, label: "Your vault password is the only key. We don't have a copy." },
            { icon: Lock, label: 'Export your vault as an encrypted file anytime' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-start gap-2.5 bg-subtle rounded-xl px-3 py-2.5">
              <Icon className="h-4 w-4 text-muted shrink-0 mt-0.5" />
              <span className="text-muted text-xs leading-relaxed">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4 md:hidden">
              <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="text-primary text-sm font-medium">PathCouncil</span>
            </div>
            <h1 className="text-primary text-xl font-semibold">
              {isSetup ? 'Create your vault' : 'Unlock your vault'}
            </h1>
            <p className="text-secondary text-sm mt-1">
              {isSetup
                ? 'Choose a password to encrypt your sessions. We never see it.'
                : 'Enter your vault password to access your sessions.'}
            </p>
          </div>

          <form onSubmit={isSetup ? handleSetup : handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <label className="text-secondary text-sm font-medium">
                {isSetup ? 'Vault password' : 'Password'}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSetup ? 'at least 8 characters' : '••••••••'}
                  required
                  minLength={8}
                  autoFocus
                  className="bg-elevated border-default text-primary placeholder:text-faint rounded-2xl pr-10 focus-visible:ring-brand/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isSetup && (
              <div className="space-y-2">
                <label className="text-secondary text-sm font-medium">Confirm password</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="same password again"
                  required
                  className="bg-elevated border-default text-primary placeholder:text-faint rounded-2xl focus-visible:ring-brand/40"
                />
              </div>
            )}

            {error && <p className="text-danger text-xs">{error}</p>}

            <Button
              type="submit"
              disabled={busy}
              className={cn(
                'w-full rounded-2xl bg-brand hover:bg-brand/90 text-white',
                busy && 'opacity-60 cursor-not-allowed'
              )}
            >
              {busy
                ? isSetup ? 'Creating vault…' : 'Unlocking…'
                : isSetup ? 'Create vault' : 'Unlock'}
            </Button>
          </form>

          {busy && (
            <p className="text-center text-muted text-xs">
              {isSetup ? 'Generating encryption key…' : 'Deriving key from password…'} this takes a moment.
            </p>
          )}

          {!isSetup && (
            <p className="text-center text-faint text-xs">
              Forgot your password?{' '}
              <button
                type="button"
                onClick={handleReset}
                className="text-muted hover:text-secondary underline"
              >
                Reset vault
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
