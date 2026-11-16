import { ArrowLeft, ArrowUpRight, Globe2, Star } from 'lucide-react';

interface ArtistsPageProps {
  onBack: () => void;
  onViewProfile: () => void;
}

interface ArtistStub {
  id: number;
  name: string;
  image: string;
  highlighted?: boolean;
}

const odiArtists: ArtistStub[] = [
  { id: 1, name: 'ODI J', image: '/images/artists/IMG_0736.jpeg', highlighted: true },
  {
    id: 2,
    name: 'Artist 2',
    image: 'https://images.pexels.com/photos/18528273/pexels-photo-18528273.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 3,
    name: 'Artist 3',
    image: 'https://images.pexels.com/photos/19199566/pexels-photo-19199566.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

const globalArtists: ArtistStub[] = [
  {
    id: 4,
    name: 'Artist 4',
    image: 'https://images.pexels.com/photos/20052153/pexels-photo-20052153.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 5,
    name: 'Artist 5',
    image: 'https://images.pexels.com/photos/20052156/pexels-photo-20052156.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 6,
    name: 'Artist 6',
    image: 'https://images.pexels.com/photos/29516587/pexels-photo-29516587.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

const monochromeFilter = { filter: 'grayscale(100%) contrast(1.1)' };

// Crops the ODI J source screenshot to its portrait area, hiding the baked-in UI text and icons
const odiJCropStyle = { top: '-12%', height: '200%' };

function ArtistCard({
  artist,
  category,
  onViewProfile,
}: {
  artist: ArtistStub;
  category: string;
  onViewProfile: () => void;
}) {
  return (
    <article
      className={`snap-item relative isolate aspect-[4/5] w-[65vw] max-w-[260px] shrink-0 rounded-[24px] bg-[#0A0A0A] after:absolute after:inset-0 after:rounded-[24px] after:content-[''] after:-z-10 after:transition-shadow after:duration-300 ${
        artist.highlighted
          ? 'after:shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:after:shadow-[0_0_50px_rgba(212,175,55,0.55)]'
          : 'after:shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:after:shadow-[0_0_45px_rgba(59,130,246,0.45)]'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[24px]">
        <img
          src={artist.image}
          alt={artist.name}
          className={
            artist.highlighted ? 'absolute left-0 w-full object-cover' : 'absolute inset-0 h-full w-full object-cover'
          }
          style={artist.highlighted ? odiJCropStyle : monochromeFilter}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            <h3 className="truncate font-anton text-2xl uppercase leading-none text-white">{artist.name}</h3>
            <p className="mt-2 text-xs uppercase tracking-wider text-[#888888]">{category}</p>
          </div>
          <button
            type="button"
            aria-label={`View ${artist.name} profile`}
            onClick={onViewProfile}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-white backdrop-blur-md transition-all hover:bg-white/20 ${
              artist.highlighted ? 'border-[#D4AF37]/40 bg-[#D4AF37]/10' : 'border-white/25 bg-white/10'
            }`}
          >
            <ArrowUpRight size={16} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </article>
  );
}

function ArtistSection({
  title,
  category,
  icon: Icon,
  artists,
  onViewProfile,
}: {
  title: string;
  category: string;
  icon: typeof Star;
  artists: ArtistStub[];
  onViewProfile: () => void;
}) {
  return (
    <section className="mt-12">
      <div className="mb-5 flex items-center gap-3 px-6 sm:px-10">
        <Icon size={22} className="text-[#3B82F6]" strokeWidth={1.75} />
        <h2 className="font-anton text-2xl uppercase text-white">{title}</h2>
      </div>
      <div className="no-scrollbar flex gap-4 overflow-x-auto px-8 py-6 sm:px-10">
        {artists.map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            category={category}
            onViewProfile={artist.highlighted ? onViewProfile : () => {}}
          />
        ))}
      </div>
    </section>
  );
}

export default function ArtistsPage({ onBack, onViewProfile }: ArtistsPageProps) {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] pb-28 pt-8">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Back
        </button>

        <h1 className="font-anton text-5xl uppercase leading-none text-white sm:text-6xl">
          Artists
        </h1>
        <p className="mt-3 text-sm text-[#888888]">Discover the sound of ODI LABS.</p>
      </div>

      <ArtistSection
        title="ODI A"
        category="ODI A"
        icon={Star}
        artists={odiArtists}
        onViewProfile={onViewProfile}
      />
      <ArtistSection
        title="Global Artists"
        category="GLOBAL"
        icon={Globe2}
        artists={globalArtists}
        onViewProfile={onViewProfile}
      />
    </div>
  );
}
