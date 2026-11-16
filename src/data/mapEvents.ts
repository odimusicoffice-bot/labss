import { Mic, Headphones, Camera, Users, Star, BookOpen, Shield, Music, type LucideIcon } from 'lucide-react';

export type EventType = 'perform' | 'studio' | 'shoot' | 'collab' | 'event' | 'learn' | 'cover_dance' | 'safe_zone';

export type SubCategory =
  | 'live_concert' | 'open_mic'
  | 'recording' | 'rehearsal'
  | 'music_video' | 'photoshoot'
  | 'collab' | 'event' | 'learn' | 'cover_dance'
  | 'safe_zone';

export interface MapEvent {
  id: number;
  title: string;
  type: EventType;
  subCategory: SubCategory;
  city: string;
  country: string;
  date: string;
  lat: number;
  lng: number;
  major: boolean;
  description: string;
  image?: string;
  vip?: boolean;
}

export const typeConfig: Record<EventType, { label: string; icon: LucideIcon }> = {
  perform: { label: 'Perform', icon: Mic },
  studio: { label: 'Studio', icon: Headphones },
  shoot: { label: 'Shoot', icon: Camera },
  collab: { label: 'Collab', icon: Users },
  event: { label: 'Event', icon: Star },
  learn: { label: 'Learn', icon: BookOpen },
  cover_dance: { label: 'Cover Dance', icon: Music },
  safe_zone: { label: 'Safe Zone', icon: Shield },
};

export interface CategoryGroup {
  label: string;
  type: EventType;
  subCategories: { value: SubCategory; label: string }[];
}

export const categoryGroups: CategoryGroup[] = [
  {
    label: 'Perform',
    type: 'perform',
    subCategories: [
      { value: 'live_concert', label: 'Live Concerts' },
      { value: 'open_mic', label: 'Open Mic' },
    ],
  },
  {
    label: 'Studio',
    type: 'studio',
    subCategories: [
      { value: 'recording', label: 'Recording' },
      { value: 'rehearsal', label: 'Rehearsal' },
    ],
  },
  {
    label: 'Shoot',
    type: 'shoot',
    subCategories: [
      { value: 'music_video', label: 'Music Videos' },
      { value: 'photoshoot', label: 'Photoshoots' },
    ],
  },
  {
    label: 'Collab',
    type: 'collab',
    subCategories: [
      { value: 'collab', label: 'Collab' },
    ],
  },
  {
    label: 'Event',
    type: 'event',
    subCategories: [
      { value: 'event', label: 'Event' },
    ],
  },
  {
    label: 'Learn',
    type: 'learn',
    subCategories: [
      { value: 'learn', label: 'Learn' },
    ],
  },
  {
    label: 'Cover Dance',
    type: 'cover_dance',
    subCategories: [
      { value: 'cover_dance', label: 'Cover Dance' },
    ],
  },
];

export const mapEvents: MapEvent[] = [
  {
    id: 1,
    title: 'ODI Showcase Night',
    type: 'perform',
    subCategory: 'live_concert',
    city: 'Seoul',
    country: 'Korea',
    date: 'Nov 15, 2026',
    lat: 37.5665,
    lng: 126.978,
    major: true,
    description: 'Exclusive performance showcase featuring ODI LABS artists and special guests.',
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 2,
    title: 'Studio Session Vol. 3',
    type: 'studio',
    subCategory: 'recording',
    city: 'Moscow',
    country: 'Russia',
    date: 'Nov 22, 2026',
    lat: 55.7558,
    lng: 37.6173,
    major: true,
    description: 'Open recording studio session with live production and mixing.',
    image: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 3,
    title: 'Underground Beats',
    type: 'event',
    subCategory: 'event',
    city: 'Tokyo',
    country: 'Japan',
    date: 'Dec 1, 2026',
    lat: 35.6762,
    lng: 139.6503,
    major: true,
    description: 'A full-day event spotlighting emerging electronic and hip-hop talent.',
    image: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 4,
    title: 'Vocal Workshop',
    type: 'learn',
    subCategory: 'learn',
    city: 'Busan',
    country: 'Korea',
    date: 'Dec 8, 2026',
    lat: 35.1796,
    lng: 129.0756,
    major: false,
    description: 'Hands-on vocal training workshop led by industry professionals.',
  },
  {
    id: 5,
    title: 'Producer Meetup',
    type: 'collab',
    subCategory: 'collab',
    city: 'Saint Petersburg',
    country: 'Russia',
    date: 'Dec 14, 2026',
    lat: 59.9311,
    lng: 30.3609,
    major: false,
    description: 'Networking and beat-making session for local producers.',
  },
  {
    id: 6,
    title: 'ODI Arena Live',
    type: 'perform',
    subCategory: 'live_concert',
    city: 'Los Angeles',
    country: 'USA',
    date: 'Jan 10, 2027',
    lat: 34.0522,
    lng: -118.2437,
    major: true,
    description: 'Large-scale live performance at a premier LA venue.',
    image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 7,
    title: 'Mixing Masterclass',
    type: 'learn',
    subCategory: 'learn',
    city: 'Berlin',
    country: 'Germany',
    date: 'Jan 18, 2027',
    lat: 52.52,
    lng: 13.405,
    major: false,
    description: 'Advanced mixing techniques masterclass with certified engineers.',
  },
  {
    id: 8,
    title: 'Music Video Shoot',
    type: 'shoot',
    subCategory: 'music_video',
    city: 'Bangkok',
    country: 'Thailand',
    date: 'Jan 25, 2027',
    lat: 13.7563,
    lng: 100.5018,
    major: false,
    description: 'Professional music video shoot with full production crew.',
    image: 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 9,
    title: 'Open Mic Fridays',
    type: 'perform',
    subCategory: 'open_mic',
    city: 'Tokyo',
    country: 'Japan',
    date: 'Feb 7, 2027',
    lat: 35.6762,
    lng: 139.6503,
    major: false,
    description: 'Weekly open mic night for singers, rappers, and poets.',
  },
  {
    id: 10,
    title: 'Rehearsal Space Booking',
    type: 'studio',
    subCategory: 'rehearsal',
    city: 'Seoul',
    country: 'Korea',
    date: 'Feb 14, 2027',
    lat: 37.5665,
    lng: 126.978,
    major: false,
    description: 'Booked rehearsal time with full backline and monitoring.',
  },
  {
    id: 11,
    title: 'Artist Photoshoot',
    type: 'shoot',
    subCategory: 'photoshoot',
    city: 'Los Angeles',
    country: 'USA',
    date: 'Feb 20, 2027',
    lat: 34.0522,
    lng: -118.2437,
    major: false,
    description: 'Professional artist photoshoot with creative direction.',
  },
  {
    id: 12,
    title: 'K-Cover Dance Battle',
    type: 'cover_dance',
    subCategory: 'cover_dance',
    city: 'Seoul',
    country: 'Korea',
    date: 'Mar 1, 2027',
    lat: 37.5665,
    lng: 126.978,
    major: true,
    description: 'Cover dance competition with prizes and guest judges.',
    image: 'https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 101,
    title: 'Safe Zone — Seoul Studio',
    type: 'safe_zone',
    subCategory: 'safe_zone',
    city: 'Seoul',
    country: 'Korea',
    date: 'Always open',
    lat: 37.5700,
    lng: 126.9850,
    major: false,
    description: 'VIP-only safe space with private studio access and refreshments.',
    vip: true,
  },
  {
    id: 102,
    title: 'Safe Zone — Tokyo Lounge',
    type: 'safe_zone',
    subCategory: 'safe_zone',
    city: 'Tokyo',
    country: 'Japan',
    date: 'Always open',
    lat: 35.6800,
    lng: 139.6700,
    major: false,
    description: 'VIP members only. Private lounge and meeting space.',
    vip: true,
  },
];

export const allCountries = Array.from(new Set(mapEvents.filter(e => !e.vip).map((e) => e.country))).sort();
export const allTypes: { value: EventType; label: string; icon: LucideIcon }[] = (
  Object.entries(typeConfig).filter(([key]) => key !== 'safe_zone') as [EventType, { label: string; icon: LucideIcon }][]
).map(([value, cfg]) => ({ value, label: cfg.label, icon: cfg.icon }));
