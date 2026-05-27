# TECH_SPEC — GiftOS Gifting Campaign

## 1. System Overview

GiftOS is a full-stack Revenue OS prototype that automates personalised gifting campaigns for sales teams. Given a set of contacts associated with accounts, the system:

1. **Researches** their public social profiles (mocked with seeded `rawText`)
2. **Extracts** personal interest categories via a rule-based NLP engine
3. **Generates** gift recommendations matched to interest category and deal size (ACV)
4. **Presents** a filterable, sortable dashboard for reviewing and approving gifts

### High-level architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                             │
│   Next.js App Router (server components + RSC)          │
│   Client components: ContactsTable, GiftActions, Nav    │
└──────────────┬──────────────────────────────────────────┘
               │ HTTP (server component fetch / client fetch)
┌──────────────▼──────────────────────────────────────────┐
│              Next.js API Routes (/api/*)                 │
│   contacts · contacts/:id · contacts/:id/research       │
│   gifts · gifts/:id · jobs                              │
└──────────────┬──────────────────────────────────────────┘
               │ @prisma/adapter-pg (PrismaPg driver adapter)
┌──────────────▼──────────────────────────────────────────┐
│           Business Logic Layer (src/lib/)                │
│   interest-extractor.ts  ·  gift-recommender.ts         │
│   job-processor.ts       ·  prisma.ts (singleton)       │
└──────────────┬──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────┐
│           PostgreSQL (Supabase)                          │
│   Account · Contact · SocialProfile · ResearchJob       │
│   ContactInterest · GiftRecommendation                  │
└─────────────────────────────────────────────────────────┘
               ▲
               │ (same adapter, separate process)
┌──────────────┴──────────────────────────────────────────┐
│     Background Worker (src/workers/researchWorker.ts)    │
│     tsx · polls DB every 5 s · processes PENDING jobs   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Data Model

### Schema summary

```
Account ──< Contact ──< SocialProfile
                   ──< ResearchJob
                   ──< ContactInterest
                   ──< GiftRecommendation
```

### Tables

#### `Account`
Represents a prospect company.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `String (cuid)` | PK |
| `name` | `String` | Company name |
| `domain` | `String?` | Website domain |
| `industry` | `String?` | Industry label |
| `city` / `country` | `String?` | HQ location |
| `expectedAcv` | `Int` | Annual contract value in USD |
| `tier` | `AccountTier` | `STRATEGIC` / `ENTERPRISE` / `MID_MARKET` |

**Tier thresholds (seed data):**
- STRATEGIC: ≥ $250K ACV
- ENTERPRISE: $100K–$249K
- MID_MARKET: < $100K

#### `Contact`
An individual at an Account.

| Column | Type | Notes |
|--------|------|-------|
| `accountId` | FK → Account | Cascade delete |
| `status` | `ContactResearchStatus` | Pipeline progress |
| `seniority` | `String?` | e.g. "VP", "C-Suite" |

**`ContactResearchStatus` lifecycle:**
```
NOT_STARTED → IN_PROGRESS → COMPLETED
                          ↘ FAILED
```

#### `SocialProfile`
Raw scraped (or seeded) text from a social platform.

| Column | Notes |
|--------|-------|
| `platform` | `LINKEDIN / INSTAGRAM / X / WEBSITE / OTHER` |
| `rawText` | Full text of the profile/post — parsed by the interest engine |
| `lastScrapedAt` | Timestamp of last scrape (set by PROFILE_RESEARCH job) |

#### `ResearchJob`
A single pipeline stage execution. One contact runs 3 jobs per pipeline.

| Column | Notes |
|--------|-------|
| `jobType` | `PROFILE_RESEARCH / INTEREST_EXTRACTION / GIFT_GENERATION` |
| `status` | `PENDING → RUNNING → COMPLETED / FAILED` |
| `startedAt / completedAt` | Wall-clock timestamps for duration tracking |
| `errorMessage` | Populated on FAILED |
| `metadata` | Reserved JSON for future provider payloads |

#### `ContactInterest`
One detected interest per category, per contact.

| Column | Notes |
|--------|-------|
| `category` | `InterestCategory` enum (10 values) |
| `label` | Human-readable label, e.g. "Fitness & Wellness" |
| `evidence` | ~120-char snippet from `rawText` containing the keyword |
| `confidence` | Float 0–1 derived from keyword match count |
| `detectedBy` | Engine version identifier, e.g. `"rule-engine-v1"` |

#### `GiftRecommendation`

| Column | Notes |
|--------|-------|
| `interestId` | Optional FK-like string to the driving `ContactInterest` |
| `category` | `GiftCategory` (7 values) |
| `giftType` | `PHYSICAL / VIRTUAL / EXPERIENCE` |
| `estimatedCost` | Integer USD |
| `status` | `GiftStatus` (7 values — see lifecycle below) |
| `reasoning` | Plain-English justification combining interest + tier context |

**One active gift per contact rule:**
A contact may have multiple DRAFT recommendations, but only one may ever be APPROVED. When a gift is approved, all other DRAFT recommendations for that contact are automatically set to `SUPERSEDED` in the same database transaction. SUPERSEDED gifts are hidden from the main Gifts dashboard by default (toggle via "Show superseded" checkbox) and from the contact detail page.

**`GiftStatus` lifecycle:**
```
DRAFT → APPROVED → ORDERED → SENT → DELIVERED
      ↘ REJECTED
      ↘ SUPERSEDED  (auto-set when a sibling gift is approved)
```

### Key indexes

- `Contact(accountId)` — account → contacts join
- `Contact(status)` — filter by research status
- `ResearchJob(contactId, status, jobType)` — worker queries + detail page queries
- `GiftRecommendation(contactId, status, category, estimatedCost)` — gift filters

---

## 3. Background Job Architecture

### Why DB-backed jobs?

An in-memory queue (e.g. a `Set<Promise>`) would be lost on server restart and provides no observability. DB-backed jobs give:
- **Durability** — jobs survive crashes and restarts
- **Observability** — full history queryable in the UI and via Prisma Studio
- **Decoupling** — the worker runs as a separate process from the web server
- **Idempotency** — re-running `processJob(id)` on a COMPLETED job is a no-op

### Pipeline state machine

```
                    ┌──────────────────────┐
POST /research ───► │ PROFILE_RESEARCH      │
                    │  status: PENDING      │
                    └──────────┬───────────┘
                               │ worker or immediate mode
                               ▼
                    ┌──────────────────────┐
                    │  status: RUNNING      │ sets startedAt
                    └──────────┬───────────┘
                         success│      failure│
                    ┌───────────▼──┐   ┌──────▼─────────┐
                    │  COMPLETED   │   │    FAILED        │
                    │ creates next │   │ errorMessage set │
                    │ PENDING job  │   └────────────────  ┘
                    └───────────┬──┘
                                │ (auto-created)
                                ▼
                    ┌──────────────────────┐
                    │ INTEREST_EXTRACTION  │ PENDING → RUNNING → COMPLETED
                    └──────────┬───────────┘
                                │ (auto-created)
                                ▼
                    ┌──────────────────────┐
                    │  GIFT_GENERATION     │ PENDING → RUNNING → COMPLETED
                    │  sets contact.status │
                    │  = COMPLETED         │
                    └──────────────────────┘
```

### Two execution modes

**Immediate mode** (`POST /api/contacts/:id/research?immediate=true`, default):
- API route calls `processContactPipeline(contactId)` which runs all 3 stages in sequence
- Returns the fully-populated contact in a single HTTP response
- Best for demos without a separate worker process

**Async mode** (`?immediate=false`):
- API route creates only the first `PENDING` PROFILE_RESEARCH job and returns `202 Accepted`
- Each `processJob()` call creates the next job in the chain upon successful completion
- The worker polls for `PENDING` jobs ordered by `createdAt asc` (FIFO)
- A single worker instance processes one job at a time to avoid race conditions

### Worker implementation

```typescript
// src/workers/researchWorker.ts — simplified
while (true) {
  const job = await prisma.researchJob.findFirst({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
  if (job) await processJob(job.id);
  await sleep(5_000);
}
```

The worker handles `SIGINT`/`SIGTERM` for graceful shutdown and logs all transitions with ISO timestamps.

---

## 4. Interest Extraction Engine

### Design: rule-based over LLM

**Why not use an LLM?** For a take-home prototype, an LLM would add API cost, latency, and a non-deterministic dependency that complicates testing. The rule-based approach is:
- **Deterministic** — same input always produces the same output
- **Explainable** — the `evidence` field shows exactly which text triggered the match
- **Fast** — sub-millisecond per profile
- **Extensible** — adding a keyword to the dictionary adds a capability immediately

In production, this layer would be replaced by an LLM call or a fine-tuned classifier trained on real LinkedIn data.

### Algorithm

```
Input:  rawText from all SocialProfiles for a contact (concatenated)
Output: Array<{ category, label, evidence, confidence, detectedBy }>

For each InterestCategory:
  count = number of keywords from RULES[category] found in lowercased rawText
  if count == 0: skip
  evidence = 120-char window around first matching keyword
  confidence = f(count):
    1 match  → 0.65
    2 matches → 0.78
    3 matches → 0.88
    4+ matches → 0.95
  sourceUrl = URL of the SocialProfile containing the first match
```

### Keyword rules (abbreviated)

| Category | Sample keywords |
|----------|----------------|
| FITNESS | running, marathon, crossfit, yoga, cycling, peloton, 14ers |
| MUSIC | concert, guitar, piano, jazz, vinyl, live music, record |
| SPORTS | nba, nfl, premier league, season ticket, golf, formula 1 |
| TRAVEL | wanderlust, backpacking, passport, adventure, exploring |
| FOOD | cooking, chef, culinary, wine, michelin, recipe, wset |
| TECH | ai, machine learning, kubernetes, open source, saas |
| GAMING | esports, twitch, playstation, xbox, elden ring, streamer |
| ART | gallery, museum, watercolor, painting, sculpture, lacma |
| BOOKS | reading, nonfiction, bookclub, kindle, biography |
| FAMILY | kids, children, parenting, dad, mom, toddler |

---

## 5. Gift Recommendation Engine

### Design

The engine maps `(InterestCategory, AccountTier)` → a specific gift template. This gives 10 × 3 = 30 curated templates.

**Selection algorithm:**
1. **Idempotency guard** — if the contact already has an APPROVED, ORDERED, SENT, or DELIVERED gift, gift generation is skipped entirely. This protects committed approvals from being overwritten on re-research.
2. Deduplicate interests — keep the highest-confidence one per category
3. Sort the deduplicated list by confidence descending
4. Take the top 3 (avoids overwhelming the contact with gifts)
5. Look up the template for `(category, account.tier)` and apply it
6. Append a `reasoning` string: the template rationale + `"Detected {category} interest with {X}% confidence."`

**Budget brackets (embedded in catalog):**

| Tier | Approximate range |
|------|------------------|
| STRATEGIC | $450–$500 |
| ENTERPRISE | $150–$200 |
| MID_MARKET | $75–$90 |

**Fallback:** If a contact has no detected interests, a tier-appropriate Mastercard gift card is generated.

### Gift catalog structure

```typescript
CATALOG[InterestCategory][AccountTier] = {
  title, description, category: GiftCategory,
  giftType: GiftType, vendor, reasoning, cost: number
}
```

Example entries:

| Interest | Tier | Gift | Cost |
|----------|------|------|------|
| FITNESS | STRATEGIC | WHOOP 4.0 Annual Membership | $480 |
| FITNESS | ENTERPRISE | Garmin Forerunner 965 GPS Watch | $190 |
| FITNESS | MID_MARKET | Premium Running & Recovery Bundle | $85 |
| MUSIC | STRATEGIC | VIP Concert Experience | $450 |
| TECH | STRATEGIC | Apple AirPods Max + Watch Ultra 2 | $490 |
| FOOD | STRATEGIC | Michelin Chef's Table Experience | $500 |
| GAMING | MID_MARKET | Xbox Game Pass Ultimate (12 mo.) | $80 |

---

## 6. Frontend Architecture

### Server vs Client components

| Component | Type | Reason |
|-----------|------|--------|
| All pages (`page.tsx`) | Server | Direct Prisma access, no JS shipped for rendering |
| `Nav.tsx` | Client | Needs `usePathname` for active link detection |
| `ContactsTable.tsx` | Client | Multi-select state, bulk fetch, `useTransition` |
| `ResearchButton.tsx` | Client | Loading spinner, `useTransition` |
| `GiftActions.tsx` | Client | Approve/Reject fetch + router.refresh() |
| `AutoRefresh.tsx` | Client | `setInterval` + `router.refresh()` |

### Filter and sort state

All filter and sort parameters live in the **URL query string** (e.g. `/contacts?tier=STRATEGIC&minAcv=100000`). This means:
- Pages are bookmarkable and shareable
- Filters survive navigation and browser refresh
- Server components read from `searchParams` — no client-side state needed
- A standard HTML `<form method="GET">` handles submission with zero JavaScript

### Data flow (research trigger)

```
User selects contacts
        │
        ▼
ContactsTable.tsx (client)
  fetch(`/api/contacts/${id}/research`, { method: 'POST' })   ← for each selected
        │
        ▼
POST /api/contacts/[id]/research (Route Handler)
  processContactPipeline(contactId)   ← immediate mode
        │
        ▼
job-processor.ts
  processJob(PROFILE_RESEARCH) → creates INTEREST_EXTRACTION
  processJob(INTEREST_EXTRACTION) → creates GIFT_GENERATION
  processJob(GIFT_GENERATION) → contact.status = COMPLETED
        │
        ▼
router.refresh()   ← client triggers RSC re-render
        │
        ▼
contacts/page.tsx re-fetches from DB, shows updated statuses + interests
```

---

## 7. API Design Decisions

### REST over tRPC / GraphQL
REST is simpler to document, debug with `curl`, and integrate with any future consumer. For a prototype this size, the overhead of tRPC or GraphQL is not justified.

### Zod validation on PATCH /api/gifts/:id
Gift status updates are the only mutation exposed via a body payload. Zod provides clear error messages if an invalid status enum is submitted.

### `?immediate=true` on research endpoint
This dual-mode design lets the demo work without requiring `npm run worker` to be running, while still demonstrating the real background-worker architecture (the jobs appear in the DB and the Jobs page shows the full pipeline history either way).

---

## 8. Prisma 7 Setup Notes

Prisma 7 introduced a new `prisma-client` generator that **requires a driver adapter** — the client no longer accepts a URL string and does not auto-read `DATABASE_URL` at runtime. The datasource URL is only used by the Prisma CLI (migrations, Prisma Studio, seed).

```
prisma.config.ts      → used by: npx prisma migrate, npx prisma studio, npx prisma db seed
src/lib/prisma.ts     → used by: Next.js server + background worker at runtime
```

Runtime client construction:
```typescript
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```

The generated client output path (`src/generated/prisma`) is set in `schema.prisma` and must be imported from there — not from `@prisma/client`.

---

## 9. What Is Not Implemented (Intentional Scope Limits)

| Feature | Reason not implemented |
|---------|----------------------|
| Real LinkedIn / Instagram scraping | Requires third-party credentials, rate limiting, legal compliance |
| Auth / multi-tenancy | Out of scope for prototype |
| Gift vendor fulfillment | No vendor API integrations |
| Payment processing | No payment provider |
| LLM-based interest extraction | Adds cost and non-determinism; rule engine demonstrates the concept clearly |
| Job retry logic | Single-attempt with FAILED state; retries would use exponential backoff in production |
| Distributed job queue | Single-worker; production would use Bull/BullMQ with Redis |

