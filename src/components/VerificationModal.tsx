import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-2xl border border-[#222222] bg-[#141414] px-5 py-3.5 text-sm text-white placeholder-[#555555] outline-none transition-colors focus:border-[#3B82F6]';
const labelClass = 'mb-2 block text-xs uppercase tracking-wider text-[#555555]';

export default function VerificationModal({ open, onClose }: VerificationModalProps) {
  const [instagram, setInstagram] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-overlay sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Apply for Verification"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#111111]/95 p-6 backdrop-blur-xl animate-scale-in sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#888888] transition-colors hover:text-white"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <h2 className="font-anton text-2xl uppercase text-white">Apply for Verification</h2>
        <p className="mt-2 text-sm text-[#888888]">Tell us who you are and we will review your request.</p>

        {submitted ? (
          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-5 py-4 text-sm text-[#3B82F6]">
            <Check size={18} strokeWidth={2} />
            Application received. We will be in touch.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="verify-instagram" className={labelClass}>
                Instagram URL
              </label>
              <input
                id="verify-instagram"
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                required
                className={inputClass}
                placeholder="https://instagram.com/yourname"
              />
            </div>
            <div>
              <label htmlFor="verify-name" className={labelClass}>
                Name
              </label>
              <input
                id="verify-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="verify-email" className={labelClass}>
                Email
              </label>
              <input
                id="verify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-[#3B82F6] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30"
            >
              Submit Application
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
