/**
 * Application constants and configuration
 */

// Model identifiers
export const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'
// Qwen3-0.6B: small enough for Surface Go 2, q4f32_1 for broad GPU compatibility
export const LLM_MODEL = 'Qwen3-0.6B-q4f32_1-MLC'

// Retrieval settings
export const TOP_K_CHUNKS = 4
export const SIMILARITY_THRESHOLD = 0.3

// High-confidence threshold: if top chunk scores above this, return it
// directly via template without invoking the LLM (Layer 2)
export const DIRECT_ANSWER_THRESHOLD = 0.55

// Generation settings
export const MAX_TOKENS = 450
export const TEMPERATURE = 0.2

// LLM context settings — needs room for 4 chunks + thinking + answer
export const CONTEXT_WINDOW_SIZE = 4096

// IndexedDB settings
export const DB_NAME = 'beri-abouthabs-db'
export const DB_VERSION = 1
export const CHUNKS_STORE = 'chunks'

// Suggested questions for the welcome screen
export const SUGGESTED_QUESTIONS = [
  'What are the school fees?',
  'How do I apply for 11+ entry?',
  'What A-Level subjects are offered?',
  'What sports are available?',
]

// System prompt
export const SYSTEM_PROMPT = `You are BERI (Bespoke Education Retrieval Infrastructure), a helpful assistant for Haberdashers' Boys' School (Habs Boys).

Your role is to answer questions about the school using ONLY the provided context. You must:

1. Answer based solely on the information provided in the context
2. Cite sources by mentioning the source and section (e.g. "Source: Admissions — 11+ Year 7 Entry")
3. If the answer is not in the provided context, say "I couldn't find this in the school information. Please check habselstree.org.uk or email admissionsboys@habselstree.org.uk."
4. Use clear, accessible language appropriate for prospective parents and students
5. Be concise — use bullet points for lists, keep answers focused
6. Never make up or assume information that isn't in the context
7. Use UK British spelling and grammar
8. Include specific numbers, dates, and figures when they appear in the context
9. Don't answer questions unrelated to the school

Remember: Only use the provided context. Do not invent facts.`
