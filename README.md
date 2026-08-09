# DogBreederDocs.online

A Vercel-hosted Next.js application for purchasing, customizing, saving, and reusing state-aware dog breeder documents.

## Current product model

- $9.99 one-time for one reusable document template
- $19.95 one-time for the complete breeder packet
- Supabase Auth for signup and login
- Per-user Supabase documents protected by Row Level Security
- Guided editor for logo, header, body, footer, clause selection, custom clauses, and state

The application is connected to the My Dog Portal Supabase project. Add the public values from `.env.example` to the corresponding Vercel project environment variables before deployment.

## Verification

```bash
npm run lint
npm run build
```
