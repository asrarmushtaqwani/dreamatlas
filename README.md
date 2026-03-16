# DreamAtlas 🌙

> *A collective cartography of the unconscious.*

Log your dreams each morning. Gemini finds the archetypes and symbols hidden inside. Every dream becomes a point of light on a shared global map — a living visualization of what humanity dreams tonight.

**[Live at getdreamatlas.vercel.app](https://getdreamatlas.vercel.app)** · Open-source · Free forever

---

## What is DreamAtlas?

Most dream journals are private. DreamAtlas is the opposite — a global, anonymous atlas of the collective unconscious. When you log a dream, AI analyzes it through a Jungian lens, extracts its archetypes and symbols, and places it on a map shared by dreamers worldwide.

Over time, patterns emerge. Certain symbols cluster in certain places. Archetypes rise and fall with world events. Your unconscious mind finds its doppelgänger on the other side of the planet.

This is not a wellness app. It is an instrument for observing the dreaming mind at scale.

---

## Features

### Phase 1 — The Atlas
- **Dream logging** — text or voice, with mood tagging
- **AI analysis** — Gemini extracts archetypes, symbols, and a Jungian essence in one sentence
- **Live map** — every public dream plotted as a point of light on a global atlas
- **Dream journal** — your personal history, streaks, and top archetypes
- **9 archetypes** — Transcendence · Voyage · Fear · Nature · Transformation · Shadow · Anima · Trickster · Void

### Phase 2 — The Social Layer
- **Dreamworlds** — nine curated territories of the unconscious, each anchored to an archetype. Your dreams are automatically classified and placed into the worlds they belong to.
- **Dream Twins** — AI compares your archetype fingerprint against every dreamer on the atlas and finds your unconscious doppelgänger — the person whose inner world most mirrors yours.
- **Resonance** — an AI-scored similarity metric (0–100) between any two dreams. The map surfaces the most resonant dream pairs globally in real time.
- **Dream Wrapped** — on the first of each month, Gemini writes your dream portrait: your dominant archetype, recurring symbols, peak streak, Dreamworlds entered, and a poetic summary of your month in the unconscious. Shareable.

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Database | Supabase (Postgres + RLS + Auth) |
| AI | Google Gemini API (`gemini-2.5-flash`) |
| Deployment | Vercel |
| Styling | Tailwind CSS |

---

## Setup in 5 minutes

```bash
git clone https://github.com/asrarmushtaqwani/dreamatlas
cd dreamatlas && npm install
cp .env.local.example .env.local
npm run dev
```

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### Database setup

Run these in order in your Supabase SQL Editor:

1. `supabase/schema.sql` — Phase 1 tables
2. `supabase/phase2_migration.sql` — Phase 2 tables

---

## Database schema

### Phase 1
| Table | Description |
|-------|-------------|
| `profiles` | Auto-created on signup. Stores dream name, streak, top archetype. |
| `dreams` | Every logged dream with archetypes, symbols, essence, map coordinates. RLS — users own their dreams. |
| `resonances` | The "I dreamed this too" signal. Many-to-many between users and dreams. |

### Phase 2
| Table | Description |
|-------|-------------|
| `dreamworlds` | 9 canonical Jungian territories, pre-seeded. |
| `dreamworld_dreams` | Junction — which dreams belong to which worlds. |
| `dream_twin_matches` | AI-computed archetype fingerprint matches between users. |
| `resonance_scores` | AI-scored similarity (0–100) between dream pairs. Cached. |
| `wrapped_snapshots` | Monthly dream portrait snapshots, one per user per month. |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with live map preview |
| `/map` | Full interactive global dream atlas |
| `/log` | Dream logging (voice + text) |
| `/insight` | Post-analysis archetype + symbol reveal |
| `/journal` | Personal dream history and streaks |
| `/dreamworlds` | Nine Jungian territories — curated dream collections |
| `/twins` | Find your unconscious doppelgänger globally |
| `/wrapped` | Monthly AI-generated dream portrait |
| `/auth/signup` | Create account |
| `/auth/login` | Sign in |

---

## The 9 Dreamworlds

| Dreamworld | Archetype | Theme |
|------------|-----------|-------|
| The Ascending Path | Transcendence | Ascension, light, spiritual revelation |
| The Long Road | Voyage | Journeys, wandering, unknown destinations |
| The Pursuer | Fear | Being chased, dread, paralysis, darkness |
| The Green Cathedral | Nature | Forests, animals, water, earth, seasons |
| The Chrysalis | Transformation | Shapeshifting, metamorphosis, rebirth |
| The Dark Mirror | Shadow | Doppelgängers, hidden selves, the unconscious |
| The Beloved Unknown | Anima | Romantic longing, connection, the muse |
| The Impossible Room | Trickster | Absurdity, paradox, humor, chaos |
| The Quiet Abyss | Void | Emptiness, dissolution, the infinite |

---

## Architecture

```
app/
  (auth)/               # signup, login
  api/
    resonance/          # POST — AI score two dreams
    twins/              # POST — find unconscious doppelgänger
    wrapped/            # GET  — generate/retrieve monthly portrait
  dreamworlds/          # browse the 9 territories
  insight/              # post-analysis reveal
  journal/              # personal dream history
  log/                  # dream logging flow
  map/                  # global atlas
  twins/                # dream twin page
  wrapped/              # monthly wrapped page
components/
  layout/               # Sidebar, MobileNav
  ResonanceScore.tsx    # inline AI resonance scorer
  ResonanceFeed.tsx     # global high-resonance pairs feed
lib/
  dreams.ts             # Gemini analysis, archetype colors, dream name generator
  social.ts             # twin matching, resonance scoring, wrapped essay, world classifier
  supabase/             # client + server helpers
types/
  index.ts              # all TypeScript types
supabase/
  schema.sql            # Phase 1 migration
  phase2_migration.sql  # Phase 2 migration
```

---

## How the AI works

Every AI call hits `gemini-2.5-flash` via the Google Generative Language API. All prompts are designed to return strict JSON — no markdown fences, no preamble.

**Dream analysis** (`lib/dreams.ts`)
Extracts 1–3 archetypes, 3–6 symbols, a Jungian essence sentence, and map coordinates (x = conscious→unconscious, y = light→shadow).

**Twin matching** (`lib/social.ts`)
Builds an archetype frequency fingerprint from your last 50 dreams. Compares it against other users' fingerprints using Gemini, which scores similarity 0–1 and identifies shared unconscious territories.

**Resonance scoring** (`lib/social.ts`)
Given two dreams, Gemini scores their symbolic and archetypal overlap 0–100 and returns a one-sentence explanation. Results are cached in `resonance_scores` to avoid re-scoring.

**Wrapped essay** (`lib/social.ts`)
Gemini writes a 2–3 sentence literary nonfiction portrait of your month in the unconscious, referencing your specific symbols, archetype, and Dreamworlds. Cached in `wrapped_snapshots`.

---

## Roadmap

- [x] Phase 1 — MVP: logging, map, journal, auth
- [x] Phase 2 — Social: Dreamworlds, Dream Twins, Resonance, Dream Wrapped
- [ ] Phase 3 — Research: public API, event correlator, longitudinal studies

---

## Contributing

Pull requests welcome. This project is intentionally kept simple — no heavy dependencies, no complex build steps. If you're adding a feature, follow the existing patterns in `lib/dreams.ts` and `lib/social.ts` for AI calls.

---

## License

DreamAtlas is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This means:
- ✅ Free to use, modify, and self-host
- ✅ Open source forever
- ⚠️ If you run a modified version as a public service, you **must** open source your modifications under the same license
- ❌ Commercial use without a separate license agreement is not permitted

This license was chosen specifically to prevent large corporations from taking the codebase, building on top of the existing user base and dream data, and commercializing it without contributing back.

**If you want to use DreamAtlas commercially** (e.g. as part of a product or service), reach out for a commercial license.

See the full license text in [LICENSE](./LICENSE).

---

*Built in the liminal hours. For the dreamers.*