export type Archetype =
  | 'Transcendence'
  | 'Voyage'
  | 'Fear'
  | 'Nature'
  | 'Transformation'
  | 'Shadow'
  | 'Anima'
  | 'Trickster'
  | 'Void'

export type Mood =
  | 'Peaceful'
  | 'Wondrous'
  | 'Anxious'
  | 'Euphoric'
  | 'Terrifying'
  | 'Melancholic'
  | 'Confused'
  | 'Nostalgic'

export interface Dream {
  id: string
  user_id: string
  text: string
  mood: Mood | null
  archetypes: Archetype[]
  symbols: string[]
  essence: string
  map_x: number
  map_y: number
  is_public: boolean
  resonance_count: number
  created_at: string
}

export interface DreamAnalysis {
  archetypes: Archetype[]
  symbols: string[]
  essence: string
  map_x: number
  map_y: number
}

export interface Profile {
  id: string
  dream_name: string
  avatar_color: string
  dream_count: number
  streak: number
  top_archetype: Archetype | null
  created_at: string
}

export interface MapNode {
  id: string
  text: string
  archetype: Archetype
  map_x: number
  map_y: number
  is_own?: boolean
}

// ── PHASE 2 TYPES ─────────────────────────────────────────

export interface Dreamworld {
  id: string
  title: string
  theme: string
  archetype: Archetype
  description: string
  dream_count: number
  created_at: string
}

export interface DreamworldDream {
  dreamworld_id: string
  dream_id: string
  added_at: string
  dream?: Dream
}

export interface DreamTwinMatch {
  id: string
  user_id: string
  twin_user_id: string
  similarity_score: number       // 0–1
  shared_archetypes: Archetype[]
  computed_at: string
  twin_profile?: Profile
}

export interface ResonanceScore {
  id: string
  dream_a_id: string
  dream_b_id: string
  score: number                  // 0–100
  computed_at: string
  dream_a?: Dream
  dream_b?: Dream
}

export interface WrappedSnapshot {
  id: string
  user_id: string
  month: string                  // "YYYY-MM"
  top_archetype: Archetype | null
  top_symbols: string[]
  dream_count: number
  streak_peak: number
  most_resonated_dream_id: string | null
  twin_user_id: string | null
  dreamworld_titles: string[]
  essence_summary: string | null
  created_at: string
  // Joined fields (not in DB, populated client-side)
  most_resonated_dream?: Dream
  twin_profile?: Profile
}

// For the archetype fingerprint used in twin matching
export type ArchetypeFingerprint = Record<Archetype, number>  // archetype → % of dreams

export interface TwinComparisonResult {
  similarity_score: number
  shared_archetypes: Archetype[]
  reasoning: string
}

export interface ResonanceScoringResult {
  score: number
  reasoning: string
}