# DogBreederDocs.online

A Vercel-hosted Next.js application for purchasing, customizing, saving, and reusing state-aware dog breeder documents.

## Current product model

- $9.99 one-time for one reusable document template
- $19.95 one-time for the complete breeder packet
- Supabase Auth for signup and login
- Per-user Supabase documents protected by Row Level Security
- Guided editor for logo, header, body, footer, clause selection, custom clauses, and state

Supabase is intentionally unconnected. Add the values from `.env.example` to Vercel when the project is ready.

## Verification

```bash
npm run lint
npm run build
```
