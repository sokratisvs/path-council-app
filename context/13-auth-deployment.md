# Feature 13: Vault Auth, Encryption, and Deployment

Read `ai-workflow-rules.md` before starting.

This feature establishes the full-stack foundation: vault-based client-side auth, zero-knowledge encryption, and deployment. Complete it after Feature 01 (Design System) and before Feature 02 (Setup Screen).

## Scope

- Vault-based auth (no server accounts, no external auth service)
- AES-256-GCM encryption layer via Web Worker
- IndexedDB persistence layer
- Vault setup + unlock screen
- Local dev setup
- VPS deployment guide

---

## 1. Local Development Setup

After cloning the repo:

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

App is available at `http://localhost:3000`.

**That's it.** No database, no migrations, no environment variables, no external services required. All user data is stored in the browser's IndexedDB.

The first time you open the app you will be prompted to create a vault password. On every subsequent visit you enter that password to unlock the vault. Clearing browser data resets the vault — you will be asked to create a new one.

---

## 2. Vault Auth Architecture

There are no user accounts. The vault password is the only credential. All user data lives in the browser's IndexedDB, encrypted with a key derived from the vault password via PBKDF2.

### Key files

```
public/vault.worker.js       — Web Worker: PBKDF2 key derivation + AES-256-GCM crypto
                               CryptoKey is non-extractable, never leaves the worker

lib/vault/client.ts          — Main-thread API (postMessage bridge to worker)
                               Exports: generateSalt, setupVault, unlockVault,
                                        lockVault, encrypt, decrypt, isVaultLocked

lib/vault/idb.ts             — IndexedDB helpers for all 4 stores
                               Exports: read/write/clear for sessions, graph, memory, vault

components/vault/vault-screen.tsx  — Vault setup + unlock UI (shown at app boot)
components/compass-root.tsx        — Root orchestrator: 'vault' | 'app' state
```

### Worker messages

```
derive  { password, salt }    → derived (key derived from PBKDF2)
verify  { ciphertext }        → verified { ok: boolean }
encrypt { plaintext }         → encrypted { ciphertext }
decrypt { ciphertext }        → decrypted { plaintext }
clear                         → cleared (wipes the key)
status                        → status { locked: boolean }
```

### Vault setup (first use)

```ts
const salt = generateSalt()                           // 16-byte base64url, sync
const verificationToken = await setupVault(password, salt)
await writeVaultEntry('vault_salt', salt)
await writeVaultEntry('vault_verification', verificationToken)
// → onUnlocked()
```

### Vault unlock (returning user)

```ts
const salt  = await readVaultEntry('vault_salt')
const token = await readVaultEntry('vault_verification')
const ok    = await unlockVault(password, salt, token)
// ok → onUnlocked() | !ok → show error
```

### Reset vault

```ts
await clearVault()   // wipes all 4 IDB stores
// → show setup mode
```

---

## 3. IndexedDB Schema

DB name: `pathcouncil_db`, version: 1.

```
pathcouncil_sessions   keyPath: 'id'    index: createdAt
pathcouncil_graphs     keyPath: 'key'
pathcouncil_memory     keyPath: 'key'
pathcouncil_vault      keyPath: 'key'
```

All values are AES-256-GCM ciphertext (base64url). Exceptions: `vault_salt`, `provider`, `model` stored as plaintext (non-sensitive).

---

## 4. Environment Variables

No environment variables are required for local development.

For production deployments, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

The only optional variable is `NEXT_PUBLIC_APP_URL` — set this to your domain when deploying to a VPS so that server-side API routes can construct self-referencing URLs correctly.

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 5. Cross-Device Access

There is no cloud sync. To use your data on another device:

1. In the app, go to **Settings → Export vault**.
2. Download `compass-backup-YYYY-MM-DD.compassenc`.
3. On the second device, open the app and go to **Settings → Import vault**.
4. Select the file and enter your vault password.

The `.compassenc` file is AES-256-GCM ciphertext — safe to copy over any channel (USB, email, cloud drive). Without the vault password it is unreadable.

---

## 6. VPS Deployment Guide

Use this when you want the app accessible from a public URL or a team.

### Prerequisites

- Ubuntu 22.04 LTS
- Node.js 22 (via nvm — see below)
- Nginx
- PM2

### Install Node.js 22 via nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
npm install -g pm2
```

### Initial deploy

```bash
# Clone the repo
git clone https://github.com/your-org/path-council.git
cd path-council

# Install dependencies
npm install

# Set the public URL
echo "NEXT_PUBLIC_APP_URL=https://yourdomain.com" > .env.local

# Build the production app
npm run build

# Start with PM2
pm2 start npm --name "compass" -- start
pm2 save
pm2 startup
```

### Nginx config

Create `/etc/nginx/sites-available/compass`:

```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and get SSL:

```bash
ln -s /etc/nginx/sites-available/compass /etc/nginx/sites-enabled/
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
nginx -t && systemctl reload nginx
```

### Deploy updates

```bash
git pull
npm install
npm run build
pm2 restart compass
```

---

## 7. Files Implemented

**Encryption + storage:**
- `public/vault.worker.js` — Web Worker (PBKDF2 + AES-256-GCM, non-extractable key)
- `lib/vault/client.ts` — Main-thread vault API
- `lib/vault/idb.ts` — IndexedDB helpers (4 stores)

**Vault UI:**
- `components/vault/vault-screen.tsx` — Setup + unlock form (two-column layout)
- `components/compass-root.tsx` — Root state machine (`vault` → `app`)

**App shell:**
- `app/page.tsx` — Entry point → `CompassRoot`
- `components/compass-app.tsx` — App state machine (6 screen placeholders)
- `components/app/app-navbar.tsx` — Logo + "Encrypted locally" badge

**Config:**
- `.env.example` — Documents the single optional env var
- `next.config.ts` — `output: 'standalone'` for VPS builds

---

## Check When Done

- `npm install && npm run dev` starts the app with no errors
- First visit shows "Create your vault" (setup mode)
- Subsequent visits show "Unlock your vault" (unlock mode)
- Wrong password shows error, vault stays locked
- Correct password navigates to the app
- "Reset vault" wipes all data and returns to setup
- `npm run build` passes with no TypeScript errors
