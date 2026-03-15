'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import { Archetype } from '@/types'

const WORLDS = [
  { archetype: 'Transcendence' as Archetype, tagline: 'rising above everything',         dreamers: 412, description: 'Dreams of flight, dissolution, spiritual revelation — the ego loosening its grip.' },
  { archetype: 'Voyage'        as Archetype, tagline: 'journeys without maps',           dreamers: 387, description: 'Ships, roads, unknown destinations. The pull toward somewhere you have never been.' },
  { archetype: 'Fear'          as Archetype, tagline: 'what chases us in the dark',      dreamers: 341, description: 'Pursuit, paralysis, the shadow at the end of the hallway. The unconscious confronting itself.' },
  { archetype: 'Nature'        as Archetype, tagline: 'the living world speaks',         dreamers: 298, description: 'Forests, oceans, animals with human eyes. The world before words existed.' },
  { archetype: 'Transformation'as Archetype, tagline: 'becoming someone else entirely',  dreamers: 276, description: 'Shape-shifting, metamorphosis, waking up as something new.' },
  { archetype: 'Shadow'        as Archetype, tagline: 'the hidden rooms of the self',    dreamers: 254, description: 'Dark corridors, locked doors, the parts of yourself you have not met yet.' },
  { archetype: 'Anima'         as Archetype, tagline: "the soul's inner voice",          dreamers: 198, description: 'The deep feminine presence — intuition, wisdom, mystery dreaming through you.' },
  { archetype: 'Trickster'     as Archetype, tagline: 'nothing is what it seems',        dreamers: 167, description: 'Absurdity, paradox, reality bending its own rules.' },
  { archetype: 'Void'          as Archetype, tagline: 'the infinite and the empty',      dreamers: 143, description: 'Dissolution into nothingness. The terrifying and peaceful end of the self.' },
]

const SAMPLE_DREAMS: Record<string, string[]> = {
  Transcendence: ['I was dissolving into light, each particle becoming a star...','The sky opened and I rose through it without effort...','My body became transparent and I could see the whole city beneath me...'],
  Voyage: ['A ship that knew its own way home across black water...','Every road I walked became a different country...','I was following a map drawn in a language I almost understood...'],
  Fear: ['Something was behind me and I could not turn around...','The hallway kept getting longer no matter how fast I ran...','I knew it was coming but could not move or make a sound...'],
  Nature: ['The forest spoke my name through the wind in the leaves...','A white deer led me somewhere I had always been...','The ocean pulled back and kept pulling forever...'],
  Transformation: ['I looked in the mirror and someone else looked back...','My hands became wings mid-sentence...','I woke up inside the dream as a completely different person...'],
  Shadow: ['An infinite house with rooms I had locked myself...','My shadow detached and walked ahead of me...','A door at the end of every corridor, always the same door...'],
  Anima: ['A woman made of moonlight who knew all my secrets...','She did not speak but I understood everything...','The presence that has always been just out of sight...'],
  Trickster: ['The city kept rearranging itself when I was not looking...','I was late but time kept going backwards...','Everyone around me was acting a play and I had missed rehearsal...'],
  Void: ['An eye at the centre of everything, watching...','I fell so far I forgot I had ever existed...','Silence that was not empty but full of everything at once...'],
}

export default function WorldsPage() {
  const [entered, setEntered] = useState<Archetype | null>(null)

  if (entered) {
    const world = WORLDS.find(w => w.archetype === entered)!
    const col = ARCHETYPE_COLORS[entered]
    const dreams = SAMPLE_DREAMS[entered] || []
    return (
      <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
        <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setEntered(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 13 }}>← worlds</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: col }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20 }}>{entered}</span>
          </div>
        </div>
        <div style={{ padding: '28px 24px' }}>
          <div style={{ background: `${col}10`, border: `0.5px solid ${col}30`, borderRadius: 14, padding: '18px 22px', marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{world.description}</div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-tertiary)' }}>{world.dreamers.toLocaleString()} dreamers · {world.tagline}</div>
          </div>
          <div style={{ fontSize: 11, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 14 }}>RECENT DREAMS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {dreams.map((text, i) => (
              <div key={i} className="card" style={{ padding: '14px 18px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>"{text}"</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${col}20`, border: `0.5px solid ${col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: col }}>✦</div>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>anonymous dreamer</span>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{i + 1}h ago</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '16px', borderRadius: 12, border: '0.5px dashed var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 12 }}>Had a dream that belongs here?</div>
            <Link href="/log"><button className="btn-primary" style={{ width: 'auto', padding: '10px 24px', fontSize: 14 }}>Log it now</button></Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ padding: '24px 24px 20px', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontStyle: 'italic', fontWeight: 300, marginBottom: 4 }}>Dreamworlds</div>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Nine archetypal spaces where dreamers gather</div>
      </div>
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {WORLDS.map(world => {
          const col = ARCHETYPE_COLORS[world.archetype]
          return (
            <div key={world.archetype} className="card" onClick={() => setEntered(world.archetype)}
              style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${col}50`; el.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: col }} />
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18 }}>{world.archetype}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: 14, lineHeight: 1.4 }}>{world.tagline}</div>
              <div style={{ height: 2, background: 'var(--surface2)', borderRadius: 1, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', borderRadius: 1, background: col, width: `${(world.dreamers / 412) * 100}%` }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{world.dreamers.toLocaleString()} dreamers</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
