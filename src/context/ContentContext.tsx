import { createContext, useContext, useState, type ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────

export interface ManagedArtist {
  id: number;
  alias: string;
  category: 'odi-a' | 'global';
  photo: string;
  streamingLinks: {
    spotify?: string;
    apple?: string;
    youtube?: string;
  };
  donateQr?: string;
  audioUrl?: string;
  audioDurationSec?: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SupportContent {
  faqs: FaqItem[];
  telegram: string;
  instagram: string;
  email: string;
  discord: string;
  youtube: string;
  supportIntro: string;
  contactsIntro: string;
}

export interface AboutSection {
  id: string;
  label: string;
  title: string;
  body: string;
}

export interface AboutContent {
  sections: AboutSection[];
  closingQuote: string;
  closingAuthors: string;
}

export interface NoteTemplateImage {
  id: string;
  title: string;
  imageUrl: string;
}

export type EventCategory = 'perform' | 'studio' | 'shoot' | 'collab' | 'event' | 'learn';

export interface EventRequest {
  id: string;
  title: string;
  city: string;
  country: string;
  description: string;
  category: EventCategory;
  link?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  createdAt: string;
}

export type RequestType = 'verification' | 'audition' | 'event' | 'support';

export interface ConsolidatedRequest {
  id: string;
  type: RequestType;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  createdAt: string;
  details: Record<string, string>;
}

interface ContentContextValue {
  artists: ManagedArtist[];
  addArtist: (artist: Omit<ManagedArtist, 'id'>) => void;
  updateArtist: (id: number, updates: Partial<ManagedArtist>) => void;
  deleteArtist: (id: number) => void;

  supportContent: SupportContent;
  updateSupportContent: (updates: Partial<SupportContent>) => void;
  addFaq: (faq: Omit<FaqItem, 'id'>) => void;
  updateFaq: (id: string, updates: Partial<FaqItem>) => void;
  deleteFaq: (id: string) => void;

  aboutContent: AboutContent;
  updateAboutSection: (id: string, updates: Partial<AboutSection>) => void;
  updateAboutClosing: (quote: string, authors: string) => void;

  noteTemplates: NoteTemplateImage[];
  addNoteTemplate: (template: Omit<NoteTemplateImage, 'id'>) => void;
  deleteNoteTemplate: (id: string) => void;

  eventRequests: EventRequest[];
  approveEventRequest: (id: string) => void;
  rejectEventRequest: (id: string) => void;
  approvedMapEvents: { id: number; title: string; type: EventCategory; city: string; country: string; description: string; lat: number; lng: number }[];

  consolidatedRequests: ConsolidatedRequest[];
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
}

// ─── Seed Data ───────────────────────────────────────────

const seedArtists: ManagedArtist[] = [
  {
    id: 1,
    alias: 'ODI J',
    category: 'odi-a',
    photo: '/images/artists/IMG_0736.jpeg',
    streamingLinks: {},
  },
  {
    id: 2,
    alias: 'Artist 2',
    category: 'odi-a',
    photo: 'https://images.pexels.com/photos/18528273/pexels-photo-18528273.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    streamingLinks: {},
  },
  {
    id: 3,
    alias: 'Artist 3',
    category: 'odi-a',
    photo: 'https://images.pexels.com/photos/19199566/pexels-photo-19199566.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    streamingLinks: {},
  },
  {
    id: 4,
    alias: 'Artist 4',
    category: 'global',
    photo: 'https://images.pexels.com/photos/20052153/pexels-photo-20052153.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    streamingLinks: {},
  },
  {
    id: 5,
    alias: 'Artist 5',
    category: 'global',
    photo: 'https://images.pexels.com/photos/20052156/pexels-photo-20052156.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    streamingLinks: {},
  },
  {
    id: 6,
    alias: 'Artist 6',
    category: 'global',
    photo: 'https://images.pexels.com/photos/29516587/pexels-photo-29516587.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    streamingLinks: {},
  },
];

const seedSupportContent: SupportContent = {
  faqs: [
    { id: 'faq-1', question: 'Profile', answer: 'Your profile is your home base on ODI LABS. Open it to edit your name, bio and photo, and to see your activity.' },
    { id: 'faq-2', question: 'Cloud', answer: 'Cloud is your music library. Upload tracks, star your favourites and play them back from anywhere in the app.' },
    { id: 'faq-3', question: 'Notes', answer: 'Notes is where you write down your thoughts about the events you attend. Link a note to an event on the map to find it again later.' },
    { id: 'faq-4', question: 'Map', answer: 'The Map shows events around the world. Tap a marker to see the details and mark the events you plan to go to.' },
    { id: 'faq-5', question: 'Artists', answer: 'Browse the ODI LABS roster, open an artist profile and support them directly with a donation.' },
    { id: 'faq-6', question: 'Bonuses', answer: 'Bonuses are rewards for being active on ODI LABS. Check your profile to see which bonuses you have unlocked.' },
    { id: 'faq-7', question: 'First Star', answer: 'Starring your first track in Cloud is a small milestone. Your starred tracks show up in Radar, so you can find them quickly.' },
  ],
  telegram: '@odilabs',
  instagram: '@odi.labs',
  email: 'odimusic.office@gmail.com',
  discord: 'odi-labs',
  youtube: 'ODI LABS',
  supportIntro: 'Find quick answers below, or send us a message.',
  contactsIntro: 'Get in touch with the ODI LABS team.',
};

const seedAboutContent: AboutContent = {
  sections: [
    {
      id: 'prologue',
      label: 'Prologue',
      title: 'Разные тени, одна тишина',
      body: 'В шумном Бангкоке Бобби видел, как айдолы сходят с ума от нехватки личного пространства, а в холодном Токио Кир наблюдал, как талантливые новички боятся даже выложить свой первый трек, потому что общество твердит им: «Ты никто».\n\nИндустрия едина в своей жестокости: она ломает и тех, кто на вершине, и тех, кто только пытается взобраться. Бобби и Кир поняли: им нужно построить дом для тех, кто «сломлен, но живет музыкой». Дом, где не нужно притворяться. Так родилась ODI (Obsession Dreams).',
    },
    {
      id: 'act-1',
      label: 'Акт I',
      title: 'Джей и Смена Короны',
      body: 'Первой музой проекта стала Джей из России. Она прошла через личный ад, потеряла всё и пришла в ODI с одним лишь голосом. Здесь она нашла не контракт, а тишину, в которой можно было наконец выдохнуть.\n\nЕе песня «The Crown» стала гимном. Это не песня о победе над другими. Это песня о падении старой, прогнившей короны индустрии. О том, что каждый, кто выжил после удара, заслуживает носить свою собственную корону — даже если она выкована из боли и тишины.',
    },
    {
      id: 'act-2',
      label: 'Акт II',
      title: 'Два уровня тишины',
      body: 'ODI LABS — это не просто приложение, это сложная архитектура с разными уровнями доступа. Здесь каждый находит свою защиту.\n\nУровень 1: Основное Приложение (Для всех артистов). Это убежище для независимых музыкантов, танцоров Cover Dance и продюсеров. Они прячутся не от папарацци, а от безденежья, творческих кризисов и страха быть непонятыми. Им нужны инструменты: Cloud (чтобы сохранить свои демо), Notes (чтобы фиксировать идеи до того, как они исчезнут), Artists (чтобы заявить о себе) и Map (чтобы найти места для репетиций и съемок). Это их творческая лаборатория.\n\nУровень 2: Safe Zones & VIP-Верификация (Для избранных). Это элитный, закрытый контур. Он создан специально для айдолов и топовых артистов, которым нужна абсолютная тишина и физическая безопасность. Фраза-пароль на видео-кружке и скрытые пины (Safe Zones) на карте — это не просто фичи, это ритуал посвящения. Это места, где айдол может спрятаться от фанатов и прессы, где можно провести закрытую съемку или встречу без риска утечки.',
    },
    {
      id: 'act-3',
      label: 'Акт III',
      title: 'Эстетика молчания',
      body: 'Мы убрали бордовый цвет. Он слишком напоминал о старых ранах и крови индустрии. Наша палитра — это «Тихая Роскошь»:\n\nМатовый черный — фон, скрывающий нас от лишних глаз.\nЭлектрический синий — холодный, как лед, и яркий, как молния. Цвет нового сигнала.\nБелый — цвет правды. В ODI LABS артист владеет 100% своих прав.\n\nКаждый элемент — это ритуал. Загрузка трека — это акт доверия. Заметка в 3 часа ночи — это крик души. А прохождение VIP-верификации — это клятва хранить тишину.',
    },
    {
      id: 'epilogue',
      label: 'Эпилог',
      title: 'Найди свою тишину',
      body: 'ODI LABS — это дом. Для новичка, который боится показать свое лицо. Для танцора, который ищет безопасную студию. Для айдола, который хочет просто посидеть в тишине без камер.\n\nСмена короны начинается с того момента, когда ты перестаешь играть по чужим правилам и находишь свое место.',
    },
  ],
  closingQuote: '«This is ODI. Studio without walls. Home for the broken but living.»',
  closingAuthors: 'ODI J; ODI BOBBY; ODI KIR',
};

const seedNoteTemplates: NoteTemplateImage[] = [];

const seedEventRequests: EventRequest[] = [
  {
    id: 'er-1',
    title: 'Rooftop Cypher Night',
    city: 'Bangkok',
    country: 'Thailand',
    description: 'Underground hip-hop cypher on a rooftop venue. Open to all ODI artists.',
    category: 'perform',
    status: 'pending',
    submittedBy: 'user_001',
    createdAt: '2026-11-18T10:00:00Z',
  },
  {
    id: 'er-2',
    title: 'Producer Collab Session',
    city: 'Seoul',
    country: 'Korea',
    description: 'Beat-makers unite — bring your stems and swap loops for a day.',
    category: 'collab',
    status: 'pending',
    submittedBy: 'user_002',
    createdAt: '2026-11-19T14:30:00Z',
  },
  {
    id: 'er-3',
    title: 'Vocal Masterclass with ODI J',
    city: 'Tokyo',
    country: 'Japan',
    description: 'Small-group vocal coaching session led by ODI J.',
    category: 'learn',
    status: 'pending',
    submittedBy: 'user_003',
    createdAt: '2026-11-20T09:15:00Z',
  },
];

const seedConsolidatedRequests: ConsolidatedRequest[] = [
  {
    id: 'cr-1',
    type: 'verification',
    status: 'pending',
    submittedBy: 'ga-eul@odi.com',
    createdAt: '2026-11-17T12:00:00Z',
    details: { stage_name: 'GA-EUL', platform: 'Spotify', followers: '12500', reason: 'Verified artist with monthly listeners' },
  },
  {
    id: 'cr-2',
    type: 'audition',
    status: 'pending',
    submittedBy: 'new.artist@odi.com',
    createdAt: '2026-11-18T16:20:00Z',
    details: { stage_name: 'NOVA', discipline: 'Vocalist', portfolio: 'soundcloud.com/nova', experience: '3 years' },
  },
  {
    id: 'cr-3',
    type: 'event',
    status: 'pending',
    submittedBy: 'user_001',
    createdAt: '2026-11-18T10:00:00Z',
    details: { title: 'Rooftop Cypher Night', city: 'Bangkok', country: 'Thailand', category: 'Perform' },
  },
  {
    id: 'cr-4',
    type: 'support',
    status: 'pending',
    submittedBy: 'fan@odi.com',
    createdAt: '2026-11-19T08:45:00Z',
    details: { subject: 'Cannot upload track', message: 'Cloud upload keeps failing after 30 seconds.' },
  },
];

// ─── Context ─────────────────────────────────────────────

const ContentContext = createContext<ContentContextValue | null>(null);

let artistIdCounter = 100;
let templateIdCounter = 100;

export function ContentProvider({ children }: { children: ReactNode }) {
  const [artists, setArtists] = useState<ManagedArtist[]>(seedArtists);
  const [supportContent, setSupportContent] = useState<SupportContent>(seedSupportContent);
  const [aboutContent, setAboutContent] = useState<AboutContent>(seedAboutContent);
  const [noteTemplates, setNoteTemplates] = useState<NoteTemplateImage[]>(seedNoteTemplates);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>(seedEventRequests);
  const [consolidatedRequests, setConsolidatedRequests] = useState<ConsolidatedRequest[]>(seedConsolidatedRequests);

  const addArtist: ContentContextValue['addArtist'] = (artist) => {
    setArtists((prev) => [...prev, { ...artist, id: ++artistIdCounter }]);
  };

  const updateArtist: ContentContextValue['updateArtist'] = (id, updates) => {
    setArtists((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteArtist: ContentContextValue['deleteArtist'] = (id) => {
    setArtists((prev) => prev.filter((a) => a.id !== id));
  };

  const updateSupportContent: ContentContextValue['updateSupportContent'] = (updates) => {
    setSupportContent((prev) => ({ ...prev, ...updates }));
  };

  const addFaq: ContentContextValue['addFaq'] = (faq) => {
    setSupportContent((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { ...faq, id: `faq-${Date.now()}` }],
    }));
  };

  const updateFaq: ContentContextValue['updateFaq'] = (id, updates) => {
    setSupportContent((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const deleteFaq: ContentContextValue['deleteFaq'] = (id) => {
    setSupportContent((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== id),
    }));
  };

  const updateAboutSection: ContentContextValue['updateAboutSection'] = (id, updates) => {
    setAboutContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const updateAboutClosing: ContentContextValue['updateAboutClosing'] = (quote, authors) => {
    setAboutContent((prev) => ({ ...prev, closingQuote: quote, closingAuthors: authors }));
  };

  const addNoteTemplate: ContentContextValue['addNoteTemplate'] = (template) => {
    setNoteTemplates((prev) => [...prev, { ...template, id: `tpl-${++templateIdCounter}` }]);
  };

  const deleteNoteTemplate: ContentContextValue['deleteNoteTemplate'] = (id) => {
    setNoteTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const approveEventRequest: ContentContextValue['approveEventRequest'] = (id) => {
    setEventRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
  };

  const rejectEventRequest: ContentContextValue['rejectEventRequest'] = (id) => {
    setEventRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
  };

  const approvedMapEvents = eventRequests
    .filter((r) => r.status === 'approved')
    .map((r, i) => ({
      id: 1000 + i,
      title: r.title,
      type: r.category,
      city: r.city,
      country: r.country,
      description: r.description,
      lat: 35 + Math.random() * 20,
      lng: 100 + Math.random() * 40,
    }));

  const approveRequest: ContentContextValue['approveRequest'] = (id) => {
    setConsolidatedRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
  };

  const rejectRequest: ContentContextValue['rejectRequest'] = (id) => {
    setConsolidatedRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
  };

  const value: ContentContextValue = {
    artists,
    addArtist,
    updateArtist,
    deleteArtist,
    supportContent,
    updateSupportContent,
    addFaq,
    updateFaq,
    deleteFaq,
    aboutContent,
    updateAboutSection,
    updateAboutClosing,
    noteTemplates,
    addNoteTemplate,
    deleteNoteTemplate,
    eventRequests,
    approveEventRequest,
    rejectEventRequest,
    approvedMapEvents,
    consolidatedRequests,
    approveRequest,
    rejectRequest,
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}
