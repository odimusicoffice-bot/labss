import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, SlidersHorizontal, X, Calendar, Map as MapIcon, Bookmark, CheckCircle2,
  ChevronDown, Plus, Shield, AlertCircle, Check, Lock,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  typeConfig, categoryGroups,
  type EventType, type SubCategory,
} from '@/data/mapEvents';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import BottomNav, { type NavId } from '@/components/BottomNav';

interface MapPageProps {
  onBack: () => void;
  focusEventId?: number;
  onNavigate?: (id: 'home' | 'cloud' | 'notes' | 'map' | 'artists') => void;
  onProfileClick?: () => void;
}

interface DbEvent {
  id: number;
  title: string;
  type: string;
  sub_category: string;
  city: string;
  country: string;
  date: string;
  lat: number;
  lng: number;
  major: boolean;
  description: string | null;
  image_url: string | null;
  is_safe_zone: boolean;
}

const pinIconSvgs: Record<string, string> = {
  perform: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>',
  studio: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  shoot: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  collab: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  event: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  learn: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  cover_dance: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  safe_zone: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
};

function createPinIcon(type: string, major: boolean, isSafeZone: boolean): L.DivIcon {
  const size = major ? 34 : 28;
  const borderColor = isSafeZone ? '#D4AF37' : '#3B82F6';
  const bgColor = '#0A0A0A';
  const iconColor = isSafeZone ? '#D4AF37' : '#3B82F6';
  const glowSize = major ? '16px' : '8px';
  const glowColor = isSafeZone ? 'rgba(212,175,55,0.5)' : 'rgba(59,130,246,0.5)';
  const svgPath = pinIconSvgs[type] ?? pinIconSvgs.event;

  return L.divIcon({
    className: 'odi-map-pin',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bgColor};border:2px solid ${borderColor};
      box-shadow:0 0 ${glowSize} ${glowColor};
      display:flex;align-items:center;justify-content:center;
      transition:transform 0.2s;
    "><svg width="${Math.floor(size * 0.5)}" height="${Math.floor(size * 0.5)}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface EventStatus {
  saved: boolean;
  visited: boolean;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

export default function MapPage({ onBack, focusEventId, onNavigate, onProfileClick }: MapPageProps) {
  const { user, isVip } = useAuth();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);

  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DbEvent | null>(null);
  const [statusMap, setStatusMap] = useState<Record<number, EventStatus>>({});
  const [selectedSubCategories, setSelectedSubCategories] = useState<Set<SubCategory>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestForm, setSuggestForm] = useState({ title: '', city: '', country: '', description: '', link: '' });
  const [suggestSent, setSuggestSent] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      showToast('Could not load events from the database.', 'error');
    } else if (data) {
      setEvents(data as DbEvent[]);
    }
    setLoadingEvents(false);
  }, [showToast]);

  const loadStatuses = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('event_user_status')
      .select('event_id, saved, visited')
      .eq('user_id', user.id);
    if (data) {
      const map: Record<number, EventStatus> = {};
      for (const row of data) {
        map[row.event_id] = { saved: row.saved, visited: row.visited };
      }
      setStatusMap(map);
    }
  }, [user]);

  useEffect(() => {
    loadEvents();
    loadStatuses();
  }, [loadEvents, loadStatuses]);

  const toggleStatus = async (eventId: number, field: 'saved' | 'visited') => {
    if (!user) {
      showToast('Sign in to save events.', 'error');
      return;
    }
    const current = statusMap[eventId] ?? { saved: false, visited: false };
    const newValue = !current[field];
    setStatusMap((prev) => ({
      ...prev,
      [eventId]: { ...current, [field]: newValue },
    }));

    const { error } = await supabase
      .from('event_user_status')
      .upsert({ user_id: user.id, event_id: eventId, [field]: newValue });
    if (error) {
      setStatusMap((prev) => ({
        ...prev,
        [eventId]: { ...current, [field]: !newValue },
      }));
      showToast('Could not update. Check your connection.', 'error');
    }
  };

  const filteredEvents = events.filter((e) => {
    if (selectedSubCategories.size > 0 && !selectedSubCategories.has(e.sub_category as SubCategory)) return false;
    if (selectedCountry && e.country !== selectedCountry) return false;
    if (selectedCity && e.city !== selectedCity) return false;
    return true;
  });

  const availableCountries = Array.from(new Set(events.map((e) => e.country))).sort();
  const availableCities = Array.from(new Set(
    events.filter((e) => !selectedCountry || e.country === selectedCountry).map((e) => e.city)
  )).sort();

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [40, 60],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '',
      subdomains: 'abc',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredEvents.forEach((event) => {
      const marker = L.marker([event.lat, event.lng], {
        icon: createPinIcon(event.type, event.major, event.is_safe_zone),
      });
      marker.bindTooltip(event.title, {
        permanent: false,
        direction: 'top',
        offset: [0, -12],
        className: event.is_safe_zone ? 'odi-map-tooltip odi-map-tooltip-gold' : 'odi-map-tooltip',
      });
      marker.on('click', () => {
        setSelectedEvent(event);
        if (isMobile) {
          map.setView([event.lat, event.lng], 14, { animate: false });
          map.panBy([0, 170], { animate: false });
        } else {
          map.flyTo([event.lat, event.lng], 14, { duration: 1.5 });
          const onMoveEnd = () => {
            map.panBy([0, 170], { animate: true, duration: 0.5 });
            map.off('moveend', onMoveEnd);
          };
          map.on('moveend', onMoveEnd);
        }
      });
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    map.invalidateSize();
  }, [filteredEvents]);

  useEffect(() => {
    if (!focusEventId || !mapRef.current) return;
    const event = events.find((e) => e.id === focusEventId);
    if (!event) return;
    const map = mapRef.current;
    setSelectedEvent(event);
    if (isMobile) {
      map.setView([event.lat, event.lng], 14, { animate: false });
      map.panBy([0, 170], { animate: false });
    } else {
      map.flyTo([event.lat, event.lng], 14, { duration: 1.5 });
      const onMoveEnd = () => {
        map.panBy([0, 170], { animate: true, duration: 0.5 });
        map.off('moveend', onMoveEnd);
      };
      map.on('moveend', onMoveEnd);
    }
  }, [focusEventId, events]);

  const toggleSubCategory = (sub: SubCategory) => {
    setSelectedSubCategories((prev) => {
      const next = new Set(prev);
      if (next.has(sub)) next.delete(sub);
      else next.add(sub);
      return next;
    });
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedSubCategories(new Set());
    setSelectedCountry(null);
    setSelectedCity(null);
  };

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('user_requests').insert({
      user_id: user.id,
      type: 'event',
      payload: {
        title: suggestForm.title,
        city: suggestForm.city,
        country: suggestForm.country,
        description: suggestForm.description,
        link: suggestForm.link,
      },
    });
    if (error) {
      showToast('Could not submit event suggestion.', 'error');
      return;
    }
    setSuggestSent(true);
    setSuggestForm({ title: '', city: '', country: '', description: '', link: '' });
    showToast('Event submitted for review.', 'success');
    setTimeout(() => {
      setSuggestSent(false);
      setSuggestOpen(false);
    }, 2500);
  };

  const activeFilterCount = selectedSubCategories.size + (selectedCountry ? 1 : 0) + (selectedCity ? 1 : 0);
  const safeZoneCount = events.filter((e) => e.is_safe_zone).length;

  return (
    <div className="fixed inset-0 bg-[#0A0A0A]">
      {/* Map container */}
      <div ref={containerRef} className="absolute inset-0 h-full w-full" style={{ background: '#0A0A0A', minHeight: '100%' }} />

      {/* Top overlay */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-[1000]">
        <div className="pointer-events-auto flex items-center justify-between px-6 pt-8 sm:px-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            Back
          </button>

          <div className="flex items-center gap-4">
            <h1 className="font-anton text-3xl uppercase leading-none text-white sm:text-4xl">MAP</h1>
          </div>

          <button
            onClick={() => setFiltersOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30"
          >
            <SlidersHorizontal size={15} strokeWidth={2} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-[#3B82F6]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Suggest Event button */}
      <div className="pointer-events-none absolute left-1/2 top-24 z-[999] -translate-x-1/2">
        <button
          onClick={() => setSuggestOpen(true)}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-[#0A0A0A]/80 px-5 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-[#3B82F6]/50 hover:bg-[#0A0A0A]/90"
        >
          <Plus size={15} strokeWidth={2} className="text-[#3B82F6]" />
          Suggest Event
        </button>
      </div>

      {/* VIP Safe Zone indicator */}
      {isVip && safeZoneCount > 0 && (
        <div className="pointer-events-none absolute right-6 top-24 z-[999] sm:right-10">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#0A0A0A]/80 px-4 py-2.5 text-xs font-medium text-[#D4AF37] backdrop-blur-md">
            <Shield size={14} strokeWidth={2} />
            {safeZoneCount} Safe Zone{safeZoneCount > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Leaflet CSS overrides */}
      <style>{`
        .leaflet-container { background: #0A0A0A !important; }
        .leaflet-tile-pane {
          filter: invert(1) hue-rotate(180deg) brightness(1.1) contrast(0.8) saturate(0.5);
        }
        .leaflet-marker-pane, .leaflet-popup-pane, .leaflet-tooltip-pane {
          filter: none !important;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
        .leaflet-control-zoom a {
          background: rgba(10,10,10,0.85) !important;
          color: #888888 !important;
          border: 1px solid #222222 !important;
          border-radius: 8px !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-control-zoom a:hover {
          color: #3B82F6 !important;
          border-color: #3B82F6 !important;
        }
        .leaflet-control-zoom { margin-bottom: 100px !important; margin-right: 16px !important; box-shadow: none !important; }
        .odi-map-pin { background: transparent !important; border: none !important; }
        .leaflet-marker-icon { transition: transform 0.2s ease; }
        .leaflet-marker-icon:hover { transform: scale(1.3); z-index: 1000 !important; }
        .odi-map-tooltip {
          background: rgba(10,10,10,0.9) !important;
          color: #FFFFFF !important;
          border: 1px solid #3B82F6 !important;
          border-radius: 8px !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 12px !important;
          padding: 6px 12px !important;
          box-shadow: 0 4px 16px rgba(59,130,246,0.2) !important;
          backdrop-filter: blur(8px);
        }
        .odi-map-tooltip-gold {
          border-color: #D4AF37 !important;
          box-shadow: 0 4px 16px rgba(212,175,55,0.2) !important;
        }
        .odi-map-tooltip::before { display: none !important; }
      `}</style>

      {/* Filter bottom sheet */}
      {filtersOpen && (
        <div className="absolute inset-0 z-[1100] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0A0A0A]/95 px-6 pb-10 pt-6 backdrop-blur-xl animate-fade-up">
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-[#333333]" />

            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-anton text-xl uppercase text-white">Filters</h2>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-[#888888] transition-colors hover:text-[#3B82F6]"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#888888] transition-colors hover:text-white"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {categoryGroups.map((group) => {
                const isExpanded = expandedGroups.has(group.label);
                const activeSubs = group.subCategories.filter((s) => selectedSubCategories.has(s.value));
                const hasActive = activeSubs.length > 0;

                return (
                  <div key={group.label} className="rounded-2xl border border-white/10 bg-white/[0.03]">
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                    >
                      <span className={`text-sm font-medium transition-colors ${hasActive ? 'text-[#3B82F6]' : 'text-white'}`}>
                        {group.label}
                        {hasActive && <span className="ml-2 text-xs text-[#888888]">{activeSubs.length}</span>}
                      </span>
                      <ChevronDown
                        size={16}
                        strokeWidth={2}
                        className={`text-[#888888] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="flex flex-wrap gap-2 px-4 pb-4">
                          {group.subCategories.map((sub) => {
                            const active = selectedSubCategories.has(sub.value);
                            return (
                              <button
                                key={sub.value}
                                onClick={() => toggleSubCategory(sub.value)}
                                className={`rounded-full px-3.5 py-2 text-xs font-medium transition-all ${
                                  active
                                    ? 'border border-[#3B82F6] bg-[#3B82F6] text-white'
                                    : 'border border-white/10 bg-[#111111] text-[#888888] hover:text-white'
                                }`}
                              >
                                {sub.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Country / City filters */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="px-4 pt-4 pb-2 text-sm font-medium text-white">Location</div>
                <div className="px-4 pb-4 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs text-[#888888]">Country</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => { setSelectedCountry(null); setSelectedCity(null); }}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          !selectedCountry ? 'border border-[#3B82F6] bg-[#3B82F6] text-white' : 'border border-white/10 bg-[#111111] text-[#888888] hover:text-white'
                        }`}
                      >All</button>
                      {availableCountries.map((c) => (
                        <button
                          key={c}
                          onClick={() => { setSelectedCountry(c); setSelectedCity(null); }}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            selectedCountry === c ? 'border border-[#3B82F6] bg-[#3B82F6] text-white' : 'border border-white/10 bg-[#111111] text-[#888888] hover:text-white'
                          }`}
                        >{c}</button>
                      ))}
                    </div>
                  </div>
                  {selectedCountry && availableCities.length > 0 && (
                    <div>
                      <label className="mb-1.5 block text-xs text-[#888888]">City</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedCity(null)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          !selectedCity ? 'border border-[#3B82F6] bg-[#3B82F6] text-white' : 'border border-white/10 bg-[#111111] text-[#888888] hover:text-white'
                        }`}
                        >All</button>
                        {availableCities.map((c) => (
                          <button
                            key={c}
                            onClick={() => setSelectedCity(c)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            selectedCity === c ? 'border border-[#3B82F6] bg-[#3B82F6] text-white' : 'border border-white/10 bg-[#111111] text-[#888888] hover:text-white'
                          }`}
                          >{c}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Safe Zone filter — only for VIP */}
              {isVip && (
                <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.03]">
                  <button
                    onClick={() => toggleSubCategory('safe_zone' as SubCategory)}
                    className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-[#D4AF37]">
                      <Shield size={15} strokeWidth={2} />
                      Safe Zones
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                      selectedSubCategories.has('safe_zone' as SubCategory)
                        ? 'bg-[#D4AF37] text-[#0A0A0A]'
                        : 'border border-[#D4AF37]/30 text-[#D4AF37]'
                    }`}>
                      {selectedSubCategories.has('safe_zone' as SubCategory) ? 'Active' : 'Show only'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event bottom sheet */}
      {selectedEvent && (
        <div className="absolute inset-0 z-[1050] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          />
          <div
            className={`relative w-full max-w-md overflow-hidden rounded-t-3xl border bg-[#0A0A0A]/95 backdrop-blur-xl animate-fade-up ${
              selectedEvent.is_safe_zone ? 'border-[#D4AF37]/30' : 'border-white/10'
            }`}
          >
            <div className="mx-auto mt-4 mb-2 h-1 w-10 rounded-full bg-[#333333]" />

            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0A]/60 text-[#888888] transition-colors hover:text-white"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {selectedEvent.image_url && (
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
              </div>
            )}

            <div className="px-6 pb-10 pt-4">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`flex h-2 w-2 rounded-full ${selectedEvent.is_safe_zone ? 'bg-[#D4AF37]' : selectedEvent.major ? 'bg-[#3B82F6]' : 'bg-[#666666]'}`}
                />
                <span className={`text-xs font-semibold uppercase tracking-wider ${selectedEvent.is_safe_zone ? 'text-[#D4AF37]' : 'text-[#3B82F6]'}`}>
                  {selectedEvent.is_safe_zone ? 'Safe Zone' : (typeConfig[selectedEvent.type as EventType]?.label ?? selectedEvent.type)}
                </span>
              </div>

              <h2 className="font-anton text-2xl uppercase leading-tight text-white">
                {selectedEvent.title}
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-[#A3A3A3]">
                {selectedEvent.description}
              </p>

              {/* Safe Zone badge */}
              {selectedEvent.is_safe_zone && (
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-3">
                  <Lock size={16} className="shrink-0 text-[#D4AF37]" strokeWidth={2} />
                  <span className="text-sm font-medium text-[#D4AF37]">Verified Access Only</span>
                </div>
              )}

              <div className="mt-5 flex items-center gap-4 text-sm text-[#888888]">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} strokeWidth={1.5} className="text-[#555555]" />
                  {selectedEvent.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapIcon size={14} strokeWidth={1.5} className="text-[#555555]" />
                  {selectedEvent.city}, {selectedEvent.country}
                </span>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => toggleStatus(selectedEvent.id, 'saved')}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all ${
                    statusMap[selectedEvent.id]?.saved
                      ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]'
                      : 'border-white/10 bg-[#111111] text-[#888888] hover:text-white'
                  }`}
                  aria-label="Save event"
                >
                  <Bookmark
                    size={18}
                    strokeWidth={1.75}
                    fill={statusMap[selectedEvent.id]?.saved ? 'currentColor' : 'none'}
                  />
                </button>
                <button
                  onClick={() => toggleStatus(selectedEvent.id, 'visited')}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all ${
                    statusMap[selectedEvent.id]?.visited
                      ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6]'
                      : 'border-white/10 bg-[#111111] text-[#888888] hover:text-white'
                  }`}
                  aria-label="Mark as visited"
                >
                  <CheckCircle2
                    size={18}
                    strokeWidth={1.75}
                    fill={statusMap[selectedEvent.id]?.visited ? 'currentColor' : 'none'}
                  />
                </button>
                <button className={`flex flex-1 items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold text-white transition-all hover:shadow-lg ${
                  selectedEvent.is_safe_zone
                    ? 'bg-[#D4AF37] hover:bg-[#B8941F] hover:shadow-[#D4AF37]/30'
                    : 'bg-[#3B82F6] hover:bg-[#2563EB] hover:shadow-[#3B82F6]/30'
                }`}>
                  {selectedEvent.is_safe_zone ? 'Access Safe Zone' : 'Save Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggest Event modal */}
      {suggestOpen && (
        <div className="absolute inset-0 z-[1200] flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSuggestOpen(false)}
          />
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0A0A0A]/95 p-6 backdrop-blur-xl animate-fade-up sm:rounded-3xl">
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-[#333333] sm:hidden" />

            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-anton text-xl uppercase text-white">Suggest Event</h2>
              <button
                onClick={() => setSuggestOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#888888] transition-colors hover:text-white"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {!user ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/10">
                  <Shield size={28} className="text-[#3B82F6]" strokeWidth={1.5} />
                </div>
                <h3 className="font-anton text-lg uppercase text-white">Join ODI LABS</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-[#888888]">
                  Sign in to suggest events and help the community discover what's happening.
                </p>
              </div>
            ) : suggestSent ? (
              <div className="flex items-center gap-2 rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-5 py-4 text-sm text-[#3B82F6]">
                <Check size={18} strokeWidth={2} />
                Event submitted. We'll review it soon.
              </div>
            ) : (
              <form onSubmit={handleSuggestSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#555555]">Event Title</label>
                  <input
                    type="text"
                    value={suggestForm.title}
                    onChange={(e) => setSuggestForm({ ...suggestForm, title: e.target.value })}
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
                    placeholder="Event name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#555555]">City</label>
                    <input
                      type="text"
                      value={suggestForm.city}
                      onChange={(e) => setSuggestForm({ ...suggestForm, city: e.target.value })}
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#555555]">Country</label>
                    <input
                      type="text"
                      value={suggestForm.country}
                      onChange={(e) => setSuggestForm({ ...suggestForm, country: e.target.value })}
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
                      placeholder="Country"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#555555]">Description</label>
                  <textarea
                    value={suggestForm.description}
                    onChange={(e) => setSuggestForm({ ...suggestForm, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
                    placeholder="Tell us about the event..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#555555]">Link (optional)</label>
                  <input
                    type="url"
                    value={suggestForm.link}
                    onChange={(e) => setSuggestForm({ ...suggestForm, link: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
                    placeholder="https://organizer-or-event-link.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#3B82F6] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2563EB]"
                >
                  Submit Event
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-[2000] flex -translate-x-1/2 flex-col items-center gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-2.5 rounded-full border px-5 py-3 shadow-xl animate-fade-up ${
                toast.type === 'success'
                  ? 'border-[#3B82F6]/30 bg-[#0A0A0A]/90 text-white backdrop-blur-md'
                  : 'border-[#EF4444]/30 bg-[#0A0A0A]/90 text-[#EF4444] backdrop-blur-md'
              }`}
            >
              {toast.type === 'success' ? (
                <Check size={16} className="text-[#3B82F6]" strokeWidth={2} />
              ) : (
                <AlertCircle size={16} strokeWidth={2} />
              )}
              <span className="text-sm">{toast.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bottom navigation */}
      {onNavigate && onProfileClick && (
        <BottomNav
          active="map"
          onNavigate={(id: NavId) => onNavigate(id)}
          onProfileClick={onProfileClick}
        />
      )}
    </div>
  );
}
