import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export default function AboutTab() {
  const { aboutContent, updateAboutSection, updateAboutClosing } = useContent();
  const [savedId, setSavedId] = useState<string | null>(null);

  const handleSave = (id: string) => {
    // TODO: connect Supabase
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleClosingSave = () => {
    // TODO: connect Supabase
    setSavedId('closing');
    setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
        <h2 className="font-anton text-2xl uppercase text-white">About Us — Legend Editor</h2>
        <p className="mt-2 text-sm text-[#888888]">Edit the 5-act legend. Headings use Anton, body text uses Inter on the public page.</p>
      </div>

      {aboutContent.sections.map((section) => (
        <div
          key={section.id}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#3B82F6]/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#3B82F6]">
              {section.label}
            </span>
            {savedId === section.id && (
              <span className="flex items-center gap-1 text-xs text-[#22C55E]">
                <Check size={12} strokeWidth={2} /> Saved
              </span>
            )}
          </div>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Label</span>
              <input
                value={section.label}
                onChange={(e) => updateAboutSection(section.id, { label: e.target.value })}
                className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Title (Anton heading)</span>
              <input
                value={section.title}
                onChange={(e) => updateAboutSection(section.id, { title: e.target.value })}
                className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Body (Inter, paragraphs separated by blank lines)</span>
              <textarea
                value={section.body}
                onChange={(e) => updateAboutSection(section.id, { body: e.target.value })}
                rows={6}
                className="resize-y rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm leading-relaxed text-[#CCCCCC] outline-none transition-colors focus:border-[#3B82F6]"
              />
            </label>
            <button
              onClick={() => handleSave(section.id)}
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
            >
              <Save size={15} /> Save Section
            </button>
          </div>
        </div>
      ))}

      {/* Closing quote */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
        <h3 className="font-anton text-xl uppercase text-white">Closing Quote</h3>
        {savedId === 'closing' && (
          <span className="mt-2 flex items-center gap-1 text-xs text-[#22C55E]">
            <Check size={12} strokeWidth={2} /> Saved
          </span>
        )}
        <div className="mt-4 grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Quote</span>
            <input
              value={aboutContent.closingQuote}
              onChange={(e) => updateAboutClosing(e.target.value, aboutContent.closingAuthors)}
              className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Authors</span>
            <input
              value={aboutContent.closingAuthors}
              onChange={(e) => updateAboutClosing(aboutContent.closingQuote, e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
            />
          </label>
          <button
            onClick={handleClosingSave}
            className="inline-flex items-center gap-2 self-start rounded-full bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
          >
            <Save size={15} /> Save Closing
          </button>
        </div>
      </div>
    </div>
  );
}
