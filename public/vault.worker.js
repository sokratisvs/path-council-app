// Vault Web Worker — AES-256-GCM encryption with PBKDF2 key derivation.
// The CryptoKey is non-extractable and never leaves this worker.

let vaultKey = null

const enc = new TextEncoder()
const dec = new TextDecoder()

function b64urlEncode(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function b64urlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - str.length % 4) % 4, '=')
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0))
}

async function deriveKey(password, saltB64) {
  const salt = b64urlDecode(saltB64)
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 300_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable
    ['encrypt', 'decrypt']
  )
}

async function encryptText(plaintext) {
  if (!vaultKey) throw new Error('Vault locked')
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    vaultKey,
    enc.encode(plaintext)
  )
  // Prepend IV to ciphertext
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.byteLength)
  return b64urlEncode(combined)
}

async function decryptText(ciphertextB64) {
  if (!vaultKey) throw new Error('Vault locked')
  const combined = b64urlDecode(ciphertextB64)
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    vaultKey,
    ciphertext
  )
  return dec.decode(plaintext)
}

self.onmessage = async ({ data }) => {
  try {
    switch (data.type) {
      case 'derive': {
        vaultKey = await deriveKey(data.password, data.salt)
        // Create verification token to send back
        const token = await encryptText('path-council-v1')
        self.postMessage({ type: 'derived', verificationToken: token })
        break
      }
      case 'verify': {
        vaultKey = await deriveKey(data.password, data.salt)
        try {
          const plaintext = await decryptText(data.verificationToken)
          if (plaintext !== 'path-council-v1') throw new Error('mismatch')
          self.postMessage({ type: 'verified', ok: true })
        } catch {
          vaultKey = null
          self.postMessage({ type: 'verified', ok: false })
        }
        break
      }
      case 'encrypt': {
        const ciphertext = await encryptText(data.plaintext)
        self.postMessage({ type: 'encrypted', ciphertext, id: data.id })
        break
      }
      case 'decrypt': {
        const plaintext = await decryptText(data.ciphertext)
        self.postMessage({ type: 'decrypted', plaintext, id: data.id })
        break
      }
      case 'clear': {
        vaultKey = null
        self.postMessage({ type: 'cleared' })
        break
      }
      case 'status': {
        self.postMessage({ type: 'status', locked: vaultKey === null })
        break
      }
    }
  } catch (err) {
    self.postMessage({ type: 'error', message: err instanceof Error ? err.message : 'Unknown error', id: data.id })
  }
}
