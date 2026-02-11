# Beri-AboutHabs

BERI (Bespoke Education Retrieval Infrastructure) - About Habs Chatbot

A browser-based RAG chatbot that helps prospective families and students learn about Haberdashers' School. Powered by WebLLM and Transformers.js, it runs entirely in-browser with no server required.

## Features

- Semantic search over school information (admissions, curriculum, school life, etc.)
- In-browser LLM inference via WebGPU
- FAQ cache for instant responses to common questions
- Streaming responses with source citations
- Works offline after initial model download

## Getting Started

```bash
cd beri
npm install
npm run dev
```

## Generating Embeddings

To regenerate chunk embeddings with the real model:

```bash
cd beri
node scripts/generate-embeddings.mjs
```

Or use the simple keyword-based embeddings (no model download needed):

```bash
cd beri
node scripts/generate-simple-embeddings.mjs
```

## Deployment

The site deploys automatically to GitHub Pages via the `.github/workflows/deploy.yml` workflow on push to `main`.

## Requirements

- WebGPU-compatible browser (Chrome 113+ or Microsoft Edge)