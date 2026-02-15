/**
 * FAQ cache for instant responses to common questions
 *
 * Only triggers on near-exact matches for the 4 suggested questions.
 * Everything else goes through the RAG pipeline.
 */

import type { MessageSource } from '@/types'

interface FAQEntry {
  /** Primary keywords — at least ONE must appear */
  primary: string[]
  /** Supporting keywords — at least ONE must also appear (acts as a second gate) */
  supporting: string[]
  answer: string
  sources: MessageSource[]
}

const FAQ_ENTRIES: FAQEntry[] = [
  // ── "What are the school fees?" ────────────────────────────────────
  {
    primary: ['fees', 'fee', 'cost', 'how much'],
    supporting: ['school', 'term', 'year', 'habs', 'tuition', 'pay', 'annual', 'per'],
    answer: `Tuition fees for 2025-26 (including 20% VAT):
• Pre-Prep (Reception–Year 2): £8,413/term (£25,239/year)
• Prep (Years 3–6): £9,849/term (£29,547/year)
• Senior School (Years 7–11): £10,423/term (£31,269/year)
• Sixth Form (Years 12–13): £10,423/term (£31,269/year)

Fees include stationery, textbooks, and insurance. Prep fees include lunch.
Additional charges: devices £125/term (Y7+), senior lunch £5.25/day.

Source: Fees and Financial Support — Tuition Fees 2025-26`,
    sources: [{ source: 'Fees and Financial Support', section: 'Tuition Fees 2025-26' }],
  },

  // ── "How do I apply for 11+ entry?" ────────────────────────────────
  {
    primary: ['11+', 'eleven plus', 'year 7 entry'],
    supporting: ['apply', 'entry', 'exam', 'test', 'how', 'process', 'date', 'when', 'deadline', 'admission'],
    answer: `11+ Year 7 Entry (2025-26):
• Registration deadline: Thursday 6 November 2025
• First round assessment: Tuesday 18 & Friday 21 November 2025
• ~100 external places available
• Online adaptive tests: Maths (20 min), Non-Verbal Reasoning (10 min), Verbal Reasoning (10 min), Puzzles (15 min), English (50 min)
• Handwritten creative writing (30 min)
• Based on Key Stage 2 National Curriculum — no tutoring needed
• ~50% of first-round candidates invited for second-round interview
• Offers posted: Thursday 12 February 2026

Contact: admissionsboys@habselstree.org.uk

Source: Admissions — 11+ Year 7 Entry`,
    sources: [{ source: 'Admissions', section: '11+ Year 7 Entry' }],
  },

  // ── "What A-Level subjects are offered?" ───────────────────────────
  {
    primary: ['a-level', 'a level', 'a levels', 'alevel'],
    supporting: ['subject', 'offer', 'available', 'choice', 'choose', 'option', 'what', 'which', 'list'],
    answer: `A-Level subjects offered (choose 3-4 over 2 years):
Art, Biology, Chemistry, Classical Civilisation*, Classical Greek, Computer Science*, Design & Technology, Drama*, Economics, English Language, English Literature, French, Further Maths, Geography*, German, History*, Latin, Maths, Music, PE*, Philosophy, Physics, Politics, Psychology*, Religious Studies*, Spanish

*Can study without prior GCSE
At least 1 subject taught in mixed-gender classes with Habs Girls.
Entry requirement: 9 GCSEs including Maths and English.

Source: Sixth Form — A-Level Programme`,
    sources: [{ source: 'Sixth Form (Years 12-13, Ages 16-18)', section: 'A-Level Programme' }],
  },

  // ── "What sports are available?" ───────────────────────────────────
  {
    primary: ['sport', 'sports'],
    supporting: ['what', 'available', 'offer', 'play', 'do', 'habs', 'school'],
    answer: `Sport at Habs:
• ~160 co-curricular sports activities beyond the timetable
• All students encouraged to participate — competitive, recreational, or social
• Up to 6 teams per age group in weekly competitive action

Seasonal focus:
• Autumn: Football, Rugby
• Spring: Hockey
• Summer: Cricket

High-performance coaching in cricket, football, hockey, rugby, water polo, and swimming, led by professional sportspeople.

Partnerships: Middlesex Cricket, Watford Football, Saracens Rugby, Watford Waterpolo. Teams compete at district, county, and national level.

Facilities: 100-acre campus with the Medburn Centre (sports complex), gym, indoor swimming pool, fitness suite, tennis and netball courts, and sports fields.

Source: Sport and Co-Curricular — Sport Overview`,
    sources: [
      { source: 'Sport and Co-Curricular', section: 'Sport Overview' },
      { source: 'Sport and Co-Curricular', section: 'High-Performance Sport' },
    ],
  },
]

/**
 * Check if a query matches a cached FAQ.
 * Requires BOTH a primary AND a supporting keyword match to fire.
 */
function checkFAQCache(query: string): FAQEntry | null {
  const lowerQuery = query.toLowerCase()

  for (const entry of FAQ_ENTRIES) {
    const hasPrimary = entry.primary.some(p => lowerQuery.includes(p))
    if (!hasPrimary) continue

    const hasSupporting = entry.supporting.some(s => lowerQuery.includes(s))
    if (!hasSupporting) continue

    console.log('FAQ cache hit for query:', query)
    return entry
  }

  return null
}

/**
 * Get a cached FAQ response if available
 */
export function getFAQResponse(query: string): { answer: string; sources: MessageSource[] } | null {
  const entry = checkFAQCache(query)
  if (entry) {
    return { answer: entry.answer, sources: entry.sources }
  }
  return null
}
