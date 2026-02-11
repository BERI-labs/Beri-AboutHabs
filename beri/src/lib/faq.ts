/**
 * FAQ cache for instant responses to common questions
 * Uses simple text matching for reliable results
 */

import type { MessageSource } from '@/types'

/** Pre-computed FAQ entry */
interface FAQEntry {
  patterns: string[]  // Multiple patterns to match
  answer: string
  sources: MessageSource[]
}

/**
 * Pre-computed FAQ entries with answers
 * Patterns are lowercase for case-insensitive matching
 */
const FAQ_ENTRIES: FAQEntry[] = [
  {
    patterns: [
      'open day',
      'open days',
      'visit the school',
      'school tour',
      'come and see',
    ],
    answer: `• Open days are held in the autumn term, typically in October and November
• Prospective families can register for open days via the school website
• Tours of the school are also available by appointment throughout the year
• Open mornings allow you to see lessons in action and meet staff and students

Source: Admissions Information`,
    sources: [{ source: 'Admissions Information', section: 'Open Days and Visits' }],
  },
  {
    patterns: [
      'how to apply',
      'how do i apply',
      'application process',
      'apply to',
      'admissions process',
    ],
    answer: `• Applications are made through the school's admissions office
• The entrance exam is held in January for Year 7 entry
• Registration forms are available on the school website
• The process includes an entrance examination and interview
• Bursaries and scholarships are available for eligible families

Source: Admissions Information`,
    sources: [{ source: 'Admissions Information', section: 'How to Apply' }],
  },
  {
    patterns: [
      'gcse',
      'subjects offered',
      'what subjects',
      'curriculum',
      'subject options',
    ],
    answer: `• Core subjects: English, Mathematics, Sciences, Modern Languages
• A wide range of GCSE options including Art, Music, Drama, Computer Science, Geography, History, Religious Studies, Design & Technology, and more
• Students typically study 9-10 GCSEs
• The curriculum is designed to provide a broad and balanced education

Source: Academic Programme`,
    sources: [{ source: 'Academic Programme', section: 'GCSE Curriculum' }],
  },
  {
    patterns: [
      'extracurricular',
      'clubs',
      'activities',
      'sport',
      'after school',
      'extra curricular',
    ],
    answer: `• Over 100 extracurricular clubs and societies are available
• Sports include rugby, cricket, football, hockey, swimming, athletics, and more
• Music opportunities include orchestras, choirs, ensembles, and individual tuition
• Drama productions take place throughout the year
• The Duke of Edinburgh Award scheme and Combined Cadet Force are also offered

Source: School Life`,
    sources: [{ source: 'School Life', section: 'Extracurricular Activities' }],
  },
]

/**
 * Check if a query matches a cached FAQ using simple pattern matching
 * @param query - The user's question
 * @returns Matching FAQ entry or null if no match
 */
export function checkFAQCache(query: string): FAQEntry | null {
  const lowerQuery = query.toLowerCase()

  for (const entry of FAQ_ENTRIES) {
    for (const pattern of entry.patterns) {
      if (lowerQuery.includes(pattern)) {
        console.log(`FAQ cache hit: matched pattern "${pattern}"`)
        return entry
      }
    }
  }

  return null
}

/**
 * Get a cached FAQ response if available
 * @param query - The user's question (raw text)
 * @returns Object with answer and sources, or null if no match
 */
export function getFAQResponse(query: string): { answer: string; sources: MessageSource[] } | null {
  const entry = checkFAQCache(query)
  if (entry) {
    return {
      answer: entry.answer,
      sources: entry.sources,
    }
  }
  return null
}
