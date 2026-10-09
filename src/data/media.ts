// Photography generated for NMYT (ChatGPT image gen, photographic direction).
// Every entry resolves to /media/<name>.webp (2000w) and /media/<name>-sm.webp (900w).
export const MEDIA = {
  heroFilmset: 'hero-filmset',
  creativePortrait: 'home-creative-portrait',
  techHands: 'home-tech-hands',
  originalsDirector: 'originals-director',
  creativeProduct: 'creative-product',
  creativeCommercial: 'creative-commercial',
  originalsMonitor: 'originals-monitor',
  techDesk: 'tech-studio-desk',
  creativeSocial: 'creative-social',
  techPhone: 'tech-phone',
  originalsWide: 'originals-wide',
  originalsStage: 'originals-stage',
  originalsClapper: 'originals-clapper',
  creativeBrand: 'creative-brand',
  techDashboard: 'tech-dashboard',
  workCoffee: 'work-coffee',
  workFashion: 'work-fashion',
  workRestaurant: 'work-restaurant',
  workSkincare: 'work-skincare',
  workMusic: 'work-music',
  workFounder: 'work-founder',
  studioTeam: 'studio-team',
} as const

export type MediaKey = keyof typeof MEDIA

export const media = (k: MediaKey, size: 'lg' | 'sm' = 'lg') => `/media/${MEDIA[k]}${size === 'sm' ? '-sm' : ''}.webp`

/**
 * Short looping motion clips for the large visuals. A clip is used only when its file is
 * listed here; otherwise the still image shows. Files live in /public/media/video.
 */
export const CLIPS: Partial<Record<MediaKey, string>> = {
  originalsStage: '/media/video/originals-stage.mp4',
}
