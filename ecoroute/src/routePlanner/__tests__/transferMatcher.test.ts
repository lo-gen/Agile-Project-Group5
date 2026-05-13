import { describe, expect, it } from 'vitest'
import { findTransferRoute } from '../transferMatcher'

describe('findTransferRoute', () => {
  it('finds the shortest transfer chain using BFS', () => {
    const adjacency = {
      AAA: ['BBB', 'CCC'],
      BBB: ['DDD'],
      CCC: ['DDD'],
      DDD: ['EEE'],
      EEE: [],
    }

    expect(findTransferRoute('AAA', 'DDD', adjacency)).toEqual(['AAA', 'BBB', 'DDD'])
  })

  it('returns null when there is no path', () => {
    const adjacency = {
      AAA: ['BBB'],
      BBB: [],
      CCC: ['DDD'],
      DDD: [],
    }

    expect(findTransferRoute('AAA', 'DDD', adjacency)).toBeNull()
  })
})

