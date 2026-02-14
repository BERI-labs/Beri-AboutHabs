/**
 * Generate simple keyword-based embeddings from the about-habs.md source file
 * Run with: node scripts/generate-simple-embeddings.mjs
 */

import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ---------------------------------------------------------------------------
// 1. Parse the markdown source file into chunks
// ---------------------------------------------------------------------------

/**
 * Parse about-habs.md into self-contained chunks.
 * Strategy:
 *   - Split on `---` separators (the file's natural chunk boundaries)
 *   - Track the current ## heading as the "source" category
 *   - Use the first ### heading in each block as the "section" name
 *   - For large blocks (>1800 chars) with multiple ### headings, split further
 *   - Skip very small blocks (<80 chars) like the title line
 */
function parseMarkdown(markdown) {
  // Normalise Windows \r\n to \n so split patterns work cross-platform
  const blocks = markdown.replace(/\r\n/g, '\n').split(/\n---\n/)
  const chunks = []
  let currentSource = 'General'

  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed || trimmed.length < 80) continue
    // Skip the title header and compiled-from footer
    if (trimmed.startsWith('# Haberdashers') || trimmed.startsWith('*Dataset compiled')) continue

    // Update current source if block contains a ## heading
    const h2Match = trimmed.match(/^## (.+)$/m)
    if (h2Match) currentSource = h2Match[1].trim()

    // Check if block has multiple ### sections AND is large
    const h3Parts = trimmed.split(/(?=^### )/m).filter(s => s.trim().length > 0)

    if (h3Parts.length > 1 && trimmed.length > 1800) {
      // Split into individual ### sections
      let carryOver = ''
      for (const part of h3Parts) {
        const p = part.trim()
        if (!p) continue

        // If this part is just a ## heading without ###, carry it forward
        const hasH3 = /^### /m.test(p)
        if (!hasH3 && p.length < 120) {
          const subH2 = p.match(/^## (.+)$/m)
          if (subH2) currentSource = subH2[1].trim()
          carryOver = p + '\n\n'
          continue
        }

        const content = carryOver + p
        carryOver = ''

        const h3Match = content.match(/^### (.+)$/m)
        const sectionName = h3Match ? h3Match[1].trim() : currentSource

        chunks.push({
          id: `chunk-${chunks.length}`,
          content,
          metadata: {
            source: currentSource,
            section: sectionName,
            chunkIndex: chunks.length,
          },
        })
      }
    } else {
      // Keep block as a single chunk
      const h3Match = trimmed.match(/^### (.+)$/m)
      const sectionName = h3Match ? h3Match[1].trim() : (h2Match ? h2Match[1].trim() : currentSource)

      chunks.push({
        id: `chunk-${chunks.length}`,
        content: trimmed,
        metadata: {
          source: currentSource,
          section: sectionName,
          chunkIndex: chunks.length,
        },
      })
    }
  }

  return chunks
}

// ---------------------------------------------------------------------------
// 2. Keyword groups tuned for About Habs content (384-dim to match MiniLM)
// ---------------------------------------------------------------------------

const KEYWORD_GROUPS = [
  // School identity (dims 0-17)
  ['haberdashers', 'habs', 'elstree', 'butterfly lane', 'hertfordshire', 'independent', 'campus', 'co-educational'],
  // Vision / values (dims 18-35)
  ['vision', 'values', 'ambitious', 'curious', 'courageous', 'community', 'mission', 'purpose', 'profound impact'],
  // Admissions general (dims 36-53)
  ['admission', 'admissions', 'apply', 'application', 'entry', 'entrance', 'register', 'registration', 'deadline'],
  // 4+ / 7+ entry (dims 54-71)
  ['reception', '4+', 'play-based', '7+', 'year 3', 'nursery', 'prep entry'],
  // 11+ entry (dims 72-89)
  ['11+', 'eleven plus', 'year 7', 'key stage 2', 'verbal reasoning', 'non-verbal', 'familiarisation'],
  // 13+ / 16+ entry (dims 90-107)
  ['13+', 'year 9', '16+', 'sixth form entry', 'gcse grade', 'general paper', 'deferred'],
  // Interview / offers (dims 108-125)
  ['interview', 'second round', 'offer', 'acceptance', 'assessment', 'invited'],
  // Fees (dims 126-143)
  ['fee', 'fees', 'cost', 'tuition', 'price', 'termly', 'annual', 'vat', 'tax'],
  // Financial support (dims 144-161)
  ['bursary', 'bursaries', 'scholarship', 'scholarships', 'means-tested', 'financial', 'discount', 'deposit'],
  // Payment / extras (dims 162-179)
  ['payment', 'direct debit', 'monthly', 'advance', 'device', 'music lesson', 'instrument'],
  // GCSE / results (dims 180-197)
  ['gcse', 'results', 'grade 9', 'grade 8', 'grade 7', 'a*', 'exam', 'national curriculum'],
  // A-level / sixth form (dims 198-215)
  ['a-level', 'a level', 'sixth form', 'diploma', 'buckingham', 'subject', 'further maths'],
  // University (dims 216-233)
  ['university', 'oxbridge', 'oxford', 'cambridge', 'russell group', 'ucas', 'career', 'destination'],
  // Sport (dims 234-251)
  ['sport', 'rugby', 'cricket', 'football', 'hockey', 'swimming', 'athletics', 'fitness', 'habsdash'],
  // High-performance sport (dims 252-269)
  ['saracens', 'middlesex', 'watford', 'lords', 'stonex', 'national', 'competition', 'partnership'],
  // Music / drama (dims 270-287)
  ['music', 'orchestra', 'choir', 'instrument', 'concert', 'drama', 'theatre', 'production', 'performance'],
  // Prep school (dims 288-305)
  ['prep', 'junior', 'reception', 'year 1', 'year 2', 'forest school', 'wraparound', 'premier education'],
  // School day / transport (dims 306-323)
  ['school day', 'timetable', 'hours', 'registration', 'coach', 'transport', 'breakfast', 'after-school'],
  // Pastoral / houses (dims 324-341)
  ['pastoral', 'house', 'wellbeing', 'tutor', 'calverts', 'hendersons', 'joblings', 'meadows', 'russells', 'strouts'],
  // Facilities (dims 342-359)
  ['facilities', 'campus', 'medburn', 'aldenham', 'seldon', 'innovation centre', 'swimming pool', 'gym', 'library'],
  // Contact (dims 360-377)
  ['contact', 'email', 'phone', 'telephone', 'address', 'admissionsboys', 'feesboys', 'website'],
  // Governance / history (dims 378-384 + overflow)
  ['governance', 'strategy', 'strategic', 'haberdashers company', 'isi', 'hmc', 'merger', 'lochinver'],
]

// ---------------------------------------------------------------------------
// 3. Embedding generation
// ---------------------------------------------------------------------------

function generateEmbedding(text) {
  const lowerText = text.toLowerCase()
  const embedding = new Array(384).fill(0)

  KEYWORD_GROUPS.forEach((keywords, groupIndex) => {
    let score = 0
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      const matches = lowerText.match(regex)
      if (matches) score += matches.length
    })

    const startDim = groupIndex * 18
    for (let i = 0; i < 18 && startDim + i < 384; i++) {
      embedding[startDim + i] = score * (1 - i * 0.05)
    }
  })

  // Deterministic noise for differentiation
  const seed = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  for (let i = 0; i < 384; i++) {
    embedding[i] += Math.sin(seed * (i + 1)) * 0.1
  }

  // L2 normalise
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  if (magnitude > 0) {
    for (let i = 0; i < 384; i++) {
      embedding[i] /= magnitude
    }
  }

  return embedding
}

// ---------------------------------------------------------------------------
// 4. Main
// ---------------------------------------------------------------------------

function main() {
  const mdPath = join(__dirname, '..', 'src', 'data', 'about-habs.md')
  console.log('Reading source:', mdPath)
  const markdown = fs.readFileSync(mdPath, 'utf-8')

  const parsed = parseMarkdown(markdown)
  console.log(`Parsed ${parsed.length} chunks from markdown\n`)

  // Output content-only chunks (no embeddings).
  // The browser generates real MiniLM embeddings on first load and caches
  // them in IndexedDB, so subsequent visits are instant.
  // To pre-compute embeddings, run: node scripts/generate-embeddings.mjs
  parsed.forEach((chunk) => {
    console.log(`  [${chunk.id}] ${chunk.metadata.source} → ${chunk.metadata.section}  (${chunk.content.length} chars)`)
  })

  const outputPath = join(__dirname, '..', 'src', 'data', 'chunks.json')
  fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2))

  console.log(`\nDone! ${parsed.length} content-only chunks (embeddings generated at runtime)`)
  console.log(`Output saved to: ${outputPath}`)
}

main()
