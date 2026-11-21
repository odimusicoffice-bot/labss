import { useState } from 'react';
import { Plus, Trash2, Save, MessageCircle, Send, Instagram, Mail, Youtube } from 'lucide-react';
import { useContent, type FaqItem } from '@/context/ContentContext';

export default function SupportContactsTab() {
  const { supportContent, updateSupportContent, addFaq, updateFaq, deleteFaq } = useContent();
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [saved, setSaved] = useState(false);

  const handleFieldSave = (field: keyof typeof supportContent, value: string) => {
    // TODO: connect Supabase
    updateSupportContent({ [field]: value });
    flashSaved();
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    // TODO: connect Supabase
    addFaq({ question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() });
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  const handleUpdateFaq = (id: string, field: keyof FaqItem, value: string) => {
    // TODO: connect Supabase
    updateFaq(id, { [field]: value });
  };

  const handleDeleteFaq = (id: string) => {
    // TODO: connect Supabase
    deleteFaq(id);
  };

  const linkFields = [
    { key: 'telegram' as const, label: 'Telegram', icon: MessageCircle, placeholder: '@odilabs' },
    { key: 'instagram' as const, label: 'Instagram', icon: Instagram, placeholder: '@odi.labs' },
    { key: 'email' as const, label: 'Email', icon: Mail, placeholder: 'odimusic.office@gmail.com' },
    { key: 'discord' as const, label: 'Discord', icon: Send, placeholder: 'odi-labs' },
    { key: 'youtube' as const, label: 'YouTube', icon: Youtube, placeholder: 'ODI LABS' },
  ];

  return (
    <div className="space-y-6">
      {saved && (
        <div className="rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-4 py-3 text-sm text-[#3B82F6]">
          Saved. Changes are live on the public pages.
        </div>
      )}

      {/* Descriptive texts */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
        <h2 className="font-anton text-2xl uppercase text-white">Descriptive Texts</h2>
        <div className="mt-5 grid gap-5">
          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Support Page Intro</span>
            <input
              value={supportContent.supportIntro}
              onChange={(e) => updateSupportContent({ supportIntro: e.target.value })}
              onBlur={() => handleFieldSave('supportIntro', supportContent.supportIntro)}
              className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#888888]">Contacts Page Intro</span>
            <input
              value={supportContent.contactsIntro}
              onChange={(e) => updateSupportContent({ contactsIntro: e.target.value })}
              onBlur={() => handleFieldSave('contactsIntro', supportContent.contactsIntro)}
              className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
            />
          </label>
        </div>
      </div>

      {/* Social / contact links */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
        <h2 className="font-anton text-2xl uppercase text-white">Contact Links</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {linkFields.map((field) => {
            const Icon = field.icon;
            return (
              <label key={field.key} className="grid gap-2">
                <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#888888]">
                  <Icon size={14} strokeWidth={1.75} /> {field.label}
                </span>
                <input
                  value={supportContent[field.key]}
                  onChange={(e) => updateSupportContent({ [field.key]: e.target.value })}
                  onBlur={() => handleFieldSave(field.key, supportContent[field.key])}
                  className="rounded-2xl border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
                  placeholder={field.placeholder}
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* FAQ management */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:p-8">
        <h2 className="font-anton text-2xl uppercase text-white">FAQ Items</h2>
        <p className="mt-2 text-sm text-[#888888]">Edit questions and answers shown on the Support page.</p>

        <div className="mt-5 space-y-3">
          {supportContent.faqs.map((faq) => (
            <div key={faq.id} className="rounded-2xl border border-white/10 bg-[#0A0A0A]/50 p-4">
              <div className="flex items-start gap-3">
                <div className="grid flex-1 gap-3">
                  <input
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(faq.id, 'question', e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm font-medium text-white outline-none transition-colors focus:border-[#3B82F6]"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(e) => handleUpdateFaq(faq.id, 'answer', e.target.value)}
                    rows={2}
                    className="resize-none rounded-xl border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm text-[#CCCCCC] outline-none transition-colors focus:border-[#3B82F6]"
                  />
                </div>
                <button
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="shrink-0 rounded-lg border border-white/10 p-2 text-[#888888] transition-all hover:border-[#EF4444]/40 hover:text-[#EF4444]"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new FAQ */}
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-[#0A0A0A]/30 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#3B82F6]">Add New FAQ</p>
          <div className="grid gap-3">
            <input
              value={newFaqQuestion}
              onChange={(e) => setNewFaqQuestion(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#3B82F6]"
              placeholder="Question"
            />
            <textarea
              value={newFaqAnswer}
              onChange={(e) => setNewFaqAnswer(e.target.value)}
              rows={2}
              className="resize-none rounded-xl border border-white/10 bg-[#0A0A0A] px-3 py-2 text-sm text-[#CCCCCC] outline-none transition-colors focus:border-[#3B82F6]"
              placeholder="Answer"
            />
            <button
              onClick={handleAddFaq}
              disabled={!newFaqQuestion.trim() || !newFaqAnswer.trim()}
              className="inline-flex items-center gap-2 self-start rounded-full bg-[#3B82F6] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} strokeWidth={2} /> Add FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
