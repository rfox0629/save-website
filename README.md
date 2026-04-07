# SAVE Platform

SAVE is a grant diligence and review platform designed to serve both ministries and donors. Ministries can submit inquiry and vetting materials, upload supporting documents, and track application progress. Internal reviewers can score applications, manage flags, review evidence, and produce donor-facing briefs. Donors ultimately receive clear, publishable ministry briefs that summarize diligence without exposing internal review data.

## Tech Stack

- Next.js 14 with the App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth, Postgres, Storage, and SSR helpers
- React Hook Form and Zod for forms and validation
- ESLint and Prettier

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

3. Start the dev server:

```bash
npm run dev
```

4. Open the app in your browser:

```text
http://localhost:3000
```

## Project Areas

- Public marketing pages for ministries and donors
- Ministry portal for inquiry, vetting, and document uploads
- Reviewer dashboard for internal application review
- Scoring engine and risk flag generation
- Donor brief editor and public donor brief pages

## Quality Checks

Run the standard checks before pushing changes:

```bash
npm run lint
npm run build
```
