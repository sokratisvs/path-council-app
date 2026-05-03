import type { ProviderId } from './env'
import type { AgentId } from '@/lib/agents/personas'

export interface ProviderModel {
  id: string
  label: string
}

export interface ProviderConfig {
  id: ProviderId
  name: string
  subline: string
  keyLabel: string
  keyNote: string
  models: ProviderModel[]
  defaultModel: string
}

export interface SetupConfig {
  provider: ProviderId
  apiKey: string
  model: string
  activeAgents: AgentId[]
  agentPersonas: Record<AgentId, string | null>
}

export const PROVIDER_CONFIGS: Record<ProviderId, ProviderConfig> = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    subline: 'Claude',
    keyLabel: 'Anthropic API key (sk-ant-…)',
    keyNote: 'console.anthropic.com — encrypted before storage, never sent to server at rest',
    models: [
      { id: 'claude-opus-4-5',   label: 'Claude Opus 4.5' },
      { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
      { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5' },
    ],
    defaultModel: 'claude-sonnet-4-5',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    subline: 'GPT-4o',
    keyLabel: 'OpenAI API key (sk-…)',
    keyNote: 'platform.openai.com — encrypted before storage, never sent to server at rest',
    models: [
      { id: 'gpt-4o',      label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
    defaultModel: 'gpt-4o',
  },
  google: {
    id: 'google',
    name: 'Google',
    subline: 'Gemini',
    keyLabel: 'Google AI API key',
    keyNote: 'aistudio.google.com — encrypted before storage, never sent to server at rest',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    ],
    defaultModel: 'gemini-2.0-flash',
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral',
    subline: 'Mistral',
    keyLabel: 'Mistral API key',
    keyNote: 'console.mistral.ai — encrypted before storage, never sent to server at rest',
    models: [
      { id: 'mistral-large-latest', label: 'Mistral Large' },
      { id: 'open-mixtral-8x22b',   label: 'Mixtral 8x22B' },
    ],
    defaultModel: 'mistral-large-latest',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    subline: 'Llama / fast',
    keyLabel: 'Groq API key',
    keyNote: 'console.groq.com — encrypted before storage, never sent to server at rest',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
      { id: 'mixtral-8x7b-32768',      label: 'Mixtral 8x7B' },
    ],
    defaultModel: 'llama-3.3-70b-versatile',
  },
}
