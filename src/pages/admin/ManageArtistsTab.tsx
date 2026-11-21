import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Loader2, Music2, QrCode, Link2 } from 'lucide-react';
import { useContent, type ManagedArtist } from '@/context/ContentContext';

type Category = 'odi-a' | 'global';

interface FormState {
  alias: string;
  category: Category;
  photo: string;
  spotify: string;
  apple: string;
  youtube: string;
  donateQr: string;
  audioUrl: string;
}

const emptyForm: FormState = {
  alias: '',
  category: 'odi-a',
  photo: '',
  spotify: '',
  apple: '',
  youtube: '',
  donateQr: '',
  audioUrl: '',
};

export default function ManageArtistsTab() {
  const { artists, addArtist, updateArtist, deleteArtist } = useContent();
  const [editing, setEditing] = useState<ManagedArtist | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioValidating, setAudioValidating] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const openAdd = () => {
    setForm(emptyForm);
    setEditing(null);
    setIsAdding(true);
    setAudioError(null);
    setAudioDuration(null);
  };

  const openEdit = (artist: ManagedArtist) => {
    setForm({
      alias: artist.alias,
      category: artist.category,
      photo: artist.photo,
      spotify: artist.streamingLinks.spotify ?? '',
      apple: artist.streamingLinks.apple ?? '',
      youtube: artist.streamingLinks.youtube ?? '',
      donateQr: artist.donateQr ?? '',
      audioUrl: artist.audioUrl ?? '',
    });
    setEditing(artist);
    setIsAdding(true);
    setAudioError(null);
    setAudioDuration(artist.audioDurationSec ?? null);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditing(null);
    setForm(emptyForm);
    setAudioError(null);
    setAudioDuration(null);
  };

  const validateAudio = (url: string) => {
    setAudioError(null);
    setAudioDuration(null);
    if (!url) return;

    setAudioValidating(true);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = url;

    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      setAudioDuration(dur);
      if (dur > 40) {
        setAudioError(`Audio is ${Math.round(dur)}s — maximum is 40s.`);
      }
      setAudioValidating(false);
    };

    audio.onerror = () => {
      setAudioError('Could not load audio from this URL.');
      setAudioValidating(false);
    };
  };

  const handleSave = () => {
    if (!form.alias.trim()) return;
    if (audioError) return;

    const payload: Omit<ManagedArtist, 'id'> = {
      alias: form.alias.trim(),
      category: form.category,
      photo: form.photo.trim(),
      streamingLinks: {
        spotify: form.spotify.trim() || undefined,
        apple: form.apple.trim() || undefined,
        youtube: form.youtube.trim() || undefined,
      },
      donateQr: form.donateQr.trim() || undefined,
      audioUrl: form.audioUrl.trim() || undefined,
      audioDurationSec: audioDuration ?? undefined,
    };

    // TODO: connect Supabase
    if (editing) {
      updateArtist(editing.id, payload);
    } else {
      addArtist(payload);
    }
    closeForm();
  };

  const handleDelete = (id: number, alias: string) => {
    if (!window.confirm(`Delete artist "${alias}"?`)) return;
    // TODO: connect Supabase
    deleteArtist(id);
  };

  if (isAdding) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-anton text-2xl uppercase text-white">
            {editing ? 'Edit Artist' : 'Add New Artist'}
          </h2>
          <button onClick={closeForm} className="text-[#888888] transition-colors hover:text-white">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Alias</span>
              <input
                value={form.alias}
                onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value }))}
                className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
                placeholder="Stage name"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Category }))}
                className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
              >
                <option value="odi-a">ODI A</option>
                <option value="global">Global Artists</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Photo URL</span>
            <input
              value={form.photo}
              onChange={(e) => setForm((p) => ({ ...p, photo: e.target.value }))}
              className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
              placeholder="https://…  or  /images/…"
            />
          </label>

          {form.photo && (
            <div className="flex justify-center">
              <img
                src={form.photo}
                alt="Preview"
                className="h-32 w-32 rounded-2xl border border-white/10 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-[#0A0A0A]/50 p-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#3B82F6]">
              <Link2 size={14} strokeWidth={1.75} /> Streaming Links
            </p>
            <div className="grid gap-3">
              <input
                value={form.spotify}
                onChange={(e) => setForm((p) => ({ ...p, spotify: e.target.value }))}
                className="rounded-xl border border-white/10 bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
                placeholder="Spotify URL"
              />
              <input
                value={form.apple}
                onChange={(e) => setForm((p) => ({ ...p, apple: e.target.value }))}
                className="rounded-xl border border-white/10 bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
                placeholder="Apple Music URL"
              />
              <input
                value={form.youtube}
                onChange={(e) => setForm((p) => ({ ...p, youtube: e.target.value }))}
                className="rounded-xl border border-white/10 bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
                placeholder="YouTube URL"
              />
            </div>
          </div>

          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Donate QR Image URL</span>
            <input
              value={form.donateQr}
              onChange={(e) => setForm((p) => ({ ...p, donateQr: e.target.value }))}
              className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
              placeholder="QR code image URL"
            />
          </label>

          <div className="grid gap-2">
            <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#888888]">
              <Music2 size={14} strokeWidth={1.75} /> Audio MP3 (max 40s)
            </span>
            <input
              value={form.audioUrl}
              onChange={(e) => {
                setForm((p) => ({ ...p, audioUrl: e.target.value }));
                validateAudio(e.target.value);
              }}
              className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
              placeholder="https://…/track.mp3"
            />
            {audioValidating && (
              <span className="flex items-center gap-1.5 text-xs text-[#888888]">
                <Loader2 size={12} className="animate-spin" /> Validating audio…
              </span>
            )}
            {audioDuration !== null && !audioError && (
              <span className="text-xs text-[#22C55E]">Duration: {Math.round(audioDuration)}s — OK</span>
            )}
            {audioError && <span className="text-xs text-[#EF4444]">{audioError}</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!form.alias.trim() || !!audioError}
              className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              {editing ? 'Update' : 'Add Artist'}
            </button>
            <button
              onClick={closeForm}
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-[#888888] transition-colors hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-anton text-2xl uppercase text-white">Manage Artists</h2>
          <p className="mt-2 text-sm text-[#888888]">Add, edit, and remove artists from the public showcase.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
        >
          <Plus size={16} strokeWidth={2} />
          Add New Artist
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md transition-colors hover:border-[#3B82F6]/30"
          >
            <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-[#0A0A0A]">
              {artist.photo ? (
                <img src={artist.photo} alt={artist.alias} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[#555555]">
                  <Music2 size={28} strokeWidth={1.5} />
                </div>
              )}
              <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
                {artist.category === 'odi-a' ? 'ODI A' : 'Global'}
              </span>
            </div>
            <h3 className="font-anton text-lg uppercase text-white">{artist.alias}</h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {artist.streamingLinks.spotify && <span className="rounded-full bg-[#22C55E]/15 px-2 py-0.5 text-[10px] text-[#22C55E]">Spotify</span>}
              {artist.streamingLinks.apple && <span className="rounded-full bg-[#F59E0B]/15 px-2 py-0.5 text-[10px] text-[#F59E0B]">Apple</span>}
              {artist.streamingLinks.youtube && <span className="rounded-full bg-[#EF4444]/15 px-2 py-0.5 text-[10px] text-[#EF4444]">YouTube</span>}
              {artist.donateQr && <span className="flex items-center gap-1 rounded-full bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] text-[#3B82F6]"><QrCode size={10} /> QR</span>}
              {artist.audioUrl && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-[#CCCCCC]">Audio</span>}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => openEdit(artist)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/10 py-2 text-xs font-medium text-[#888888] transition-all hover:border-[#3B82F6]/50 hover:text-[#3B82F6]"
              >
                <Pencil size={12} strokeWidth={1.5} /> Edit
              </button>
              <button
                onClick={() => handleDelete(artist.id, artist.alias)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs font-medium text-[#888888] transition-all hover:border-[#EF4444]/40 hover:text-[#EF4444]"
              >
                <Trash2 size={12} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
