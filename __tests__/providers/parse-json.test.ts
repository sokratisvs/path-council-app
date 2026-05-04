import { describe, it, expect } from 'vitest'
import { safeParseJSON } from '@/lib/providers/parse-json'

describe('safeParseJSON', () => {
  it('parses valid JSON', () => {
    expect(safeParseJSON<{ a: number }>('{"a":1}')).toEqual({ a: 1 })
  })

  it('strips json fences', () => {
    const fenced = '```json\n{"x":"y"}\n```'
    expect(safeParseJSON<{ x: string }>(fenced)).toEqual({ x: 'y' })
  })

  it('strips plain fences', () => {
    const fenced = '```\n{"x":"y"}\n```'
    expect(safeParseJSON<{ x: string }>(fenced)).toEqual({ x: 'y' })
  })

  it('trims surrounding whitespace', () => {
    expect(safeParseJSON<number[]>('  [1,2,3]  ')).toEqual([1, 2, 3])
  })

  it('returns null on malformed JSON', () => {
    expect(safeParseJSON('{bad json}')).toBeNull()
  })

  it('returns null on empty string', () => {
    expect(safeParseJSON('')).toBeNull()
  })

  it('returns null on plain text', () => {
    expect(safeParseJSON('hello world')).toBeNull()
  })

  it('does not throw on any input', () => {
    expect(() => safeParseJSON('undefined')).not.toThrow()
    expect(() => safeParseJSON('null')).not.toThrow()
    expect(() => safeParseJSON('{')).not.toThrow()
  })
})
