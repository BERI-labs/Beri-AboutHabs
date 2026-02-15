/**
 * FAQ cache for instant responses to the 4 suggested questions.
 * Only triggers on EXACT wording matches (case-insensitive, ignoring trailing punctuation).
 */

import type { MessageSource } from '@/types'

interface FAQEntry {
  /** Exact question text (lowercase, no trailing punctuation) */
  exactMatch: string
  answer: string
  sources: MessageSource[]
}

const FAQ_ENTRIES: FAQEntry[] = [
  {
    exactMatch: 'what are the school fees',
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
  {
    exactMatch: 'how do i apply for 11+ entry',
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
  {
    exactMatch: 'what a-level subjects are offered',
    answer: `A-Level subjects offered (choose 3-4 over 2 years):
Art, Biology, Chemistry, Classical Civilisation*, Classical Greek, Computer Science*, Design & Technology, Drama*, Economics, English Language, English Literature, French, Further Maths, Geography*, German, History*, Latin, Maths, Music, PE*, Philosophy, Physics, Politics, Psychology*, Religious Studies*, Spanish

*Can study without prior GCSE
At least 1 subject taught in mixed-gender classes with Habs Girls.
Entry requirement: 9 GCSEs including Maths and English.

Source: Sixth Form — A-Level Programme`,
    sources: [{ source: 'Sixth Form (Years 12-13, Ages 16-18)', section: 'A-Level Programme' }],
  },
  {
    exactMatch: 'what sports are available',
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
 * Normalise a query for exact matching: lowercase, strip trailing punctuation and whitespace.
 */
function normalise(query: string): string {
  return query.toLowerCase().replace(/[?.!,]+$/, '').trim()
}

/**
 * Get a cached FAQ response if the query exactly matches a suggested question.
 */
export function getFAQResponse(query: string): { answer: string; sources: MessageSource[] } | null {
  const normalised = normalise(query)

  for (const entry of FAQ_ENTRIES) {
    if (normalised === entry.exactMatch) {
      console.log('FAQ exact match:', query)
      return { answer: entry.answer, sources: entry.sources }
    }
  }

  return null
}
