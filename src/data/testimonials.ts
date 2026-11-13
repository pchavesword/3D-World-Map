/**
 * ⚠️ PLACEHOLDER CONTENT — REPLACE BEFORE LAUNCH ⚠️
 *
 * Every name, bio and quote in this file is invented filler. None of these
 * people exist and none of these statements were made by a Sword member.
 * Each entry carries `placeholder: true`; the UI shows a "Placeholder story"
 * label while that flag is set. Before launch, replace each entry with a
 * real member story that has documented consent, add the member's own photo
 * and audio, and set `placeholder: false`.
 */

export type Testimonial = {
  id: string
  /** PLACEHOLDER until replaced with a real, consented member name. */
  name: string
  city: string
  country: string
  lat: number
  lon: number
  /** PLACEHOLDER, 2–3 lines. */
  bio: string
  /** PLACEHOLDER, short. */
  quote: string
  photo: string
  audio: string
  /** True while the entry is invented filler. Must be false for every entry at launch. */
  placeholder: boolean
}

const PHOTO = `${import.meta.env.BASE_URL}placeholder-portrait.jpg`
const AUDIO = `${import.meta.env.BASE_URL}placeholder-testimonial.mp3`

// PLACEHOLDER quotes, cycled across entries.
const QUOTES = [
  'Sword helped me a lot. I can move through my day without thinking about the pain.',
  'A few minutes a day, at home, and I slowly got my mornings back.',
  'I did not expect it to fit into my life this easily.',
  'Having someone check in on my progress made me keep going.',
  'I am back to doing the things I had quietly given up on.',
  'It felt like the programme was built around me, not the other way round.',
]

// PLACEHOLDER bio fragments, cycled across entries.
const ROLES = [
  'a teacher',
  'a software engineer',
  'a nurse',
  'a retired carpenter',
  'a restaurant owner',
  'a delivery driver',
  'a graphic designer',
  'an accountant',
]
const ISSUES = [
  'lower back pain',
  'a stiff shoulder',
  'knee pain',
  'neck tension',
  'hip pain',
  'wrist and elbow pain',
]

type Seed = [name: string, city: string, country: string, lat: number, lon: number]

// All names below are PLACEHOLDERS.
const SEEDS: Seed[] = [
  // United States
  ['Maya R.', 'New York', 'United States', 40.7128, -74.006],
  ['Daniel K.', 'Los Angeles', 'United States', 34.0522, -118.2437],
  ['Priya S.', 'Chicago', 'United States', 41.8781, -87.6298],
  ['Marcus T.', 'Houston', 'United States', 29.7604, -95.3698],
  ['Elena G.', 'Miami', 'United States', 25.7617, -80.1918],
  ['Owen B.', 'Seattle', 'United States', 47.6062, -122.3321],
  ['Grace L.', 'San Francisco', 'United States', 37.7749, -122.4194],
  ['Sean O.', 'Boston', 'United States', 42.3601, -71.0589],
  ['Hannah W.', 'Denver', 'United States', 39.7392, -104.9903],
  ['Andre J.', 'Atlanta', 'United States', 33.749, -84.388],
  ['Rosa M.', 'Dallas', 'United States', 32.7767, -96.797],
  ['Tyler N.', 'Phoenix', 'United States', 33.4484, -112.074],
  ['Naomi C.', 'Washington DC', 'United States', 38.9072, -77.0369],
  ['Erik H.', 'Minneapolis', 'United States', 44.9778, -93.265],
  ['Claire D.', 'Salt Lake City', 'United States', 40.7608, -111.891],
  // Canada
  ['Liam P.', 'Toronto', 'Canada', 43.6532, -79.3832],
  ['Sophie A.', 'Vancouver', 'Canada', 49.2827, -123.1207],
  ['Julien F.', 'Montreal', 'Canada', 45.5019, -73.5674],
  // Portugal
  ['Inês V.', 'Lisbon', 'Portugal', 38.7223, -9.1393],
  ['Tiago C.', 'Porto', 'Portugal', 41.1579, -8.6291],
  // United Kingdom
  ['Oliver S.', 'London', 'United Kingdom', 51.5072, -0.1276],
  ['Amelia B.', 'Manchester', 'United Kingdom', 53.4808, -2.2426],
  ['Fiona M.', 'Edinburgh', 'United Kingdom', 55.9533, -3.1883],
  // Greece
  ['Nikos P.', 'Athens', 'Greece', 37.9838, 23.7275],
  ['Eleni K.', 'Thessaloniki', 'Greece', 40.6401, 22.9444],
  // Brazil
  ['Beatriz L.', 'São Paulo', 'Brazil', -23.5558, -46.6396],
  ['Rafael S.', 'Rio de Janeiro', 'Brazil', -22.9068, -43.1729],
  // Japan
  ['Yuki T.', 'Tokyo', 'Japan', 35.6762, 139.6503],
  ['Haruto N.', 'Osaka', 'Japan', 34.6937, 135.5023],
  // Others
  ['Camille R.', 'Paris', 'France', 48.8566, 2.3522],
  ['Omar A.', 'Dubai', 'United Arab Emirates', 25.2048, 55.2708],
  ['Chloe W.', 'Sydney', 'Australia', -33.8688, 151.2093],
]

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')

export const testimonials: Testimonial[] = SEEDS.map(([name, city, country, lat, lon], i) => ({
  id: slug(city),
  name,
  city,
  country,
  lat,
  lon,
  bio: `${name.split(' ')[0]} is ${ROLES[i % ROLES.length]} from ${city} who started a Sword programme for ${ISSUES[i % ISSUES.length]}. This short biography is placeholder text and will be replaced with the member's own story.`,
  quote: QUOTES[i % QUOTES.length],
  photo: PHOTO,
  audio: AUDIO,
  placeholder: true, // PLACEHOLDER — replace with a real, consented story before launch
}))
