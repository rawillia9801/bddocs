# DogBreederDocs.online

A Vercel-hosted Next.js application for purchasing, customizing, saving, and reusing state-aware dog breeder documents.

## Current product model

- $9.99 one-time for one reusable document template
- $29.95 one-time for the complete breeder packet
- Complete editable packet included with eligible MyDogPortal Professional and Studio subscriptions
- Supabase Auth for signup and login
- Per-user Supabase documents protected by Row Level Security
- Guided editor for logo, header, body, footer, clause selection, custom clauses, and state
- Connected MyDogPortal document workflows can reuse breeder, buyer, puppy, and placement information and retain signed/final copies with the appropriate records

Standalone purchases remain reusable in the purchaser's account. MyDogPortal-provided packet access is an included-plan entitlement rather than a separate purchase: it is granted while an eligible Professional or Studio subscription is active and removed when that plan entitlement ends. A breeder's separately purchased DogBreederDocs documents are not removed by a MyDogPortal cancellation or downgrade.

The application is connected to the My Dog Portal Supabase project. Add the public values from `.env.example` to the corresponding Vercel project environment variables before deployment.

## Verification

```bash
npm run lint
npm run build
```
