import { Home, Cloud, Music2, Map, User, Palette } from 'lucide-react';

export type NavId = 'home' | 'cloud' | 'notes' | 'map' | 'artists';

interface BottomNavProps {
  active: NavId;
  onNavigate: (id: NavId) => void;
  onProfileClick: () => void;
  profileActive?: boolean;
}

const navItems: { id: NavId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'cloud', label: 'Cloud', icon: Cloud },
  { id: 'notes', label: 'Notes', icon: Music2 },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'artists', label: 'Artists', icon: Palette },
];

export default function BottomNav({
  active,
  onNavigate,
  onProfileClick,
  profileActive,
}: BottomNavProps) {
  return (
    <nav
      className="pointer-events-none fixed bottom-4 z-40 flex items-center"
      style={{ left: '16px', right: '16px', justifyContent: 'center' }}
    >
      <div
        className="pointer-events-auto flex items-center gap-0.5 rounded-[32px] border border-white/10 bg-[#0A0A0A]/95 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-float"
        style={{ height: '64px' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group flex items-center gap-1.5 rounded-full transition-all ${
                isActive
                  ? 'bg-[#3B82F6]/20 text-[#3B82F6] shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                  : 'text-[#888888] hover:text-white hover:bg-white/5'
              }`}
              style={{ height: '40px', minWidth: '40px', padding: '0 10px' }}
              aria-label={item.label}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span
                className={`max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 group-hover:max-w-[60px] ${
                  isActive ? 'max-w-[60px]' : ''
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onProfileClick}
        className={`pointer-events-auto flex items-center justify-center rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all hover:scale-105 animate-float ${
          profileActive
            ? 'bg-[#3B82F6] text-white'
            : 'bg-[#0A0A0A]/95 text-white border border-white/10'
        }`}
        style={{
          height: '48px',
          width: '48px',
          marginLeft: '8px',
          animationDelay: '0.5s',
        }}
        aria-label="Profile"
      >
        <User size={18} strokeWidth={1.75} />
      </button>
    </nav>
  );
}
