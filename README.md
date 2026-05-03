# PathCouncil

A privacy-first AI-powered life proposal tool. A council of specialist AI agents debates your profile, scores their disagreements, and produces the three most realistic paths forward — all encrypted locally, nothing stored on any server.

## How it works

1. Set a vault password on first use (returns to unlock screen on every subsequent load)
2. Enter your own API key for a supported provider (Anthropic, OpenAI, Google, Mistral, Groq) — or skip if the deployment owner has set a server key in `.env`
3. Configure the agent council and complete the four-step questionnaire
4. Agents run in parallel server-side, each enriched with a career knowledge graph built from your profile
5. A synthesis agent scores disagreement and produces three recommended paths with actionable steps and mentor prompts
6. Sessions are encrypted with AES-256-GCM and stored in local IndexedDB — never leave your device

## Setup

**Requirements:** Node.js 20+

```bash
npm install
npm run dev        # development
npm run build      # production build
npm start          # production server
```

### VPS deployment (PM2 + Nginx)

```bash
npm install
npm run build
pm2 start npm --name pathcouncil -- start
```

Point Nginx at `http://localhost:3000`. No database, no migrations, no Docker required.

### Environment variables

```bash
cp .env.example .env.local
```

Two API key modes are supported — pick one:

**Server key mode** — set a key for the provider(s) you want to support. Users skip key entry entirely.

| Variable | Provider |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic (Claude) |
| `OPENAI_API_KEY` | OpenAI (GPT-4o) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google (Gemini) |
| `MISTRAL_API_KEY` | Mistral |
| `GROQ_API_KEY` | Groq |

**BYOK mode** — leave all keys blank. Users enter their own key in the Setup screen; it is encrypted via the vault and stored only in their local IndexedDB.

**Base URLs** — required for each provider you enable. The app will throw an error at startup if a key is set without a matching base URL. Use the standard vendor endpoints below or substitute a proxy / local model server (e.g. Ollama).

| Variable | Standard endpoint |
|---|---|
| `ANTHROPIC_BASE_URL` | `https://api.anthropic.com` |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` |
| `GOOGLE_BASE_URL` | `https://generativelanguage.googleapis.com` |
| `MISTRAL_BASE_URL` | `https://api.mistral.ai/v1` |
| `GROQ_BASE_URL` | `https://api.groq.com/openai/v1` |

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | No | Public URL of the deployment (used for CORS) |

## Architecture

- **Stack:** Next.js 15 · React 19 · TypeScript · Tailwind v4 · shadcn/ui
- **Auth:** Vault password only — no accounts, no external auth
- **Encryption:** Web Worker holds a non-extractable AES-256-GCM key derived via PBKDF2 (300k iterations). All encrypt/decrypt calls go through `postMessage` — the key is never exposed to the main thread
- **Storage:** IndexedDB only — sessions, graphs, agent memory, and vault metadata all stored encrypted client-side
- **LLM calls:** API key decrypted locally, sent per-request over HTTPS, discarded server-side after use
- **Cross-device:** Export/import an encrypted `.compassenc` file — no cloud sync required
