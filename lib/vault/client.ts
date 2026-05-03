'use client'

// Vault client — communicates with the Web Worker.
// The CryptoKey never leaves the worker; this module only passes strings.

type Resolve = (value: unknown) => void
type Reject = (reason: unknown) => void

let worker: Worker | null = null
let idCounter = 0
const pending = new Map<string, { resolve: Resolve; reject: Reject }>()

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
        // One-shot messages (derive, verify, clear, status)
        workerBroadcast(data)
      }
    }
    worker.onerror = (e) => console.error('[vault worker]', e)
  }
  return worker
}

// Simple one-shot promise for messages without an id
const oneShot = new Map<string, Array<Resolve>>()
function workerBroadcast(data: { type: string; [k: string]: unknown }) {
  const listeners = oneShot.get(data.type)
  if (listeners) {
    oneShot.delete(data.type)
    listeners.forEach((fn) => fn(data))
  }
}
function waitFor(type: string): Promise<unknown> {
  return new Promise((resolve) => {
    const existing = oneShot.get(type) ?? []
    oneShot.set(type, [...existing, resolve])
  })
}

function send(type: string, payload: Record<string, unknown> = {}): Promise<unknown> {
  const id = String(++idCounter)
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    getWorker().postMessage({ type, id, ...payload })
  })
}

// ── Public API ────────────────────────────────────────────────────────────

export function generateSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function setupVault(password: string, salt: string): Promise<string> {
  getWorker().postMessage({ type: 'derive', password, salt })
  const result = await waitFor('derived') as { verificationToken: string }
  return result.verificationToken
}

export async function unlockVault(password: string, salt: string, verificationToken: string): Promise<boolean> {
  getWorker().postMessage({ type: 'verify', password, salt, verificationToken })
  const result = await waitFor('verified') as { ok: boolean }
  return result.ok
}

export async function lockVault(): Promise<void> {
  getWorker().postMessage({ type: 'clear' })
  await waitFor('cleared')
}

export async function encrypt(plaintext: string): Promise<string> {
  const result = await send('encrypt', { plaintext }) as { ciphertext: string }
  return result.ciphertext
}

export async function decrypt(ciphertext: string): Promise<string> {
  const result = await send('decrypt', { ciphertext }) as { plaintext: string }
  return result.plaintext
}

export async function isVaultLocked(): Promise<boolean> {
  getWorker().postMessage({ type: 'status' })
  const result = await waitFor('status') as { locked: boolean }
  return result.locked
}
