# PathCouncil

## Overview

PathCouncil is a privacy-first AI-powered life proposal tool. Users open the app, unlock their local vault, describe their current situation, goals, constraints, and aspirations. A council of specialist AI agents — each powered by a knowledge graph built from the user's profile — debates the profile, scores their disagreements, and a synthesis agent produces the three most realistic, grounded paths forward.

All user data is encrypted with AES-256-GCM in the browser. Nothing is stored on any server. API keys never leave the user's device (except per-request over HTTPS for LLM calls). No account or sign-up required in v1.

The app can be deployed to any VPS in minutes (`npm install` + `npm run build` + PM2).

## Goals

1. Let any person — regardless of field, background, or career stage — get honest, structured guidance on their next chapter.
2. Run a multi-agent debate where agents cooperate and challenge each other before producing recommendations.
3. Surface agent disagreement explicitly so users understand confidence and consensus behind each path.
4. Let users select agent personas that match their specific context and needs.
5. Generate mentor outreach prompts tailored to each recommended path.
6. Support a challenge mode where users push back on recommendations and agents respond.
7. Persist user sessions locally (encrypted) so returning users receive continuity-aware guidance.
8. Give privacy-conscious users a fully self-hostable app with no external dependencies.

## Core User Flow

1. User opens the app.
   - First use: vault setup screen — choose a vault password.
   - Returning user: vault unlock screen — enter vault password.
2. User selects an AI provider, enters their API key (encrypted immediately into IndexedDB via vault key, never sent to server at rest).
3. User optionally configures the agent council: toggle agents on/off, assign personas.
4. User completes the four-step questionnaire covering situation, motivations, strengths/gaps, and target direction.
5. Server builds a career knowledge graph from the user's profile (lightweight LLM extraction pass, fires in parallel with review step).
6. The agent council runs in parallel server-side: each agent gets a knowledge-graph-enriched prompt + selected persona.
7. A synthesis agent reads all agent outputs, scores disagreement, and produces three recommended paths with consensus scores.
8. User reviews paths with agent voices, disagreement scores, AI advantage notes, actionable steps, and a mentor prompt pack.
9. User optionally enters challenge mode to push back on a recommended path.
10. Session is encrypted and stored in local IndexedDB. User can view past sessions and trigger continuity re-evaluation.

## Features

### Vault Auth (v1)

- No account required. Vault password is the only credential.
- PBKDF2 (300k iterations, SHA-256) key derivation runs in a dedicated Web Worker.
- AES-256-GCM CryptoKey is non-extractable and lives only inside the Web Worker.
- Salt and encrypted verification token stored in IndexedDB (`pathcouncil_vault` store).
- Reset vault: wipes all local data and returns to setup.
- Cross-device access: export an encrypted `.compassenc` file and import it on another device.

### Provider and Model Selection

- User selects from supported providers: Anthropic, OpenAI, Google, Mistral, Groq.
- User enters their own API key. It is encrypted with the vault key and stored in IndexedDB only — never sent to the server at rest.
- User selects a model from the chosen provider.
- API key is decrypted locally when making LLM calls and sent per-request over HTTPS. The server uses it once and discards it.

### Career Knowledge Graph

- After questionnaire submission, a lightweight LLM extraction pass builds a directed graph from the user's profile.
- Nodes: roles, skills, industries, constraints, aspirations, strengths, gaps, values.
- Edges: relationships between nodes with strength weights.
- Graph is encrypted and stored in IndexedDB (`pathcouncil_graphs` store).
- Each agent's prompt is enriched with the graph nodes most relevant to their analytical lens.
- Graph updates incrementally across continuity sessions — nodes are additive, never deleted.

### Agent Council

- Five specialist agents run in parallel, each with a fixed analytical role:
  - **The Realist:** evaluates genuine achievability given constraints and market reality.
  - **The Optimist:** surfaces overlooked strengths and underrated opportunities.
  - **The Critic:** identifies blind spots, risks, and uncomfortable gaps.
  - **The Strategist:** proposes move sequences, leverage points, and compounding advantages.
  - **The AI Coach:** focuses exclusively on how AI tools can accelerate each path.
- Users can toggle individual agents on/off before the session starts (minimum 2 must remain active).
- All agents run in parallel via `Promise.allSettled`.

### Agent Personas

- Each agent slot accepts an optional persona that changes the analytical lens.
- Personas per agent:
  - The Realist: "Operator who bootstrapped and sold", "Ex-McKinsey partner", "Serial technical founder"
  - The Optimist: "Angel investor who bets on people", "Talent scout at a tier-1 company", "Coach who works with career changers"
  - The Critic: "Burned-out founder who rebuilt from scratch", "Hiring manager who has seen 500 candidates", "Therapist who works with high performers"
  - The Strategist: "VC who thinks in 10-year compounding arcs", "Product leader who ships in weeks not quarters", "Systems thinker and author"
  - The AI Coach: "AI researcher who applies tools daily", "Indie hacker who replaced a team with AI", "Educator who teaches AI literacy"

### Agent Disagreement Scoring

- After all agents respond, a scoring pass evaluates alignment across agents per recommended path.
- Each path receives a consensus score (0–100).
- Disagreement is surfaced explicitly: which agents pushed back and why.

### Questionnaire

- Four-step structured questionnaire:
  1. Current situation, field, and AI tool usage.
  2. Motivators, frustrations, and 3–5 year vision.
  3. Strengths, skill gaps, and constraints.
  4. Target direction and additional context.

### Synthesis and Recommendations

- A synthesis agent reads all agent outputs and disagreement scores.
- Produces exactly three recommended paths ranked by realism and consensus.
- Each path includes: name, horizon, description, consensus score, agent voices, AI advantage, 30/60/90-day milestones, trade-off statement.

### Mentor Matching Prompt Pack

- For each recommended path, three ready-to-send outreach messages generated on demand.
- Formats: cold email, LinkedIn connection note, community post.

### Challenge Mode

- After reviewing paths, users push back with a written objection.
- Realist, Critic, Strategist respond in parallel.
- Agents either defend, update, or concede.

### Memory and Continuity

- Sessions stored encrypted in IndexedDB after every complete successful run.
- On return, the app shows a sessions list.
- Revisit flow: short update questionnaire (what changed, what progress was made).
- Agents re-evaluate with the original profile + update context + their previous session memory.
- Agent memory: compressed key insights from last 3 sessions per agent, stored encrypted in IndexedDB.

### Privacy-First Deployment

- Clone the repo, run `npm install`, then `npm run build` + PM2. No database setup.
- Nginx reverse proxy + Certbot SSL for HTTPS on any VPS.
- Full VPS setup guide in `context/13-auth-deployment.md`.

## Scope

### In Scope (v1)

- Vault-based local auth (no server accounts).
- Encrypted client-side storage via IndexedDB (zero-knowledge).
- Career knowledge graph built from user profile.
- Knowledge-graph-enriched agent prompts (persona enrichment).
- Agent memory across continuity sessions (encrypted, per-agent).
- Provider and model selection with encrypted API key storage in IndexedDB.
- Multi-agent parallel debate with five configurable specialist agents.
- Agent persona assignment from a curated library per agent role.
- Four-step profile questionnaire.
- Disagreement scoring and consensus surfacing.
- Synthesis agent producing three ranked recommended paths.
- Per-path mentor outreach prompt pack (three message formats per path).
- Challenge mode for any recommended path.
- Session list with continuity revisit flow.
- VPS self-hosting guide (Nginx + PM2 — no DB required).
- AES-256-GCM encryption for all sensitive data in IndexedDB.

### Out of Scope

- User accounts or server-side auth.
- Cloud storage or cross-device sync (use encrypted file export instead).
- Docker image.
- Billing or subscription management.
- Team or organisation modes.
- Mobile-native applications.
- Comparing multiple historical sessions side-by-side.
- Agent fine-tuning or custom model uploads.
- Real-time collaboration between multiple users.

## Success Criteria

1. A user can unlock their vault, configure the agent council, complete the questionnaire, and receive three grounded recommendations in a single session.
2. Agent disagreement is clearly scored and surfaced per path.
3. Each agent persona meaningfully changes the analytical voice.
4. Mentor prompt messages are specific enough to send without editing.
5. Challenge mode produces a substantive agent response to a user objection.
6. A returning user can complete the revisit flow and receive a continuity-aware update referencing their past session.
7. A technical user can clone the repo, run three commands, and have a fully functional self-hosted instance.
8. API keys are never stored in plaintext — all IDB values for sensitive fields are AES-256-GCM ciphertext.
