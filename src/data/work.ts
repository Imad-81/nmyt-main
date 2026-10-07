import type { MediaKey } from './media'

// TODO(NMYT): these are SAMPLE case studies used to demonstrate the layout.
// Replace names, summaries and images with real NMYT projects before launch.
export type Studio = 'tech' | 'creative' | 'hybrid' | 'originals'

export type Project = {
  slug: string
  name: string
  client: string
  studio: Studio
  services: string[]
  year: string
  summary: string
  image: MediaKey
}

export const PROJECTS: Project[] = [
  {
    slug: 'kiln-crema',
    name: 'Kiln & Crema',
    client: 'Specialty coffee roaster',
    studio: 'creative',
    services: ['Product shoot', 'Social content'],
    year: '2026',
    summary: 'A moody product series and a month of reels for a small-batch roaster’s new single-origin line.',
    image: 'workCoffee',
  },
  {
    slug: 'ledgerly',
    name: 'Ledgerly',
    client: 'Founder-led finance studio',
    studio: 'tech',
    services: ['Website', 'Client dashboard'],
    year: '2026',
    summary: 'A calm, fast website and a simple client dashboard that replaced three spreadsheets and a weekly email.',
    image: 'workFounder',
  },
  {
    slug: 'northline',
    name: 'Northline',
    client: 'Streetwear label',
    studio: 'creative',
    services: ['Lookbook film', 'Brand design'],
    year: '2026',
    summary: 'A parking-garage lookbook shot under green fluorescents, cut into a 40-second launch film and a stills campaign.',
    image: 'workFashion',
  },
  {
    slug: 'aqua-veil',
    name: 'Aqua Veil',
    client: 'Independent skincare brand',
    studio: 'hybrid',
    services: ['Product film', 'Landing page'],
    year: '2026',
    summary: 'Macro product film and a one-page launch site built around it, one story, told in both mediums.',
    image: 'workSkincare',
  },
  {
    slug: 'ember-room',
    name: 'Ember Room',
    client: 'Restaurant & bar',
    studio: 'creative',
    services: ['Brand commercial', 'Ads'],
    year: '2026',
    summary: 'Fire, steel and service. A 30-second commercial and cut-downs for paid social.',
    image: 'workRestaurant',
  },
  {
    slug: 'low-tide',
    name: 'Low Tide',
    client: 'Independent musician',
    studio: 'creative',
    services: ['Live visuals', 'Custom cinematics'],
    year: '2026',
    summary: 'Tour visuals and a cinematic teaser for an independent artist’s first headline run.',
    image: 'workMusic',
  },
]

export const STUDIO_META: Record<Studio, { label: string; color: string }> = {
  tech: { label: 'Tech Studio', color: 'var(--sky)' },
  creative: { label: 'Creative Studio', color: 'var(--acid)' },
  hybrid: { label: 'Tech × Creative', color: 'var(--fg)' },
  originals: { label: 'NMYT Originals', color: 'var(--emerald)' },
}
