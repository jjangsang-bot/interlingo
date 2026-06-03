# InterLingo App

Recall-first multilingual learning MVP built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Getting Started

```bash
npm install
npm run dev
```

Local URL:

```txt
http://localhost:3000
```

## Current Scope

Implemented:

- Initial PWA-ready Next.js app structure
- Mobile-first home dashboard
- Local travel review session with 10 sample questions
- Korean prompts, English answer input, progressive hints, answer reveal, grading, and next-question flow
- Local answer grading with normalization, fuzzy matching, and partial-answer feedback
- Session completion summary with totals, accuracy, learned sentences, wrong sentences, user answers, and recommended answers
- localStorage learning history for saved sessions, dashboard stats, recent sessions, streaks, and dev reset
- localStorage sentence review states with forgetting-curve intervals and due-first practice
- Multilingual interleaving practice across Korean, English, and Japanese directions
- Review scheduling utility
- Answer normalization utility
- MVP package setup

Planned next:

- Supabase client setup
- Learning setup page
- OpenAI-powered semantic evaluation API route
- Review schedule persistence

## Important Notes

`npm audit` currently reports a moderate PostCSS advisory through Next.js' internal dependency tree. The project is already on the latest stable Next.js version checked during setup, `16.2.7`. `npm audit fix --force` proposes a breaking downgrade path, so it was not applied.
