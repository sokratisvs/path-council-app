'use client'

const DB_NAME = 'pathcouncil_db'
const DB_VERSION = 1

const STORES = {
  SESSIONS: 'pathcouncil_sessions',
  GRAPHS: 'pathcouncil_graphs',
  MEMORY: 'pathcouncil_memory',
  VAULT: 'pathcouncil_vault',
} as const

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        const s = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' })
        s.createIndex('createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains(STORES.GRAPHS)) {
        db.createObjectStore(STORES.GRAPHS)
      }
      if (!db.objectStoreNames.contains(STORES.MEMORY)) {
        db.createObjectStore(STORES.MEMORY)
      }
      if (!db.objectStoreNames.contains(STORES.VAULT)) {
        db.createObjectStore(STORES.VAULT)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function idbPut(storeName: string, key: string, value: unknown): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB()
    const tx = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).put(value, key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB()
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).get(key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

function idbDelete(storeName: string, key: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB()
    const tx = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).delete(key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// ── Sessions ──────────────────────────────────────────────────────────────

export async function writeSession(id: string, ciphertext: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SESSIONS, 'readwrite')
    const req = tx.objectStore(STORES.SESSIONS).put({ id, ciphertext, createdAt: new Date().toISOString() })
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function readSession(id: string): Promise<string | null> {
  const record = await idbGet<{ ciphertext: string }>(STORES.SESSIONS, id)
  return record?.ciphertext ?? null
}

export async function listSessionMeta(): Promise<{ id: string; createdAt: string }[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB()
    const tx = db.transaction(STORES.SESSIONS, 'readonly')
    const index = tx.objectStore(STORES.SESSIONS).index('createdAt')
    const req = index.getAll()
    req.onsuccess = () => {
      const records = (req.result as { id: string; createdAt: string }[])
      resolve(records.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    }
    req.onerror = () => reject(req.error)
  })
}

export async function deleteSession(id: string): Promise<void> {
  return idbDelete(STORES.SESSIONS, id)
}

// ── Career graph ──────────────────────────────────────────────────────────

export async function writeGraph(ciphertext: string): Promise<void> {
  return idbPut(STORES.GRAPHS, 'user_graph', ciphertext)
}

export async function readGraph(): Promise<string | null> {
  return idbGet<string>(STORES.GRAPHS, 'user_graph')
}

// ── Agent memory ──────────────────────────────────────────────────────────

export async function writeMemory(agentId: string, ciphertext: string): Promise<void> {
  return idbPut(STORES.MEMORY, agentId, ciphertext)
}

export async function readMemory(agentId: string): Promise<string | null> {
  return idbGet<string>(STORES.MEMORY, agentId)
}

export async function readAllMemory(): Promise<Record<string, string>> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB()
    const tx = db.transaction(STORES.MEMORY, 'readonly')
    const req = tx.objectStore(STORES.MEMORY).getAll()
    const keyReq = tx.objectStore(STORES.MEMORY).getAllKeys()
    const result: Record<string, string> = {}
    keyReq.onsuccess = () => {
      const keys = keyReq.result as string[]
      req.onsuccess = () => {
        const values = req.result as string[]
        keys.forEach((k, i) => { result[k] = values[i] })
        resolve(result)
      }
    }
    req.onerror = () => reject(req.error)
  })
}

// ── Vault entries (api key, salt, provider, model) ────────────────────────

export async function writeVaultEntry(key: string, value: string): Promise<void> {
  return idbPut(STORES.VAULT, key, value)
}

export async function readVaultEntry(key: string): Promise<string | null> {
  return idbGet<string>(STORES.VAULT, key)
}

export async function clearVault(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = await openDB()
    const tx = db.transaction(STORES.VAULT, 'readwrite')
    const req = tx.objectStore(STORES.VAULT).clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}
