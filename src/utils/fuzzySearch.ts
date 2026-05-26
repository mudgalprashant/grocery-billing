/**
 * fuzzySearch — approximate text matching without any external API.
 *
 * Strategy: trigram similarity.
 * Splits text into overlapping 3-character chunks and measures overlap
 * with the query trigrams. Fast enough for client-side product search
 * over hundreds of items.
 *
 * Example:
 *   "basmti" matches "Basmati Rice" even with a typo.
 */

function trigrams(str: string): Set<string> {
  const s = str.toLowerCase().replace(/\s+/g, ' ').trim()
  const set = new Set<string>()
  // Include bigrams too for short words
  for (let i = 0; i < s.length - 1; i++) {
    set.add(s.slice(i, i + 2))
  }
  for (let i = 0; i < s.length - 2; i++) {
    set.add(s.slice(i, i + 3))
  }
  return set
}

function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let overlap = 0
  for (const t of a) {
    if (b.has(t)) overlap++
  }
  return overlap / Math.max(a.size, b.size)
}

export interface FuzzySearchable {
  id: string
  name: string
  description: string | null
  category: string
}

/**
 * Fuzzy-search a list of products.
 * Returns items sorted by relevance, filtering out poor matches.
 *
 * @param items    - The full product list
 * @param query    - The search query (can have typos)
 * @param threshold - Minimum similarity score 0–1 (default 0.2)
 */
export function fuzzySearch<T extends FuzzySearchable>(
  items: T[],
  query: string,
  threshold = 0.2
): T[] {
  if (!query.trim()) return items

  const q = query.toLowerCase().trim()
  const qTrigrams = trigrams(q)

  const scored = items.map(item => {
    const haystack = [
      item.name,
      item.description ?? '',
      item.category,
    ].join(' ').toLowerCase()

    // Exact substring match — boost to top
    if (haystack.includes(q)) return { item, score: 1 }

    // Word-level prefix match
    const words = haystack.split(/\s+/)
    const wordMatch = words.some(w => w.startsWith(q))
    if (wordMatch) return { item, score: 0.9 }

    // Trigram similarity
    const score = similarity(qTrigrams, trigrams(haystack))
    return { item, score }
  })

  return scored
    .filter(s => s.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(s => s.item)
}
