/**
 * Generate real transformer-based embeddings from about-habs.md
 * Run with: node scripts/generate-embeddings.mjs
 *
 * Requires: npm install (needs @xenova/transformers)
 * Downloads the MiniLM model on first run (~80 MB).
 */

import { pipeline, env } from '@xenova/transformers'
import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

env.allowLocalModels = false

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ---------------------------------------------------------------------------
// Markdown parser (same logic as generate-simple-embeddings.mjs)
// ---------------------------------------------------------------------------

function parseMarkdown(markdown) {
  // Normalise Windows \r\n to \n so split patterns work cross-platform
  const blocks = markdown.replace(/\r\n/g, '\n').split(/\n---\n/)
  const chunks = []
  let currentSource = 'General'

  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed || trimmed.length < 80) continue
    if (trimmed.startsWith('# Haberdashers') || trimmed.startsWith('*Dataset compiled')) continue

    const h2Match = trimmed.match(/^## (.+)$/m)
    if (h2Match) currentSource = h2Match[1].trim()

    const h3Parts = trimmed.split(/(?=^### )/m).filter(s => s.trim().length > 0)

    if (h3Parts.length > 1 && trimmed.length > 1800) {
      let carryOver = ''
      for (const part of h3Parts) {
        const p = part.trim()
        if (!p) continue

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
          metadata: { source: currentSource, section: sectionName, chunkIndex: chunks.length },
        })
      }
    } else {
      const h3Match = trimmed.match(/^### (.+)$/m)
      const sectionName = h3Match ? h3Match[1].trim() : (h2Match ? h2Match[1].trim() : currentSource)

      chunks.push({
        id: `chunk-${chunks.length}`,
        content: trimmed,
        metadata: { source: currentSource, section: sectionName, chunkIndex: chunks.length },
      })
    }
  }

  return chunks
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const mdPath = join(__dirname, '..', 'src', 'data', 'about-habs.md')
  console.log('Reading source:', mdPath)
  const markdown = fs.readFileSync(mdPath, 'utf-8')

  const parsed = parseMarkdown(markdown)
  console.log(`Parsed ${parsed.length} chunks from markdown`)

  console.log('Loading embedding model (this may take a minute)...')
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  console.log('Model loaded!\n')

  const chunks = []

  for (let i = 0; i < parsed.length; i++) {
    const chunk = parsed[i]
    console.log(`  [${i + 1}/${parsed.length}] ${chunk.metadata.source} → ${chunk.metadata.section}`)

    const output = await embedder(chunk.content, { pooling: 'mean', normalize: true })
    const embedding = Array.from(output.data)

    chunks.push({ ...chunk, embedding })
  }

  const outputPath = join(__dirname, '..', 'src', 'data', 'chunks.json')
  fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2))

  if (chunks.length === 0) {
    console.error('\nError: No chunks were parsed. Check that about-habs.md exists and uses --- separators.')
    process.exit(1)
  }

  console.log(`\nDone! Generated ${chunks.length} chunks with ${chunks[0].embedding.length}-dimensional embeddings`)
  console.log(`Output saved to: ${outputPath}`)
}

main().catch(console.error)
