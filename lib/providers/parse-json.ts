export function safeParseJSON<T>(raw: string): T | null {
  try {
    const stripped = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
    return JSON.parse(stripped) as T
  } catch {
    return null
  }
}
