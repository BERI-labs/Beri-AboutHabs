/**
 * Embeddings layer using Transformers.js
 */

import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers'
import { EMBEDDING_MODEL } from './constants'
import type { ProgressCallback } from '@/types'

let embedder: FeatureExtractionPipeline | null = null

/**
 * Initialise the embedding model
 * @param onProgress - Progress callback for loading updates
 */
export async function initEmbeddings(onProgress?: ProgressCallback): Promise<void> {
  onProgress?.(0, 'Loading embedding model...')

  embedder = await pipeline('feature-extraction', EMBEDDING_MODEL, {
    progress_callback: (data: { progress?: number; status?: string }) => {
      if (data.progress !== undefined) {
        onProgress?.(Math.round(data.progress), `Loading embedding model: ${Math.round(data.progress)}%`)
      }
    },
  })

  // Warm up the model with a dummy embedding
  onProgress?.(95, 'Warming up embedding model...')
  await embedder('warmup', { pooling: 'mean', normalize: true })

  onProgress?.(100, 'Embedding model ready')
}

/**
 * Generate embedding for a text query
 * @param text - The text to embed
 * @returns The embedding vector (384 dimensions)
 */
export async function embed(text: string): Promise<number[]> {
  if (!embedder) {
    throw new Error('Embedding model not initialised')
  }

  const output = await embedder(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}
