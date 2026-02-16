/**
 * Application constants and configuration
 */

// Model identifiers
export const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'
// Qwen3-0.6B: small enough for Surface Go 2, q4f32_1 for broad GPU compatibility
export const LLM_MODEL = 'Qwen3-0.6B-q4f32_1-MLC'

// Retrieval settings
export const TOP_K_CHUNKS = 3
export const SIMILARITY_THRESHOLD = 0.3

// Generation settings
export const MAX_TOKENS = 512
export const TEMPERATURE = 0.2

// LLM context settings — needs room for system prompt + 3 chunks + thinking + answer
export const CONTEXT_WINDOW_SIZE = 8192

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

// System prompt — kept concise to minimise prefill latency
export const SYSTEM_PROMPT = `You are BERI, a helpful assistant for Haberdashers' Boys' School (Habs Boys). Answer using ONLY the provided context.

Rules:
- Directly address the user's question; be concise, use bullet points for lists
- Cite sources (e.g. "Source: Admissions — 11+ Year 7 Entry")
- If not in context, say "I couldn't find this in the school information. Please check habselstree.org.uk or email admissionsboys@habselstree.org.uk."
- Never invent facts; include specific numbers/dates from context
- Use UK British spelling
- Ignore questions unrelated to the school`

// Appended to system prompt when thinking mode is on
export const THINKING_INSTRUCTION = '\n- When reasoning in <think> blocks, keep your thinking to at most 3 concise sentences before giving your answer.'
