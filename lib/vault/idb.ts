'use client'

const DB_NAME = 'pathcouncil_db'
const DB_VERSION = 1

const STORES = {
  SESSIONS: 'pathcouncil_sessions',
  GRAPHS:   'pathcouncil_graphs',
  MEMORY:   'pathcouncil_memory',
  VAULT:    'pathcouncil_vault',
} as const

// Singleton — one indexedDB.open() per app lifetime, shared across all callers.
let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          const s = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' })
          s.createIndex('createdAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains(STORES.GRAPHS))
          db.createObjectStore(STORES.GRAPHS)
        if (!db.objectStoreNames.contains(STORES.MEMORY))
          db.createObjectStore(STORES.MEMORY)
        if (!db.objectStoreNames.contains(STORES.VAULT))
          db.createObjectStore(STORES.VAULT)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => {
        dbPromise = null  // allow retry on next call
        reject(req.error)
      }
    })
  }
  return dbPromise
}

async function idbPut(storeName: string, key: string, value: unknown): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readwrite').objectStore(storeName).put(value, key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

async function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readonly').objectStore(storeName).get(key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

async function idbDelete(storeName: string, key: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// ── Sessions ──────────────────────────────────────────────────────────────

export async function writeSession(id: string, ciphertext: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORES.SESSIONS, 'readwrite')
      .objectStore(STORES.SESSIONS)
      .put({ id, ciphertext, createdAt: new Date().toISOString() })
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function readSession(id: string): Promise<string | null> {
  const record = await idbGet<{ ciphertext: string }>(STORES.SESSIONS, id)
  return record?.ciphertext ?? null
}

// Uses the createdAt index with 'prev' direction — IDB returns records
// newest-first natively, no JS sort needed.
export async function listSessionMeta(): Promise<{ id: string; createdAt: string }[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const results: { id: string; createdAt: string }[] = []
    const req = db.transaction(STORES.SESSIONS, 'readonly')
      .objectStore(STORES.SESSIONS)
      .index('createdAt')
      .openCursor(null, 'prev')
    req.onsuccess = () => {
      const cursor = req.result
      if (cursor) {
        const { id, createdAt } = cursor.value as { id: string; createdAt: string }
        results.push({ id, createdAt })
        cursor.continue()
      } else {
        resolve(results)
      }
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

// Cursor-based — avoids the getAll+getAllKeys race where onsuccess order
// between two parallel requests on the same transaction is not guaranteed.
export async function readAllMemory(): Promise<Record<string, string>> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const result: Record<string, string> = {}
    const req = db.transaction(STORES.MEMORY, 'readonly')
      .objectStore(STORES.MEMORY)
      .openCursor()
    req.onsuccess = () => {
      const cursor = req.result
      if (cursor) {
        result[cursor.key as string] = cursor.value as string
        cursor.continue()
      } else {
        resolve(result)
      }
    }
    req.onerror = () => reject(req.error)
  })
}

// ── Vault entries (salt, verification token) ──────────────────────────────

export async function writeVaultEntry(key: string, value: string): Promise<void> {
  return idbPut(STORES.VAULT, key, value)
}

export async function readVaultEntry(key: string): Promise<string | null> {
  return idbGet<string>(STORES.VAULT, key)
}

export async function clearVault(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORES.VAULT, 'readwrite').objectStore(STORES.VAULT).clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// Clears every store in one transaction — used on vault reset so no
// orphaned encrypted data remains after the key is destroyed.
export async function clearAllData(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(Object.values(STORES), 'readwrite')
    for (const name of Object.values(STORES)) tx.objectStore(name).clear()
    tx.oncomplete = () => resolve()
    tx.onerror   = () => reject(tx.error)
    tx.onabort   = () => reject(tx.error)
  })
}
