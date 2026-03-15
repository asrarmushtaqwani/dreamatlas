# DreamAtlas 🌙

**A collective cartography of the unconscious. Open-source.**

Log your dreams. AI finds the archetypes and symbols. Every dream becomes a point of light on a shared global map — a living visualization of what humanity dreams tonight.

## Stack
- **Next.js 15** (App Router, TypeScript)
- **Supabase** (Postgres + Row Level Security + Auth)
- **Anthropic Claude API** (dream analysis)
- **Vercel** (deployment)

## Setup in 5 minutes

```bash
git clone https://github.com/yourusername/dreamatlas
cd dreamatlas && npm install
cp .env.local.example .env.local   # fill in your keys
npm run dev
```

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-your-key
```

### Database

Run `supabase/schema.sql` in your Supabase SQL Editor. It creates:
- `profiles` table (auto-created on signup, with generated dream name)
- `dreams` table (with RLS — users own their dreams)
- `resonances` table (the "not-a-like" social signal)
- Triggers for streak tracking and resonance counts

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with live map preview |
| `/map` | Full interactive global dream atlas |
| `/log` | Dream logging flow (voice + text) |
| `/insight` | Post-analysis archetype + symbol reveal |
| `/journal` | Personal dream history |
| `/auth/signup` | Create account |
| `/auth/login` | Sign in |

## The 9 archetypes

Transcendence · Voyage · Fear · Nature · Transformation · Shadow · Anima · Trickster · Void

## Roadmap

- [x] Phase 1: MVP — logging, map, journal, auth
- [ ] Phase 2: Social — Dreamworlds, Dream Twins, Resonance, Dream Wrapped
- [ ] Phase 3: Research — API, event correlator, longitudinal studies

## License

MIT
