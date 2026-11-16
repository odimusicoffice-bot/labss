import { useId, useState } from 'react';

interface FaqItemProps {
  question: string;
  answer: string;
}

export default function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div
      className={`rounded-2xl border bg-white/[0.03] backdrop-blur-md transition-all duration-300 ${
        open
          ? 'border-[#3B82F6] shadow-[0_0_24px_-4px_rgba(59,130,246,0.45)]'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className={`text-sm font-medium transition-colors duration-300 ${open ? 'text-[#3B82F6]' : 'text-white'}`}>
          {question}
        </span>
        <span className="relative h-4 w-4 shrink-0" aria-hidden="true">
          <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 rounded-full bg-white" />
          <span
            className={`absolute left-1/2 top-0 h-4 w-[1.5px] -translate-x-1/2 rounded-full bg-white transition-all duration-300 ease-out ${
              open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
            }`}
          />
        </span>
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-[1.5] text-[#A3A3A3]">{answer}</p>
        </div>
      </div>
    </div>
  );
}
