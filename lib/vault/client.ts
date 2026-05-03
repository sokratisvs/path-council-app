'use client'

// Vault client — communicates with the Web Worker.
// The CryptoKey never leaves the worker; this module only passes strings.

type Resolve = (value: unknown) => void
type Reject = (reason: unknown) => void

let worker: Worker | null = null
let idCounter = 0
const pending = new Map<string, { resolve: Resolve; reject: Reject }>()

// One-shot listeners for no-id messages (derive, verify, clear, status).
// Stores both resolve and reject so worker errors can propagate correctly.
const oneShot = new Map<string, Array<{ resolve: Resolve; reject: Reject }>>()

function rejectAll(err: Error) {
  for (const { reject } of pending.values()) reject(err)
  pending.clear()
  for (const listeners of oneShot.values()) listeners.forEach(({ reject }) => reject(err))
  oneShot.clear()
}

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/vault.worker.js')
    worker.onmessage = ({ data }) => {
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id)!
        pending.delete(data.id)
        if (data.type === 'error') reject(new Error(data.message))
        else resolve(data)
      } else {
        workerBroadcast(data)
      }
    }
    worker.onerror = (e) => {
      console.error('[vault worker]', e)
      rejectAll(new Error('Vault worker crashed'))
      worker = null  // allow re-init on next call
    }
  }
  return worker
}

function workerBroadcast(data: { type: string; [k: string]: unknown }) {
  // Worker-level error with no id: reject every pending waitFor call.
  if (data.type === 'error') {
    rejectAll(new Error((data.message as string) ?? 'Vault worker error'))
    return
  }
  const listeners = oneShot.get(data.type)
  if (listeners) {
    oneShot.delete(data.type)
    listeners.forEach(({ resolve }) => resolve(data))
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Vault operation '${label}' timed out`)), ms)
    ),
  ])
}

function waitFor<T>(type: string): Promise<T> {
  return withTimeout(
    new Promise<T>((resolve, reject) => {
      const existing = oneShot.get(type) ?? []
      oneShot.set(type, [...existing, { resolve: resolve as Resolve, reject }])
    }),
    15_000,
    type
  )
}

function send<T>(type: string, payload: Record<string, unknown> = {}): Promise<T> {
  const id = String(++idCounter)
  return withTimeout(
    new Promise<T>((resolve, reject) => {
      pending.set(id, { resolve: resolve as Resolve, reject })
      getWorker().postMessage({ type, id, ...payload })
    }),
    15_000,
    type
  )
}

// ── Public API ────────────────────────────────────────────────────────────

export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function setupVault(password: string, salt: string): Promise<string> {
  getWorker().postMessage({ type: 'derive', password, salt })
  const result = await waitFor<{ verificationToken: string }>('derived')
  return result.verificationToken
}

export async function unlockVault(password: string, salt: string, verificationToken: string): Promise<boolean> {
  getWorker().postMessage({ type: 'verify', password, salt, verificationToken })
  const result = await waitFor<{ ok: boolean }>('verified')
  return result.ok
}

export async function lockVault(): Promise<void> {
  getWorker().postMessage({ type: 'clear' })
  await waitFor<unknown>('cleared')
}

export async function encrypt(plaintext: string): Promise<string> {
  const result = await send<{ ciphertext: string }>('encrypt', { plaintext })
  return result.ciphertext
}

export async function decrypt(ciphertext: string): Promise<string> {
  const result = await send<{ plaintext: string }>('decrypt', { ciphertext })
  return result.plaintext
}

export async function isVaultLocked(): Promise<boolean> {
  getWorker().postMessage({ type: 'status' })
  const result = await waitFor<{ locked: boolean }>('status')
  return result.locked
}
