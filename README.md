# GiftOS — Gifting Campaign

A Revenue OS prototype that helps sales teams run personalised gifting campaigns. The system researches contacts from mock social profiles, automatically detects their personal interests using a rule-based engine, and generates curated gift recommendations scaled to deal size.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2 (App Router, server components) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg`) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Runtime | Node.js 20+ |

---

## Features

- **10 mock accounts** across industries and cities with 25 contacts and varied ACV ($75K–$400K)
- **Multi-select bulk research** — select any number of contacts, click one button to run the full pipeline for all of them
- **3-stage background pipeline** — Profile Research → Interest Extraction → Gift Generation, each persisted as a `ResearchJob` record with full status history
- **Rule-based interest extraction** — 10 categories, keyword matching on social profile `rawText`, with confidence scoring and evidence snippets
- **Gift recommendation engine** — 30 curated templates (10 interest categories × 3 ACV tiers: Strategic / Enterprise / Mid-Market)
- **Filterable + sortable gifts** — filter by status, category, type, budget; sort by cost (high→low, low→high) or date
- **Approve / Reject / track** — 6-state gift status lifecycle (DRAFT → APPROVED → ORDERED → SENT → DELIVERED or REJECTED)
- **Background worker** — standalone polling process (`npm run worker`) picks up PENDING jobs every 5 s without requiring the web server

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase free tier works)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

### 3. Run migrations

```bash
npx prisma migrate deploy
```

### 4. Seed mock data

```bash
npx prisma db seed
# Seeds: 10 accounts, 25 contacts, ~30 social profiles with interest signals
```

### 5. Start the app

```bash
npm run dev
# Open http://localhost:3000
```

### 6. (Optional) Start the background worker

In a **separate terminal**:

```bash
npm run worker
```

The worker polls the database every 5 seconds for `PENDING` jobs and processes them automatically. If you don't run it, clicking **Research** in the UI processes the pipeline synchronously — both approaches produce identical DB results.

---

## Usage Walkthrough

### Research contacts and generate gifts

1. Open **Contacts** (`/contacts`)
2. Use the filter bar to narrow by tier, status, city, ACV range, or detected interest category
3. Select one or more contacts using the row checkboxes (or the header to select all)
4. Click **Research & Generate Gifts (N)** — the full 3-stage pipeline runs for each selected contact
5. Open any contact to see **detected interests** (with confidence bars and evidence quotes) and **gift recommendations**

### Review and approve gifts

1. Open **Gifts** (`/gifts`)
2. Filter by status (`DRAFT` shows all pending approvals), category, type, or budget range
3. Use **Sort by** to order by cost (high→low or low→high) or newest first
4. Click **✓ Approve** or **✗ Reject** on any DRAFT gift
5. Track approved gifts through ORDERED → SENT → DELIVERED via the API

### Monitor the job pipeline

1. Open **Jobs** (`/jobs`)
2. The page auto-refreshes every 5 seconds
3. Each pipeline step is shown as a numbered row: **1** Profile Research · **2** Interest Extraction · **3** Gift Generation
4. Running jobs show a pulsing amber indicator

---

## Project Structure

```
gifting-campaign/
├── prisma/
│   ├── schema.prisma              # Data model (6 tables, 9 enums)
│   ├── seed.ts                    # Mock data: 10 accounts, 25 contacts
│   └── migrations/                # Migration history
├── prisma.config.ts               # Prisma 7 CLI config (URL, seed path, migrations)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── contacts/route.ts          # GET contacts with filters
│   │   │   ├── contacts/[id]/route.ts     # GET contact detail
│   │   │   ├── contacts/[id]/research/    # POST trigger pipeline
│   │   │   ├── gifts/route.ts             # GET gifts with filters
│   │   │   ├── gifts/[id]/route.ts        # PATCH gift status
│   │   │   └── jobs/route.ts              # GET jobs with filters
│   │   ├── contacts/
│   │   │   ├── page.tsx                   # List + filter + multi-select
│   │   │   └── [id]/page.tsx              # Detail: interests, jobs, gifts
│   │   ├── gifts/page.tsx                 # Grid + filter + sort + approve
│   │   ├── jobs/page.tsx                  # Monitor + auto-refresh
│   │   └── page.tsx                       # Dashboard with stat cards
│   ├── components/
│   │   ├── ContactsTable.tsx    # Multi-select table (client)
│   │   ├── GiftActions.tsx      # Approve/Reject buttons (client)
│   │   ├── ResearchButton.tsx   # Single-contact research (client)
│   │   ├── AutoRefresh.tsx      # router.refresh() on interval (client)
│   │   └── Nav.tsx              # Top navigation (client)
│   ├── lib/
│   │   ├── prisma.ts                # Singleton PrismaClient + PrismaPg adapter
│   │   ├── interest-extractor.ts    # Rule-based NLP engine
│   │   ├── gift-recommender.ts      # Gift catalog (category × tier)
│   │   └── job-processor.ts         # Job state machine + pipeline orchestrator
│   └── workers/
│       └── researchWorker.ts        # Standalone polling background worker
├── TECH_SPEC.md
└── README.md
```

---

## API Reference

All endpoints return `{ data, total? }` on success or `{ error }` on failure.

### Contacts

| Method | Endpoint | Query / Body |
|--------|----------|-------------|
| `GET` | `/api/contacts` | `tier`, `status`, `city`, `interestCategory`, `minAcv`, `maxAcv` |
| `GET` | `/api/contacts/:id` | — |
| `POST` | `/api/contacts/:id/research` | `?immediate=true` (default) · `?immediate=false` for async/worker mode |

`immediate=true` runs all three stages synchronously and returns the updated contact.  
`immediate=false` creates a single `PENDING` job and returns `202 Accepted`; the worker takes over.

### Gifts

| Method | Endpoint | Query / Body |
|--------|----------|-------------|
| `GET` | `/api/gifts` | `status`, `category`, `giftType`, `minBudget`, `maxBudget` |
| `PATCH` | `/api/gifts/:id` | `{ "status": "APPROVED" \| "REJECTED" \| "ORDERED" \| "SENT" \| "DELIVERED" }` |

### Jobs

| Method | Endpoint | Query |
|--------|----------|-------|
| `GET` | `/api/jobs` | `status`, `jobType`, `contactId` |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm run worker` | Start background job worker |
| `npx prisma db seed` | Seed mock data (safe to re-run — clears first) |
| `npx prisma studio` | Open Prisma Studio DB browser |
| `npx prisma migrate dev` | Create a new migration after schema changes |
