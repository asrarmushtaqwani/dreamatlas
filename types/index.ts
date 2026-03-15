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
