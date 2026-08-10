# DogBreederDocs.online

DogBreederDocs.online is a Next.js application for purchasing, customizing, saving, and reusing state-aware dog breeder documents.

## Deployment model

GitHub is the source of truth for this project.

- Repository: `rawillia9801/bddocs`
- Production branch: `main`
- Hosting: Vercel
- Deployment flow: GitHub `main` → Vercel production deployment
- Framework: Next.js
- Root directory: repository root

Do not treat a direct Vercel upload as the canonical deployment workflow. Production should be connected to this GitHub repository so pushes to `main` create the corresponding Vercel deployment.

## Current product model

- $9.99 one-time for one reusable document template
- $29.95 one-time for the complete breeder packet
- Complete editable packet included with eligible MyDogPortal Professional and Studio subscriptions
- Supabase Auth for signup and login
- Per-user Supabase documents protected by Row Level Security
- Guided editor for logo, header, body, footer, clause selection, custom clauses, and state
- Connected MyDogPortal document workflows can reuse breeder, buyer, puppy, and placement information and retain signed/final copies with the appropriate records

Standalone purchases remain reusable in the purchaser's account. MyDogPortal-provided packet access is an included-plan entitlement rather than a separate purchase: it is granted while an eligible Professional or Studio subscription is active and removed when that plan entitlement ends. A breeder's separately purchased DogBreederDocs documents are not removed by a MyDogPortal cancellation or downgrade.

## Supabase and Vercel configuration

The application uses the existing MyDogPortal Supabase project. Production environment variables belong in the existing Vercel project connected to this repository. Use `.env.example` as the reference for required variable names; do not commit production secrets to GitHub.

After the GitHub repository is connected to the Vercel project, pushes to `main` should build and deploy automatically.

## Verification

Run these checks before pushing production changes:

```bash
npm run lint
npm run build
```

Successful verification means the source is ready to push; the actual production release is the Vercel deployment created from the GitHub `main` branch.
