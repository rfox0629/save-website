# SAVE Website Summary

Last updated: April 14, 2026

## Purpose

This document summarizes the current SAVE platform so the site can be simplified without losing any already-built surfaces.

It includes:
- the main product areas
- the current route inventory
- which pages feel primary vs secondary
- simplification opportunities
- a recommended MVP metrics dashboard plan using spreadsheet data first, then DOS later

## Current Product Structure

The site currently has six major product surfaces:

1. Public marketing site
2. Auth
3. Internal SAVE team workflow
4. Ministry portal
5. Donor experience
6. Utility / special-purpose pages

## High-Level Site Map

### Public marketing

- `/`
  - Main homepage / landing page
- `/about`
  - Public explanation of SAVE and the standard
- `/for-donors`
  - Donor-facing marketing page
- `/for-ministries`
  - Ministry-facing marketing page

### Auth

- `/login`
  - Sign-in page
- `/register`
  - Ministry registration / onboarding entry
- `/auth/confirm`
  - Magic-link confirmation callback

### Internal SAVE team

- `/dashboard`
  - Internal reviewer/admin dashboard
- `/applications/[id]`
  - Internal application detail / reviewer page
  - Example: `/applications/22222222-2222-4222-8222-222222222222`
- `/applications/[id]/brief`
  - Internal donor brief editor / publish controls
  - Example: `/applications/22222222-2222-4222-8222-222222222222/brief`
- `/applications/[id]/brief/export`
  - Print / PDF export page
  - Example: `/applications/22222222-2222-4222-8222-222222222222/brief/export`
- `/applications/compare`
  - Internal nonprofit comparison view
- `/admin/donor-requests`
  - Admin-only donor access request queue
- `/map`
  - Internal route map / sitemap / control panel

### Ministry portal

- `/portal`
  - Ministry portal overview / status page
- `/portal/inquiry`
  - Inquiry form
- `/portal/application`
  - Complete application
- `/portal/documents`
  - Document center
- `/portal/vetting`
  - Legacy redirect to `/portal/application`

### Donor experience

- `/donors`
  - Authenticated donor dashboard
- `/donors/[slug]`
  - Public donor brief route
  - Example: `/donors/new-city-fellowship-brief`
- `/donors/request-access`
  - Donor access request page
- `/donors/compare`
  - Authenticated donor comparison view

### Utility / special-purpose

- `/brief/[slug]`
  - Legacy brief route
  - Example: `/brief/new-city-fellowship-brief`
- `/voice-alignment/[token]`
  - Invite-only Voice Alignment response form

## API / Background Routes

These are not primary website pages, but they are part of the product system and should not be accidentally removed during simplification.

- `/api/brief`
- `/api/score`
- `/api/scoring`
- `/api/status/[applicationId]`
- `/api/applications/[id]/ai-summary`
- `/api/applications/[id]/assign-reviewer`
- `/api/applications/[id]/documents/[documentId]/review`
- `/api/applications/[id]/external-checks`
- `/api/applications/[id]/flags/[flagId]/resolve`
- `/api/applications/[id]/notes`
- `/api/applications/[id]/scores/override`
- `/api/applications/[id]/status`
- `/api/applications/[id]/voice-alignment/requests`
- `/api/applications/[id]/voice-alignment/summary`
- `/api/vetting/[applicationId]/run`
- `/api/voice-alignment/[token]/response`

## Current Page Roles

### Primary pages worth preserving as top-level product surfaces

- `/`
- `/for-donors`
- `/for-ministries`
- `/login`
- `/register`
- `/dashboard`
- `/portal`
- `/donors`
- `/donors/[slug]`
- `/applications/[id]`
- `/applications/[id]/brief`

### Important but secondary pages

- `/about`
- `/donors/request-access`
- `/applications/compare`
- `/donors/compare`
- `/applications/[id]/brief/export`
- `/portal/inquiry`
- `/portal/application`
- `/portal/documents`

### Hidden / utility pages that should stay but not be emphasized

- `/map`
- `/auth/confirm`
- `/brief/[slug]`
- `/voice-alignment/[token]`
- `/portal/vetting` (redirect only)

## Simplification Opportunities

The current site can be simplified without deleting working surfaces.

### 1. Simplify top-level navigation

Recommended core nav:
- Home
- For Donors
- For Ministries
- Sign In

Potentially remove from top-level public nav:
- About

Keep `/about`, but it can become supporting content rather than a primary nav item.

### 2. Consolidate donor experience around two surfaces

Donor-facing primary flow should be:
- `/donors`
- `/donors/[slug]`

Secondary donor tools:
- `/donors/compare`
- `/donors/request-access`

This keeps the donor story simple while preserving all built work.

### 3. Consolidate ministry experience around one portal hub

Ministry experience should feel like one system with `/portal` as the hub:
- overview
- inquiry
- complete application
- documents

This is already mostly true and should be reinforced, not expanded.

### 4. Keep internal reviewer experience centered on three pages

Internal SAVE team core flow:
- `/dashboard`
- `/applications/[id]`
- `/applications/[id]/brief`

Everything else should feel like support tooling, not primary navigation.

### 5. Treat comparisons and PDF export as tools, not destinations

These are valuable but should remain utility actions:
- compare pages
- brief export page
- map page

## Pages That Could Be Hidden More Aggressively

These do not need to be deleted, but they should likely stay out of obvious user-facing navigation:

- `/about`
- `/brief/[slug]`
- `/map`
- `/donors/compare`
- `/applications/compare`
- `/applications/[id]/brief/export`

## Existing Sample / Test Links

These are useful for internal review and demos:

- Public donor brief:
  - `/donors/new-city-fellowship-brief`
- Legacy brief route:
  - `/brief/new-city-fellowship-brief`
- Sample application:
  - `/applications/22222222-2222-4222-8222-222222222222`
- Sample internal donor brief editor:
  - `/applications/22222222-2222-4222-8222-222222222222/brief`
- Sample export:
  - `/applications/22222222-2222-4222-8222-222222222222/brief/export`

## Recommended Simplified Information Architecture

If the goal is a simpler site without losing functionality, the clearest structure is:

### Public

- `/`
- `/for-donors`
- `/for-ministries`
- `/login`

### Internal SAVE team

- `/dashboard`
- `/applications/[id]`
- `/applications/[id]/brief`

### Ministry

- `/portal`
- `/portal/inquiry`
- `/portal/application`
- `/portal/documents`

### Donor

- `/donors`
- `/donors/[slug]`

### Support / utility

- `/donors/request-access`
- `/donors/compare`
- `/applications/compare`
- `/map`
- `/brief/[slug]`

## Metrics Dashboard Recommendation

You mentioned wanting a metrics dashboard that pulls from a spreadsheet for now, and later from DOS.

That is a good fit for a dedicated internal surface.

### Recommended MVP location

Add one new internal route:

- `/metrics`

This should be:
- internal-only
- light SAVE styling
- simple and executive-readable
- focused on a few top-line KPIs plus trends

### Recommended MVP data source

For now:
- use a spreadsheet export
- CSV is easiest
- one upload or one synced file path

Later:
- replace the spreadsheet adapter with DOS data ingestion
- keep the dashboard UI mostly unchanged

### Recommended MVP metrics

Start with a small set of high-signal metrics:

- total ministries in pipeline
- inquiries submitted
- applications completed
- under review
- approved
- declined
- donor briefs published
- average SAVE score
- number of donor-access users
- time from inquiry to decision
- time from approval to published brief

### Spreadsheet-first architecture

For the first version, keep it simple:

1. One spreadsheet tab or CSV for applications / pipeline
2. One spreadsheet tab or CSV for donor / engagement metrics if needed
3. One normalization layer in app code
4. One internal dashboard page rendering clean KPI cards + a few tables

### Suggested implementation pattern

- Add a loader under `lib/metrics.ts`
- Read from:
  - a checked-in CSV for development
  - or a file placed in `/data`
  - or a Google Sheet export URL if needed later
- Render in:
  - `/app/(auth)/metrics/page.tsx`

### Long-term DOS-ready design

Design the metrics layer with one adapter boundary:

- `getMetricsData()` returns normalized metrics
- current adapter = spreadsheet
- future adapter = DOS

That way the UI does not need to change when the source changes.

## Suggested Next Steps

If you want to simplify the site safely, I would do it in this order:

1. Decide the final primary navigation
2. Mark all non-primary routes as utility/support pages
3. Keep all working pages, but reduce how many are surfaced
4. Add one internal `/metrics` dashboard using spreadsheet-backed data
5. Later replace the metrics data adapter with DOS

## Short Version

The site already has strong functionality. The main simplification opportunity is not deleting pages, but reducing how many pages feel primary.

Best simplification strategy:
- keep all built routes
- emphasize fewer core routes
- move support tooling into the background
- add one clear internal metrics dashboard with a spreadsheet-backed MVP
