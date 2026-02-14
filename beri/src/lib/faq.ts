/**
 * FAQ cache for instant responses to common questions
 *
 * Only triggers when the user's query closely matches a known pattern.
 * Each entry requires BOTH a primary keyword AND a supporting keyword
 * to avoid false positives on vague or tangential queries.
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
  // ── Fees ──────────────────────────────────────────────────────────
  {
    primary: ['fees', 'fee', 'cost', 'price', 'expensive', 'how much'],
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

  // ── 11+ Entry ─────────────────────────────────────────────────────
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

  // ── Contact / admissions email ────────────────────────────────────
  {
    primary: ['contact', 'email', 'phone', 'telephone', 'address'],
    supporting: ['admission', 'school', 'habs', 'reach', 'get in touch', 'number', 'write'],
    answer: `Haberdashers' Boys' School
Butterfly Lane, Elstree, Hertfordshire, WD6 3AF
Tel: 020 8266 1700

• Admissions: admissionsboys@habselstree.org.uk
• Fees Office: feesboys@habselstree.org.uk
• VAT Enquiries: VATenquiries@habselstree.org.uk
• Website: habselstree.org.uk/boys/

Admissions team: Avril Tooley (Director), Binnur Rogers (Registrar), Chantal Gilbert, Jennifer Adams (Assistant Registrar).

Source: Contact Information`,
    sources: [
      { source: 'Contact Information', section: 'Main Address' },
      { source: 'Contact Information', section: 'Email Contacts' },
    ],
  },

  // ── A-Level subjects ──────────────────────────────────────────────
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

  // ── Entry points ──────────────────────────────────────────────────
  {
    primary: ['entry point', 'entry points', 'what age', 'when can', 'when could'],
    supporting: ['join', 'enter', 'start', 'apply', 'admission', 'child', 'son', 'boy'],
    answer: `Entry points to Haberdashers' Boys' School:
• 4+ (Reception) — ~40 places
• 7+ (Year 3) — ~26 places
• 11+ (Year 7) — ~100 external places
• 13+ (Year 9) — ~20 external places
• 16+ (Sixth Form)
• Occasional places in other year groups

Contact: admissionsboys@habselstree.org.uk

Source: Admissions — Entry Points`,
    sources: [{ source: 'Admissions', section: 'Entry Points' }],
  },
]

/**
 * Check if a query matches a cached FAQ.
 * Requires BOTH a primary AND a supporting keyword match to fire,
 * preventing false positives on broad or tangential queries.
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
