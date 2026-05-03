# Architecture Context

## Stack

| Layer              | Technology                                   | Role                                                                     |
| ------------------ | -------------------------------------------- | ------------------------------------------------------------------------ |
| Framework          | Next.js 15 + React 19 + TypeScript 5         | Full-stack app, App Router, server components first                      |
| UI                 | Tailwind v4 + shadcn/ui + Radix UI           | Component composition and styling                                        |
| Auth               | Vault password (client-side, v1)             | No server accounts; vault password is the only credential                |
| Database           | None                                         | All data lives in client IndexedDB; no server database                   |
| Encryption         | AES-256-GCM + PBKDF2 (Web Crypto API)        | Zero-knowledge: all encryption in browser via Web Worker; server is compute-only |
| Local Storage      | IndexedDB (encrypted)                        | Device-local encrypted storage — works offline, no server needed         |
| LLM Orchestration  | Server-side provider adapter layer           | Parallel agent calls via `/api/agents/*` — API key sent per-request, never persisted |
| Deployment         | VPS + PM2 + Nginx (self-hosted)              | Single target in v1; Vercel cloud deployment is optional                 |
| Icons              | Lucide React                                 | Stroke-based icon set                                                    |

## System Boundaries

- `lib/vault/` — Zero-knowledge encryption layer (Web Crypto API, client-side only). PBKDF2 key derivation, AES-256-GCM encrypt/decrypt, IndexedDB persistence, encrypted file export/import.
- `lib/providers/` — Provider-agnostic LLM adapter layer. One adapter per provider. Called only from API routes — API key received per-request, used once, never stored.
- `lib/agents/` — Agent definitions, persona library, knowledge graph builder, profile serialiser, and output parsers.
- `lib/scoring/` — Disagreement scoring logic: consensus calculation, alignment analysis.
- `app/api/agents/` — API routes: run council, run synthesis, run challenge, generate mentor prompts.
- `app/api/session/` — API routes: save session, load session, list sessions.
- `components/vault/` — Vault unlock and setup screen (shown at app boot, before any other screen).
- `components/setup/` — Provider selection, API key entry (encrypted to IndexedDB), model selection, agent council config.
- `components/questionnaire/` — Four-step profile questionnaire. Step controller and individual step components.
- `components/arena/` — Live agent debate view: animated agent turns, progress tracking, streaming status.
- `components/results/` — Results screen: path cards, consensus scores, agent voices, mentor prompts, challenge mode.

## Auth Architecture (v1 — Vault Only)

There are no server accounts in v1. Authentication is entirely client-side: the vault password is the only credential. The vault screen (`components/vault/vault-screen.tsx`) is shown on every app load until the correct password is entered.

```
App load
  └── readVaultEntry('vault_salt') from IndexedDB
        ├── salt not found → 'setup' mode (first use — create vault)
        └── salt found     → 'unlock' mode (returning user — enter password)

Setup flow:
  1. User enters vault password + confirm
  2. generateSalt() → 16-byte random base64url salt
  3. setupVault(password, salt) → derives key via PBKDF2, encrypts 'path-council-v1' → verificationToken
  4. writeVaultEntry('vault_salt', salt)
  5. writeVaultEntry('vault_verification', verificationToken)
  6. onUnlocked() → navigate to app

Unlock flow:
  1. User enters vault password
  2. Read salt + verificationToken from IndexedDB
  3. unlockVault(password, salt, token) → re-derives key, attempts decrypt of token
  4. ok → onUnlocked() | fail → 'Wrong password'
```

`components/compass-root.tsx` orchestrates state: `'vault' | 'app'`. Vault screen renders first; on success `setState('app')` reveals the full app.

The vault `CryptoKey` lives inside `public/vault.worker.js` — a dedicated Web Worker. The main thread communicates via postMessage and never holds the raw key.

There are no plans to add server-side auth in the current roadmap. Cross-device access is handled by exporting an encrypted `.compassenc` file and importing it on the second device.

## LLM Call Architecture

All LLM calls run **server-side** via Next.js API routes. The client decrypts the API key locally (from IndexedDB using the vault key) and sends it in the HTTPS request body. The server uses it for LLM calls and immediately discards it — it is never logged, stored, or returned.

```
Client: vaultKey = PBKDF2(vaultPassword, salt)            [in Web Worker only]
Client: apiKey = AES-GCM-decrypt(storedCiphertext, vaultKey)
Client → POST /api/agents/run { apiKey, sessionId }       [HTTPS, TLS]
Server: run Promise.allSettled([agent1...agent5])          [uses apiKey]
Server: run scoring pass
Server: run synthesis
Server: discard apiKey                                     [never stored]
Server → return { agentOutputs, consensusScores, synthesis } [plaintext]
Client: encrypt results with vaultKey
Client: store ciphertext in IndexedDB
```

- The server is a **compute relay** — it executes LLM calls but cannot read any user data.
- Agent calls run in parallel using `Promise.allSettled`.
- Synthesis runs sequentially after all agents settle.
- Challenge mode calls only Realist, Critic, Strategist in parallel.
- Streaming: server sends SSE chunks (plaintext); client buffers and encrypts on completion.

## Provider Adapter Interface

```ts
// lib/providers/types.ts
export interface LLMCallParams {
  apiKey: string
  model: string
  systemPrompt: string
  userMessage: string
  maxTokens?: number
  stream?: boolean
}

export type LLMCallResult =
  | { ok: true; content: string }
  | { ok: false; error: string }

export interface LLMAdapter {
  call(params: LLMCallParams): Promise<LLMCallResult>
  stream?(params: LLMCallParams): ReadableStream
}
```

Supported providers: `anthropic` | `openai` | `google` | `mistral` | `groq`.

## Persona Agent Architecture (Knowledge-Graph Enriched)

Inspired by the OASIS/MiroFish multi-agent approach. Instead of static prompts, each agent receives a dynamically enriched context built from a lightweight career knowledge graph derived from the user's profile.

### Career Knowledge Graph — Client-Side Model

Built server-side via a lightweight LLM extraction pass (fast/cheap model, ~2–4s), returned to the client as part of the run response, then **encrypted and persisted in IndexedDB** by the client. The server never stores the graph.

The graph build runs **in parallel with the user reviewing their questionnaire answers** — not sequentially before the agent run. This eliminates the perceived latency:

```
User submits questionnaire step 4
  ├─ render "Review your answers" screen  (instant)
  └─ fire POST /api/graph/build           (non-blocking, parallel)

User clicks "Start session"
  ├─ if graph ready → agents start immediately
  └─ if still building → "Preparing your profile…" (1–3s at most)

Arena opens → agents stream responses
```

The graph is stored separately from the session blob so it can be loaded independently for continuity runs — the agent enrichment step needs the graph but not the full session results.

```ts
// lib/agents/knowledge-graph.ts — canonical client-side model

export type NodeType =
  | 'role'        // current or past job title / function
  | 'skill'       // hard or soft skill
  | 'industry'    // sector or domain
  | 'constraint'  // time, money, geography, family, health
  | 'aspiration'  // desired future state or outcome
  | 'strength'    // self-identified or implied advantage
  | 'gap'         // self-identified skill or experience gap
  | 'value'       // what energises or motivates the user

export type EdgeRelation =
  | 'has_skill'
  | 'targets'
  | 'constrained_by'
  | 'energised_by'
  | 'worried_about'
  | 'aspires_to'
  | 'lacks'
  | 'conflicts_with'

export interface CareerNode {
  id: string                           // nanoid, stable across sessions
  type: NodeType
  label: string                        // human-readable, extracted from user text
  weight: number                       // 0–1: prominence in the user's profile
  attributes: Record<string, string>   // free-form: e.g. { yearsExperience: '5', level: 'senior' }
  firstSeenAt: string                  // ISO — session where this node first appeared
  updatedAt: string                    // ISO — last session that touched this node
}

export interface CareerEdge {
  id: string
  from: string         // CareerNode.id
  to: string           // CareerNode.id
  relation: EdgeRelation
  strength: number     // 0–1
  createdAt: string    // ISO
}

export interface CareerGraph {
  version: number      // bump when schema changes; used to migrate stale graphs
  sessionId: string    // session that produced this graph version
  builtAt: string      // ISO
  nodes: CareerNode[]
  edges: CareerEdge[]
}
```

**Graph lifecycle:**

```
First session:
  server builds CareerGraph from profile → returns it
  client stores encrypted graph: writeGraph(encrypt(graph))

Continuity session:
  client reads graph from IndexedDB → decrypts → sends to server with updated profile
  server merges new nodes/edges into existing graph (additive, no deletions)
  server returns updated graph → client re-encrypts and overwrites IndexedDB entry

Node identity:
  nodes are matched by (type + normalised label) across sessions
  existing node weight is updated via rolling average — not replaced
  new nodes are appended; no node is ever deleted (weight decays toward 0 over time)
```

**Agent-specific graph filters** (used by `lib/agents/persona-enricher.ts`):

```ts
// Realist   → nodes: constraint + gap + role  (sorted by weight desc)
// Optimist  → nodes: strength + aspiration + value
// Critic    → nodes: gap + constraint, edges: conflicts_with + worried_about
// Strategist → nodes: skill + aspiration + targets  (compounding path angle)
// AI Coach  → nodes: skill + role + targets  (AI acceleration angle)
// Max 6 nodes per agent prompt to avoid context bloat
```

### Agent Persona Enrichment

Each agent receives a persona-enriched system prompt built from:
1. Base role prompt (static, per agent)
2. Selected persona prefix (from curated library)
3. Graph-derived context: relevant nodes filtered by agent role

```ts
// lib/agents/persona-enricher.ts
export function buildEnrichedPrompt(
  agent: AgentDefinition,
  personaId: string | null,
  graph: CareerGraph,
  profile: UserProfile
): string
```

### Agent Memory — Client-Side Model

Each agent maintains a compressed memory of previous sessions, stored per-agent in IndexedDB (encrypted). Memory lives on the client only — no cloud sync in v1.

```ts
// lib/agents/memory.ts — canonical client-side model

export interface AgentSessionMemory {
  sessionId: string
  savedAt: string                                          // ISO
  keyInsights: string[]                                    // 3–5 bullets from agent's output
  stanceOnPaths: Record<string, 'support' | 'neutral' | 'oppose'>
  graphSnapshotIds: string[]                               // node IDs the agent found most relevant
}

export interface AgentMemory {
  agentId: AgentId
  sessions: AgentSessionMemory[]   // capped at last 3 sessions; oldest dropped on overflow
  updatedAt: string                // ISO
}

// Store: 'pathcouncil_memory'
// Key: agentId  (5 records max — one per specialist agent)
// Value: base64url ciphertext of JSON-serialised AgentMemory
```

**Memory retrieval modes:**

```
QuickRecall    → sessions[0] only (most recent)        — used in challenge mode
HistoryRead    → sessions[0..2] (all stored)           — used in continuity revisit
DeepSynthesis  → cross-session insight diff            — used in long-term continuity reports
```

## Client-Side Storage Schema (IndexedDB)

All persistent client data lives in a single IndexedDB database named `pathcouncil_db` (version 1). Every value stored is AES-256-GCM ciphertext — nothing is written in plaintext except non-secret config entries (provider id, model id).

```
pathcouncil_db
├── store: pathcouncil_sessions
│   key:   sessionId (string)
│   value: encrypt(CompassSession)       ← full session: profile + agent outputs + synthesis + consensus
│   index: createdAt                     ← for sorted session list
│
├── store: pathcouncil_graphs
│   key:   'user_graph'                  ← one graph per device, updated across sessions
│   value: encrypt(CareerGraph)          ← nodes + edges, built up over time
│
├── store: pathcouncil_memory
│   key:   agentId                       ← 5 records max (one per specialist agent)
│   value: encrypt(AgentMemory)          ← last 3 sessions of memory per agent
│
└── store: pathcouncil_vault
    key:   'vault_salt'                  ← base64url, 16 bytes (non-secret)
    key:   'vault_verification'          ← AES-GCM ciphertext of 'path-council-v1'
    key:   'api_key'                     ← AES-GCM encrypted LLM provider API key
    key:   'provider'                    ← selected provider id (plaintext)
    key:   'model'                       ← selected model id (plaintext)
```

**lib/vault/idb.ts** manages all IndexedDB access. No other module reads/writes IndexedDB directly.

```ts
export async function openDB(): Promise<IDBDatabase>

// Sessions
export async function writeSession(sessionId: string, blob: string): Promise<void>
export async function readSession(sessionId: string): Promise<string | null>
export async function listSessionMeta(): Promise<{ id: string; createdAt: string }[]>
export async function deleteSession(sessionId: string): Promise<void>

// Career graph
export async function writeGraph(blob: string): Promise<void>
export async function readGraph(): Promise<string | null>

// Agent memory
export async function writeMemory(agentId: string, blob: string): Promise<void>
export async function readMemory(agentId: string): Promise<string | null>
export async function readAllMemory(): Promise<Record<string, string>>

// Vault (salt, verification token, api key, config)
export async function writeVaultEntry(key: string, value: string): Promise<void>
export async function readVaultEntry(key: string): Promise<string | null>
export async function clearVault(): Promise<void>
```

**CompassSession** — the top-level client model stored per session:

```ts
// lib/storage/types.ts
export interface CompassSession {
  version: number              // schema version; bump to migrate stale sessions
  sessionId: string
  createdAt: string            // ISO
  provider: string
  model: string
  activeAgents: AgentId[]
  agentPersonas: Record<AgentId, string | null>
  profile: UserProfile
  graph: CareerGraph           // snapshot at time of run
  agentOutputs: Record<AgentId, string>
  consensusScores: PathConsensus[]
  synthesis: SynthesisOutput
  challengeExchanges: ChallengeExchange[]
  continuityUpdates: ContinuityUpdate[]   // appended on each revisit
}
```

## Zero-Knowledge Encryption Architecture

All encryption and decryption happens **in the browser using the Web Crypto API**. The server receives only an API key per-request over HTTPS — it has no encryption keys, no user data, and cannot read any stored content.

### Vault Model

```
Vault password (user-memorised, never sent to server)
    │
    ▼  [runs in Web Worker — never blocks main thread]
PBKDF2(vaultPassword, salt, iterations=300_000, keyLen=32, hash='SHA-256')
    │
    ▼
vaultKey: CryptoKey (AES-256-GCM, non-extractable)
    │     ← lives inside the Web Worker only; main thread never holds the raw key
    ├─ encrypt(plaintext) → ciphertext  [via postMessage to worker]
    └─ decrypt(ciphertext) → plaintext  [via postMessage to worker]
```

Salt is a 16-byte random value generated at first setup. Stored in IndexedDB (non-secret). Salt never changes after creation.

**Why 300,000 iterations:** OWASP 2024 recommends ≥210,000 for PBKDF2-SHA-256. 300,000 takes ~600ms in a Web Worker (off main thread, invisible to user) while still being well above the minimum.

### Key Verification

```
At vault creation:
  vaultKey = PBKDF2(vaultPassword, salt)
  verificationToken = AES-GCM-encrypt('path-council-v1', vaultKey)
  writeVaultEntry('vault_salt', salt)
  writeVaultEntry('vault_verification', verificationToken)

On each vault unlock:
  salt = readVaultEntry('vault_salt')
  token = readVaultEntry('vault_verification')
  vaultKey = PBKDF2(enteredPassword, salt)
  try AES-GCM-decrypt(token, vaultKey) === 'path-council-v1'
  if success → vault unlocked, key lives in worker
  if fail → wrong password, prompt again
```

### What Gets Encrypted

| Field                    | Storage tier   | Encrypted by |
| ------------------------ | -------------- | ------------ |
| LLM API key              | IndexedDB only | vaultKey     |
| UserProfile              | IndexedDB only | vaultKey     |
| Agent outputs            | IndexedDB only | vaultKey     |
| Consensus scores         | IndexedDB only | vaultKey     |
| Synthesis results        | IndexedDB only | vaultKey     |
| Career knowledge graph   | IndexedDB only | vaultKey     |
| Agent memory (per agent) | IndexedDB only | vaultKey     |

No data ever leaves the device (other than the API key in per-request LLM calls over HTTPS).

### Encrypted File Export / Import

After any session, user can export a portable `.compassenc` file:

```
Export:
  payload = JSON.stringify({ sessions, memory, graph })
  ciphertext = AES-GCM-encrypt(payload, vaultKey)
  file = JSON.stringify({ version: 1, salt, ciphertext })
  download as 'compass-backup-YYYY-MM-DD.compassenc'

Import:
  parse file → { salt, ciphertext }
  prompt user for vault password
  vaultKey = PBKDF2(password, salt)
  plaintext = AES-GCM-decrypt(ciphertext, vaultKey)
  load sessions into IndexedDB
```

### lib/vault/ Module

```
public/vault.worker.js   — Web Worker (plain JS, loaded via new Worker('/vault.worker.js'))
                           Handles: derive, verify, encrypt, decrypt, clear, status messages
                           CryptoKey is non-extractable and never leaves this worker

lib/vault/client.ts      — Main-thread API (postMessage bridge)
                           Exports: generateSalt, setupVault, unlockVault, lockVault,
                                    encrypt, decrypt, isVaultLocked

lib/vault/idb.ts         — IndexedDB helpers (main thread, stores ciphertext only)
                           Exports: all read/write/clear functions listed above
```

**Worker lifecycle:**
- Worker is instantiated once at app boot (`new Worker('/vault.worker.js')`)
- It holds the `CryptoKey` in module-level memory after `derive`
- `clear` message wipes the key (called on vault lock or tab close)
- If the tab is closed and reopened, vault unlock screen appears again — re-derive takes ~600ms in worker

## API Routes

```
POST /api/agents/run          — Start agent council run for a session
GET  /api/agents/stream/:id   — Server-sent events stream for live arena output
POST /api/agents/challenge    — Run challenge round (Realist, Critic, Strategist)
POST /api/agents/mentor       — Generate mentor prompts for a path
POST /api/agents/synthesis    — (internal) Run synthesis after agents settle

POST /api/graph/build         — Build career knowledge graph from profile
```

No session persistence API routes in v1 — sessions are stored locally in IndexedDB.

## Rendering Architecture

- Server Components by default. Add `'use client'` only for interactivity.
- Root layout: Geist Sans / JetBrains Mono loaded via `next/font`.
- Entry point: `app/page.tsx` → `components/compass-root.tsx` (state: `'vault' | 'app'`).
- Vault screen always first; app shell only shown after successful unlock.
- App shell (`components/compass-app.tsx`) is a single-page state machine: `setup → questionnaire → arena → results`.
- Revisit flow inserts: `revisit-questionnaire → arena → continuity-results`.
- Arena streams agent outputs via SSE — each agent card appears as its response arrives.

## Deployment

### Local Development

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`. No environment variables required for local dev without LLM calls.

### Production (VPS)

```bash
git clone https://github.com/your-org/path-council.git
cd path-council
npm install
cp .env.example .env.local
# Fill in .env.local (only needed for LLM API routes)
npm run build
pm2 start npm --name "compass" -- start
pm2 save && pm2 startup
```

Nginx reverse-proxies port 3000. SSL via Let's Encrypt + Certbot. See `context/13-auth-deployment.md` for the full VPS guide.

### Deployment Targets

| Target           | Auth          | DB       | Data residency          |
| ---------------- | ------------- | -------- | ----------------------- |
| VPS self-hosted  | Vault (local) | None     | Your device / VPS disk  |
| Vercel (optional)| Vault (local) | None     | User's browser only     |

## Performance Budget

| Operation                        | Where       | Time (modern device) | Time (low-end) | Mitigation                                      |
| -------------------------------- | ----------- | -------------------- | -------------- | ----------------------------------------------- |
| PBKDF2 key derivation            | Web Worker  | ~600ms               | ~1.5s          | Off main thread — UI stays fully responsive     |
| AES-256-GCM encrypt (200KB blob) | Web Worker  | <2ms                 | <5ms           | Hardware-accelerated, negligible                |
| AES-256-GCM decrypt (200KB blob) | Web Worker  | <2ms                 | <5ms           | Same                                            |
| IndexedDB write                  | Main thread | <10ms                | <30ms          | Async, non-blocking                             |
| IndexedDB read                   | Main thread | <5ms                 | <15ms          | Async, non-blocking                             |
| Career graph build (LLM call)    | Server      | 2–4s                 | 2–4s           | Fired in parallel during "Review answers" step  |
| Agent council (5 parallel calls) | Server      | 8–20s                | 8–20s          | Streamed via SSE — user sees output as it arrives |
| SSE chunk → screen               | Main thread | <1ms per chunk       | <1ms           | No encryption per chunk; only on completion     |

**Main thread is never blocked.** All crypto runs in the Web Worker. All I/O is async.

## Invariants

1. The vault `CryptoKey` lives only inside the Web Worker — non-extractable, never passed to the main thread.
2. PBKDF2 always runs in the Web Worker — never on the main thread.
3. All plaintext data is encrypted via the Web Worker before any IndexedDB write.
4. The vault password and derived key are never sent to the server under any circumstance.
5. The LLM API key is stored only in encrypted IndexedDB — never in cloud sync, never in server DB.
6. The server receives the API key only as a per-request HTTPS payload for LLM calls; it never logs or persists it.
7. All five specialist agents run in parallel — never sequentially.
8. Synthesis always runs after all specialist agents have settled.
9. Disagreement scoring always runs before synthesis.
10. Challenge mode calls only Realist, Critic, Strategist — not the full council.
11. Session writes only after a complete successful run — never partial state.
12. Career knowledge graph build fires in parallel with the "Review answers" step — never as a blocking pre-step.
13. Continuity revisit always merges the original profile with update notes — never replaces.
14. CareerGraph nodes are additive across sessions — no node is ever deleted; weight decays toward 0 over time.

## Cross-Device Access

No cloud sync. To move data to another device, use the encrypted file export:

```
Export → downloads compass-backup-YYYY-MM-DD.compassenc
Import on second device → prompts for vault password → loads sessions into IndexedDB
```

The `.compassenc` file is AES-256-GCM ciphertext — safe to copy over any channel.
