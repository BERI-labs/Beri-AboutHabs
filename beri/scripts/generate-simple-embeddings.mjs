/**
 * Generate simple keyword-based embeddings for About Habs chunks
 * This creates embeddings based on keyword presence for meaningful semantic matching
 * Run with: node scripts/generate-simple-embeddings.mjs
 */

import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Keywords for semantic dimensions (384 dimensions to match all-MiniLM-L6-v2)
const KEYWORD_GROUPS = [
  // School identity (0-19)
  ['haberdashers', 'school', 'habs', 'elstree', 'hertfordshire', 'independent', 'founded', 'history'],
  ['tradition', 'excellence', 'education', 'boys', 'pupils', 'students'],
  // Admissions (20-39)
  ['admissions', 'apply', 'application', 'entrance', 'exam', 'examination', 'interview', 'registration'],
  ['open day', 'visit', 'tour', 'prospective', 'families'],
  // Fees and funding (40-59)
  ['fees', 'cost', 'tuition', 'bursary', 'scholarship', 'financial', 'funding'],
  ['means-tested', 'award', 'music scholarship', 'academic scholarship'],
  // Academic (60-89)
  ['gcse', 'a level', 'curriculum', 'subjects', 'options', 'core'],
  ['sixth form', 'university', 'oxbridge', 'oxford', 'cambridge', 'russell group'],
  ['results', 'grades', 'academic', 'achievement', 'league table'],
  // Sport (90-109)
  ['sport', 'rugby', 'cricket', 'football', 'hockey', 'swimming', 'athletics', 'tennis'],
  ['facilities', 'pitch', 'pool', 'sports hall', 'fitness'],
  // Arts (110-129)
  ['music', 'orchestra', 'choir', 'ensemble', 'instrument', 'concert', 'recital'],
  ['drama', 'theatre', 'production', 'play', 'musical', 'performance'],
  // Activities (130-149)
  ['extracurricular', 'club', 'society', 'activities', 'duke of edinburgh', 'ccf', 'cadet'],
  ['debating', 'chess', 'robotics', 'coding', 'volunteering'],
  // Pastoral (150-169)
  ['pastoral', 'care', 'wellbeing', 'tutor', 'counsellor', 'support', 'bullying'],
  ['head of year', 'form tutor', 'health centre'],
  // Practical (170-189)
  ['transport', 'coach', 'bus', 'train', 'parking', 'location', 'getting to school'],
  ['school day', 'timetable', 'hours', 'homework', 'break', 'lunch'],
  // Prep school (190-209)
  ['prep', 'junior', 'primary', 'young', 'age 4', 'nurturing', 'transition']
]

// About Habs content
const ABOUT_HABS_CONTENT = [
  {
    source: 'School Overview',
    section: 'About the School',
    content: `About Haberdashers' School: Haberdashers' is one of the UK's leading independent schools, located in Elstree, Hertfordshire. Founded in 1690, the school has a long tradition of academic excellence and offers a broad, balanced education for boys aged 4 to 18. The school is part of the Haberdashers' Company, one of the Great Twelve Livery Companies of the City of London.`
  },
  {
    source: 'School Overview',
    section: 'History',
    content: `School History: Haberdashers' was founded in 1690 by Robert Aske, a member of the Haberdashers' Company. Originally located in Hoxton, East London, the school moved to Hampstead in 1898 and then to its current site in Elstree in 1961. Throughout its history, the school has maintained a commitment to providing an outstanding education and has produced many distinguished alumni across a wide range of fields.`
  },
  {
    source: 'Admissions Information',
    section: 'How to Apply',
    content: `Admissions Process: Entry to Haberdashers' is by examination and interview. The main entry points are at 4+, 7+, 11+ and 16+. For Year 7 entry (11+), boys sit an entrance exam in January consisting of English, Mathematics, and Verbal Reasoning papers. Successful candidates are then invited for interview. Registration forms are available on the school website, and the registration fee applies. Late applications may be considered if places remain available.`
  },
  {
    source: 'Admissions Information',
    section: 'Open Days and Visits',
    content: `Open Days and Visits: The school holds open days in the autumn term, typically in October and November, where prospective families can tour the school, meet staff and students, and learn about the curriculum and school life. Individual tours can also be arranged by appointment throughout the year by contacting the admissions office. Open mornings provide the opportunity to see lessons in action and experience the school at work.`
  },
  {
    source: 'Admissions Information',
    section: 'Scholarships and Bursaries',
    content: `Scholarships and Bursaries: Haberdashers' offers a number of scholarships and bursaries to assist families with school fees. Academic scholarships are awarded based on entrance exam performance. Music scholarships are available at 11+ and 16+, and require an audition. Means-tested bursaries can cover up to 100% of fees and are designed to ensure that talented boys can attend regardless of family financial circumstances. Applications for bursaries are made through the admissions office.`
  },
  {
    source: 'Academic Programme',
    section: 'GCSE Curriculum',
    content: `GCSE Curriculum: Students at Haberdashers' study a broad curriculum leading to GCSEs. Core subjects include English Language, English Literature, Mathematics, the three Sciences (Biology, Chemistry, Physics), and a Modern Language. Students then choose additional GCSE options from a wide range including Art, Computer Science, Design & Technology, Drama, Geography, History, Latin, Music, and Religious Studies. Most students take 9 or 10 GCSEs.`
  },
  {
    source: 'Academic Programme',
    section: 'Sixth Form',
    content: `Sixth Form and A Levels: The Sixth Form at Haberdashers' offers a wide range of A Level subjects. Students typically study three or four A Levels chosen from over 20 subjects. The school has an excellent track record of university placements, with many students gaining places at Oxford, Cambridge, and other Russell Group universities. Sixth Form students benefit from dedicated study spaces, a personal tutor system, and a comprehensive programme of university and careers guidance.`
  },
  {
    source: 'Academic Programme',
    section: 'Academic Results',
    content: `Academic Results: Haberdashers' consistently achieves outstanding academic results. At GCSE, the vast majority of grades are 9-7 (A*-A equivalent). At A Level, results are equally strong, with a high proportion of A* and A grades. The school regularly features among the top independent schools in national league tables. Academic success is supported by small class sizes, dedicated teaching staff, and an emphasis on independent learning.`
  },
  {
    source: 'School Life',
    section: 'Sport',
    content: `Sport at Haberdashers': Sport plays a central role in school life. The main sports are rugby, cricket, and football, with hockey, swimming, athletics, tennis, basketball, and cross-country also offered. The school has extensive sports facilities including playing fields, a sports hall, swimming pool, fitness suite, and all-weather pitches. Fixtures are played against other leading schools, and many boys represent their county or country in their chosen sport.`
  },
  {
    source: 'School Life',
    section: 'Music',
    content: `Music at Haberdashers': Music is a strength of the school, with a vibrant programme of ensembles, orchestras, and choirs. Over a third of boys learn a musical instrument, with individual tuition available from a team of visiting music teachers. Major concerts and recitals take place throughout the year, including performances at prestigious venues. Music scholarships are available at 11+ and 16+ for exceptionally talented musicians.`
  },
  {
    source: 'School Life',
    section: 'Drama',
    content: `Drama at Haberdashers': Drama is a thriving part of school life, with several major productions staged each year in the school's purpose-built theatre. Boys of all ages can participate in plays, musicals, and other performances. GCSE and A Level Drama are offered as academic subjects. The school also runs a programme of workshops, visiting speakers, and theatre trips to broaden students' experience of the performing arts.`
  },
  {
    source: 'School Life',
    section: 'Extracurricular Activities',
    content: `Extracurricular Activities: Haberdashers' offers over 100 extracurricular clubs and societies, ranging from debating and Model United Nations to coding, chess, and robotics. The Duke of Edinburgh Award scheme is popular, with boys working towards Bronze, Silver, and Gold awards. The Combined Cadet Force (CCF) provides military-style training and adventure activities. Community service and volunteering are also encouraged throughout the school.`
  },
  {
    source: 'School Life',
    section: 'Pastoral Care',
    content: `Pastoral Care: Haberdashers' has a strong pastoral care system. Each boy has a form tutor who is their first point of contact and monitors their academic progress and wellbeing. Heads of Year oversee each year group and work closely with tutors and parents. The school has a dedicated counsellor and a health centre on site. Anti-bullying policies are strictly enforced, and the school promotes a culture of kindness, respect, and mutual support.`
  },
  {
    source: 'School Overview',
    section: 'Facilities',
    content: `School Facilities: The school campus in Elstree covers over 100 acres and includes modern teaching facilities, science laboratories, art studios, a design and technology centre, and fully equipped ICT suites. The library is a major resource with thousands of books and online databases. The school also has a dining hall serving freshly prepared meals, with a range of healthy options available at breakfast, lunch, and after-school snacks.`
  },
  {
    source: 'School Overview',
    section: 'Transport',
    content: `Transport and Getting to School: Haberdashers' is well connected by road and public transport. The school runs a network of coach services from various locations across North London, Hertfordshire, and surrounding areas. The school is close to the M1 and A1 motorways, and Elstree & Borehamwood railway station is a short distance away with services to London St Pancras. Car parking is available on site for parents attending events.`
  },
  {
    source: 'School Life',
    section: 'School Day',
    content: `School Day: The school day at Haberdashers' runs from 8:30am to 4:00pm for most year groups. Registration takes place at 8:30am, followed by assemblies and lessons. There are two break times and a lunch period. After-school activities and clubs run until 5:00pm or later. Homework is set regularly and increases in volume as boys progress through the school. The school encourages a healthy balance between academic work and other activities.`
  },
  {
    source: 'Admissions Information',
    section: 'School Fees',
    content: `School Fees: Current school fees are published on the school website and are reviewed annually. Fees cover tuition, most textbooks, and access to school facilities. Additional charges may apply for individual music tuition, school trips, and some optional activities. Fees can be paid termly or annually, and a fees-in-advance scheme is available. The school is committed to keeping fees as reasonable as possible while maintaining the highest standards.`
  },
  {
    source: 'Academic Programme',
    section: 'University Destinations',
    content: `University Destinations: Haberdashers' has an excellent track record of university placements. Each year, a significant number of boys gain places at Oxford and Cambridge, with the majority going on to Russell Group universities. Popular destinations include UCL, Imperial College London, King's College London, Durham, and Edinburgh. The school also supports applications to universities overseas, including the US Ivy League. A dedicated team provides guidance on personal statements, interviews, and entrance tests.`
  },
  {
    source: 'School Overview',
    section: 'Prep School',
    content: `Prep School: The Haberdashers' Prep School caters for boys aged 4 to 11. It provides a nurturing environment where boys develop a love of learning through a broad curriculum and extensive enrichment activities. Boys in the Prep School benefit from specialist teaching in subjects including Science, Music, Art, PE, and Modern Languages from an early age. Most Prep School boys transition seamlessly into the Senior School at Year 7.`
  }
]

/**
 * Generate a simple embedding based on keyword presence
 * Creates a 384-dimensional vector
 */
function generateEmbedding(text) {
  const lowerText = text.toLowerCase()
  const embedding = new Array(384).fill(0)

  // Calculate TF for each keyword group
  KEYWORD_GROUPS.forEach((keywords, groupIndex) => {
    let score = 0
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi')
      const matches = lowerText.match(regex)
      if (matches) {
        score += matches.length
      }
    })

    // Spread the score across multiple dimensions for this group
    const startDim = groupIndex * 18
    for (let i = 0; i < 18 && startDim + i < 384; i++) {
      embedding[startDim + i] = score * (1 - i * 0.05)
    }
  })

  // Add some random noise for differentiation
  const seed = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  for (let i = 0; i < 384; i++) {
    embedding[i] += Math.sin(seed * (i + 1)) * 0.1
  }

  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  if (magnitude > 0) {
    for (let i = 0; i < 384; i++) {
      embedding[i] /= magnitude
    }
  }

  return embedding
}

function main() {
  console.log('Generating keyword-based embeddings for', ABOUT_HABS_CONTENT.length, 'chunks...')

  const chunks = ABOUT_HABS_CONTENT.map((item, index) => {
    console.log(`Processing: ${item.source} - ${item.section}`)

    return {
      id: `chunk-${index}`,
      content: item.content,
      embedding: generateEmbedding(item.content),
      metadata: {
        source: item.source,
        section: item.section,
        chunkIndex: index
      }
    }
  })

  // Write to chunks.json
  const outputPath = join(__dirname, '..', 'src', 'data', 'chunks.json')
  fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2))

  console.log(`\nDone! Generated ${chunks.length} chunks with 384-dimensional embeddings`)
  console.log(`Output saved to: ${outputPath}`)
}

main()
