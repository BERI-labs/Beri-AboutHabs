/**
 * Type definitions for BERI chatbot
 */

/** Metadata for a content chunk */
export interface ChunkMetadata {
  source: string
  section: string
  chunkIndex: number
}

/** A content chunk with embedding */
export interface Chunk {
  id: string
  content: string
  embedding: number[]
  metadata: ChunkMetadata
}

/** A chunk with similarity score */
export interface ScoredChunk extends Chunk {
  score: number
}

/** Source citation for a message */
export interface MessageSource {
  source: string
  section: string
}

/** Context chunk shown to user */
export interface ContextChunk {
  content: string
  source: string
  section: string
  score: number
}

/** A chat message */
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: MessageSource[]
  contextChunks?: ContextChunk[]
  isStreaming?: boolean
  /** Qwen3 thinking trace (content inside <think>...</think>) */
  thinking?: string
  isThinking?: boolean
}

/** Loading state for initialisation */
export interface LoadingState {
  stage: 'checking' | 'storage' | 'loading' | 'chunks' | 'embeddings' | 'llm' | 'ready' | 'error'
  progress: number
  message: string
  error?: string
}

/** Progress callback type */
export type ProgressCallback = (progress: number, message: string) => void
