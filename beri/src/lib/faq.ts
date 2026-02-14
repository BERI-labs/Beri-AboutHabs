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
  // ── What is Habs? ─────────────────────────────────────────────────
  {
    primary: ['what is habs', 'what\'s habs', 'about habs', 'tell me about', 'about the school', 'what is haberdashers'],
    supporting: ['habs', 'school', 'haberdashers', 'about', 'what', 'tell'],
    answer: `Haberdashers' Boys' School (Habs Boys) is an independent boys' school for ages 4-18, located on Butterfly Lane, Elstree, Hertfordshire, WD6 3AF.

Key facts:
• Part of Haberdashers' Elstree Schools on a 100-acre co-educational campus shared with Habs Girls
• Divisions: Prep School (Reception–Year 6, 300+ boys), Senior School (Years 7–11), and Sixth Form (Years 12–13)
• Named Independent School of the Year 2025 (overall winner)
• Vision: To be at the forefront of education
• Four core values: Ambitious, Curious, Courageous, Community
• Member of HMC, ISC, and part of the Haberdashers' Company and Schools

Source: School Overview — Basic Information`,
    sources: [
      { source: 'School Overview', section: 'Basic Information' },
      { source: 'Vision and Values', section: 'Core Statements' },
    ],
  },

  // ── Awards ─────────────────────────────────────────────────────────
  {
    primary: ['award', 'awards', 'won', 'prize', 'winner', 'achievement'],
    supporting: ['habs', 'school', 'independent', 'year', 'what', 'has'],
    answer: `Haberdashers' Boys' School awards:
• Independent School of the Year 2025 (overall winner)
• Independent School of the Year for Outstanding Educational Partnerships

In sport, the ISI Report 2022 noted: "Students achieve excellent results regionally and nationally. Teams at quarter-final stage of national competitions in rugby and football."

GCSE results (2024): 53% Grade 9, 78% Grades 9-8, 91.5% Grades 9-7. A high proportion of leavers progress to Russell Group universities and Oxbridge.

Source: School Overview — Awards`,
    sources: [
      { source: 'School Overview', section: 'Awards' },
      { source: 'Sport and Co-Curricular', section: 'High-Performance Sport' },
    ],
  },

  // ── Habs Diploma ───────────────────────────────────────────────────
  {
    primary: ['diploma', 'habs diploma'],
    supporting: ['what', 'habs', 'sixth', 'form', 'is', 'about', 'component', 'include'],
    answer: `The Habs Diploma is an enrichment programme taken on top of A-Levels. It is soon to be accredited by the University of Buckingham.

Components:
1. Subject enhancement course
2. Six elective courses
3. Visiting speaker programme
4. Community service
5. Extended research project

It develops skills for university and life beyond the classroom.

Source: Sixth Form — Habs Diploma`,
    sources: [{ source: 'Sixth Form (Years 12-13, Ages 16-18)', section: 'Habs Diploma' }],
  },

  // ── Values / Vision ────────────────────────────────────────────────
  {
    primary: ['values', 'vision', 'mission', 'purpose', 'ethos'],
    supporting: ['school', 'habs', 'what', 'core', 'are'],
    answer: `Habs' vision, mission, and values:

• Vision: To be at the forefront of education
• Mission: Two leading schools on one co-educational campus for ambitious and curious students; offering outstanding education that is fun, exciting and intellectually challenging
• Purpose: To empower young people to make a profound impact in the world

Four core values:
1. Ambitious — bold for students, staff, and the world
2. Curious — questioning, challenging assumptions, expressing ideas
3. Courageous — exploring beyond comfort zones, building resilience
4. Community — one caring, respectful community extending to families, alumni, and the world

Source: Vision and Values — Core Statements`,
    sources: [
      { source: 'Vision and Values', section: 'Core Statements' },
      { source: 'Vision and Values', section: 'Four Core Values' },
    ],
  },

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

  // ── Bursaries ──────────────────────────────────────────────────────
  {
    primary: ['bursary', 'bursaries', 'financial support', 'afford', 'means-tested', 'means tested'],
    supporting: ['habs', 'school', 'apply', 'how', 'available', 'get', 'can', 'fee'],
    answer: `Bursaries (means-tested financial support) are available for 11+, 13+, and 16+ entry.

• For families who cannot afford full fees
• A place must be offered first based on academic merit
• Requires a confidential income statement
• Can be combined with scholarships

Application deadlines (2025-26):
• 11+: Friday 21 November 2025
• 13+: Friday 28 November 2025
• 16+: Tuesday 4 November 2025

Source: Fees and Financial Support — Bursaries`,
    sources: [{ source: 'Fees and Financial Support', section: 'Bursaries (Means-Tested Financial Support)' }],
  },

  // ── Scholarships ───────────────────────────────────────────────────
  {
    primary: ['scholarship', 'scholarships'],
    supporting: ['habs', 'school', 'apply', 'how', 'available', 'get', 'what', 'type', 'category'],
    answer: `Scholarships are available for 11+, 13+, and 16+ entry in the following categories:
• Academic
• Art
• Design Technology
• Drama
• Music
• Sport

Scholarships can be combined with bursaries. VAT is charged only on the amount paid by parents (e.g. a 10% scholarship means VAT on the 90% paid by parents).

Application deadlines (2025-26):
• 11+: Thursday 6 November 2025
• 13+: Thursday 6 November 2025
• 16+: Monday 20 October 2025

Source: Fees and Financial Support — Scholarships`,
    sources: [{ source: 'Fees and Financial Support', section: 'Scholarships' }],
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

  // ── 4+ Entry ──────────────────────────────────────────────────────
  {
    primary: ['4+', 'reception entry', 'reception place'],
    supporting: ['apply', 'entry', 'how', 'process', 'date', 'when', 'deadline', 'place', 'assessment'],
    answer: `4+ Reception Entry (2025-26):
• Registration deadline: Thursday 20 November 2025
• ~40 places offered annually
• Child must be age 4 by 1 September in the year of entry
• Play-based assessment (1.5 hours): individual and group activities
• Nursery reference requested
• Selected candidates invited for a second-round one-to-one assessment (1 hour)
• Parent meeting with Head of Prep
• Offers sent: Monday 26 January 2026

Tutoring is not recommended for 4+ entry.

Source: Admissions — 4+ Reception Entry`,
    sources: [{ source: 'Admissions', section: '4+ Reception Entry' }],
  },

  // ── 7+ Entry ──────────────────────────────────────────────────────
  {
    primary: ['7+', 'year 3 entry'],
    supporting: ['apply', 'entry', 'how', 'process', 'date', 'when', 'deadline', 'place', 'assessment'],
    answer: `7+ Year 3 Entry (2025-26):
• Registration deadline: Thursday 6 November 2025
• ~26 places available (three-form entry, ~22 per class)
• Child must be age 7 by 1 September in the year of entry
• Formal assessment: Reasoning, Maths, English
• ~50% invited for second round: English and STEM assessment
• Parent meeting with Head of Prep
• Offers sent: Friday 23 January 2026

Source: Admissions — 7+ Year 3 Entry`,
    sources: [{ source: 'Admissions', section: '7+ Year 3 Entry' }],
  },

  // ── Sport ──────────────────────────────────────────────────────────
  {
    primary: ['sport', 'sports', 'rugby', 'cricket', 'football', 'hockey', 'swimming', 'athletic'],
    supporting: ['habs', 'school', 'what', 'play', 'offer', 'available', 'do', 'team'],
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

  // ── GCSE Results ───────────────────────────────────────────────────
  {
    primary: ['gcse', 'results', 'grades', 'exam results'],
    supporting: ['habs', 'school', 'what', 'how', 'good', 'achieve', 'percentage', 'grade'],
    answer: `GCSE results at Habs (2024):
• 53% Grade 9
• 78% Grades 9-8 (A* equivalent)
• 91.5% Grades 9-7 (A*-A equivalent)

A high proportion of students progress to Russell Group universities and Oxbridge. Historical results from 2016-2025 are available on the school website.

Source: Senior School — GCSE Results`,
    sources: [{ source: 'Senior School (Years 7-11, Ages 11-16)', section: 'GCSE Results' }],
  },

  // ── Sixth Form ─────────────────────────────────────────────────────
  {
    primary: ['sixth form', 'year 12', 'year 13', 'post-16', 'post 16'],
    supporting: ['habs', 'school', 'what', 'about', 'like', 'offer', 'join', 'life'],
    answer: `Habs Sixth Form (Years 12-13, ages 16-18):
• Choose 3-4 A-Levels over 2 years
• At least 1 subject taught in mixed-gender classes with Habs Girls
• The Habs Diploma (enrichment programme) on top of A-Levels
• Independent and collaborative learning with practical tasks, discussion, and debate
• Develops soft skills: teamwork, confidence, communication, leadership

Beyond the classroom: trips, speakers, CCF, Duke of Edinburgh, leadership development, sports, music, drama, and clubs.

Heavy investment in university and career preparation throughout Y12-13.

Source: Sixth Form — Overview`,
    sources: [
      { source: 'Sixth Form (Years 12-13, Ages 16-18)', section: 'Overview' },
      { source: 'Sixth Form (Years 12-13, Ages 16-18)', section: 'A-Level Programme' },
    ],
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
    primary: ['entry point', 'entry points', 'what age', 'when can', 'when could', 'how to apply', 'how do i apply'],
    supporting: ['join', 'enter', 'start', 'apply', 'admission', 'child', 'son', 'boy', 'habs', 'school'],
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

  // ── Prep School ────────────────────────────────────────────────────
  {
    primary: ['prep', 'prep school', 'junior', 'primary', 'infant'],
    supporting: ['habs', 'school', 'what', 'about', 'like', 'age', 'reception', 'year'],
    answer: `Habs Prep School (ages 4-11):
• 300+ day boys
• Entry points: 4+ (Reception) or 7+ (Year 3)
• Reception entrants progress automatically to Year 3, then Senior School after Year 6 — no 11+ exam required
• Fun at the heart of education, with awe and wonder to inspire curiosity
• Boys-only classes, with shared activities with Habs Girls (Forest School, joint choir, maths workshops, sports festivals)
• School day: 8:30am registration, lessons 8:45am–4:00pm
• After-school activities until 5:30pm; wraparound care to 6:00pm via Premier Education

Source: Prep School — Overview`,
    sources: [
      { source: 'Prep School (Ages 4-11)', section: 'Overview' },
      { source: 'Prep School (Ages 4-11)', section: 'Educational Philosophy' },
    ],
  },

  // ── Facilities / Campus ────────────────────────────────────────────
  {
    primary: ['facilities', 'campus', 'building', 'grounds'],
    supporting: ['habs', 'school', 'what', 'have', 'include', 'tour'],
    answer: `Habs facilities on the 100-acre campus:

Academic and Performance Buildings:
• Aldenham House (historic centrepiece, Grade II* listed)
• Seldon Music Hall
• Lime Tree Studios (drama)
• The Habs Innovation Centre (STEM and technology)

Sports and Recreation:
• The Medburn Centre (sports complex)
• Senior gym and fitness suite
• Indoor swimming pool
• 7 outdoor netball courts and 9 outdoor tennis courts
• Sports fields

Outdoor Education:
• Forest School
• Wildwood Den

Source: Sport and Co-Curricular — Facilities`,
    sources: [{ source: 'Sport and Co-Curricular', section: 'Facilities' }],
  },

  // ── House System ───────────────────────────────────────────────────
  {
    primary: ['house', 'houses', 'house system'],
    supporting: ['habs', 'school', 'what', 'which', 'name', 'colour', 'pastoral'],
    answer: `Habs is divided into six Houses for pastoral support and competition (sports, drama, music, HabsDash).

Senior School Houses:
• Calverts (Orange)
• Hendersons (Red)
• Joblings (Green)
• Meadows (Purple)
• Russells (Light Blue)
• Strouts (Yellow)

Prep School Houses (named after Patron Saints):
• St George's, St Patrick's, St David's, St Andrew's

Source: Pastoral Care and House System — House System`,
    sources: [{ source: 'Pastoral Care and House System', section: 'House System' }],
  },

  // ── School Day / Hours ─────────────────────────────────────────────
  {
    primary: ['school day', 'hours', 'timetable', 'schedule', 'what time', 'start time', 'finish time'],
    supporting: ['habs', 'school', 'when', 'start', 'end', 'long', 'day'],
    answer: `Habs school day (Prep School):
• 7:30am — Breakfast club (at Girls' School)
• 8:00am — School grounds open
• 8:30–8:45am — Registration
• 8:45am–4:00pm — Lessons (Periods 0-9, including breaks and lunch)
• 4:00–5:30pm — After-school activities and care
• 4:15pm — Coaches depart (regular)
• 5:30pm — Late coaches depart

Wraparound care available until 6:00pm Monday–Friday via Premier Education.

Source: Prep School — School Day Schedule`,
    sources: [
      { source: 'Prep School (Ages 4-11)', section: 'School Day Schedule' },
      { source: 'Prep School (Ages 4-11)', section: 'Wraparound Care' },
    ],
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
