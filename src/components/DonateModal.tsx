import { useState } from 'react';
import { Heart, X } from 'lucide-react';

interface DonateModalProps {
  open: boolean;
  artistName: string;
  onClose: () => void;
}

const PRESETS = [1, 5, 10, 25];

export default function DonateModal({ open, artistName, onClose }: DonateModalProps) {
  const [amount, setAmount] = useState<number | ''>(5);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount(5);
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm animate-fade-overlay"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-[#3B82F6]" fill="currentColor" />
            <h2 className="font-anton text-xl uppercase text-white">Donate</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white transition-colors hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-4 text-sm text-[#888888]">
          Support <span className="font-semibold text-white">{artistName}</span> with a donation.
        </p>

        {submitted ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3B82F6]/15">
              <Heart size={28} className="text-[#3B82F6]" fill="currentColor" />
            </div>
            <p className="text-center text-sm text-white">Thank you for your support!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    amount === p
                      ? 'bg-[#3B82F6] text-white'
                      : 'border border-white/10 text-[#888888] hover:bg-white/5'
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-xs uppercase tracking-wider text-[#888888]">Custom amount</label>
              <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-white/5 px-4">
                <span className="text-sm text-[#888888]">$</span>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!amount || amount <= 0}
              className="mt-6 w-full rounded-full bg-[#3B82F6] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] disabled:opacity-40"
            >
              Donate {amount && amount > 0 ? `$${amount}` : ''}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
