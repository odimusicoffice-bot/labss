import { useState } from 'react';
import { ArrowLeft, Send, Check, ShieldCheck } from 'lucide-react';
import FaqItem from '@/components/FaqItem';
import VerificationModal from '@/components/VerificationModal';

interface SupportPageProps {
  onBack: () => void;
}

const faqs = [
  {
    question: 'Profile',
    answer:
      'Your profile is your home base on ODI LABS. Open it to edit your name, bio and photo, and to see your activity.',
  },
  {
    question: 'Cloud',
    answer:
      'Cloud is your music library. Upload tracks, star your favourites and play them back from anywhere in the app.',
  },
  {
    question: 'Notes',
    answer:
      'Notes is where you write down your thoughts about the events you attend. Link a note to an event on the map to find it again later.',
  },
  {
    question: 'Map',
    answer:
      'The Map shows events around the world. Tap a marker to see the details and mark the events you plan to go to.',
  },
  {
    question: 'Artists',
    answer:
      'Browse the ODI LABS roster, open an artist profile and support them directly with a donation.',
  },
  {
    question: 'Bonuses',
    answer:
      'Bonuses are rewards for being active on ODI LABS. Check your profile to see which bonuses you have unlocked.',
  },
  {
    question: 'First Star',
    answer:
      'Starring your first track in Cloud is a small milestone. Your starred tracks show up in Radar, so you can find them quickly.',
  },
];

export default function SupportPage({ onBack }: SupportPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-8 sm:px-10" style={{ paddingBottom: '120px' }}>
      <div className="mx-auto max-w-md">
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Back
        </button>

        <h1 className="font-anton text-4xl uppercase text-white sm:text-5xl">Support</h1>
        <p className="mt-3 text-sm text-[#888888]">
          Find quick answers below, or send us a message.
        </p>

        <section className="mt-10 space-y-3">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </section>

        <button
          type="button"
          onClick={() => setVerificationOpen(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#3B82F6]/50 bg-[#3B82F6]/10 py-4 text-sm font-semibold text-[#3B82F6] transition-all hover:border-[#3B82F6] hover:bg-[#3B82F6]/20"
        >
          <ShieldCheck size={16} strokeWidth={2} />
          Apply for Verification
        </button>

        <div className="mt-14 border-t border-[#222222] pt-10">
          <h2 className="font-anton text-2xl uppercase text-white">Still need help?</h2>

          {sent && (
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-5 py-4 text-sm text-[#3B82F6]">
              <Check size={18} strokeWidth={2} />
              Message sent. We'll get back to you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-[#555555]">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#222222] bg-[#141414] px-5 py-3.5 text-sm text-white placeholder-[#555555] outline-none transition-colors focus:border-[#3B82F6]"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-[#555555]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#222222] bg-[#141414] px-5 py-3.5 text-sm text-white placeholder-[#555555] outline-none transition-colors focus:border-[#3B82F6]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-[#555555]">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="w-full resize-none rounded-2xl border border-[#222222] bg-[#141414] px-5 py-3.5 text-sm text-white placeholder-[#555555] outline-none transition-colors focus:border-[#3B82F6]"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3B82F6] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30"
            >
              <Send size={16} strokeWidth={2} />
              Send Message
            </button>
          </form>
        </div>
      </div>

      <VerificationModal open={verificationOpen} onClose={() => setVerificationOpen(false)} />
    </div>
  );
}
