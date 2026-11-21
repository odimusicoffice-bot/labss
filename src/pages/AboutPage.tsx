import { ArrowLeft } from 'lucide-react';
import FadeInOnScroll from '@/components/FadeInOnScroll';
import { useContent } from '@/context/ContentContext';

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  const { aboutContent } = useContent();
  const { sections, closingQuote, closingAuthors } = aboutContent;
  return (
    <div className="min-h-screen overflow-y-auto overflow-x-hidden bg-black px-6 pb-28 pt-10 text-white sm:px-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-black/70"
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
          Back
        </button>

        <FadeInOnScroll className="mt-16">
          <p className="text-xs uppercase tracking-[0.4em] text-[#3B82F6]">ЛЕГЕНДА ODI LABS</p>
          <h1 className="mt-4 font-anton text-5xl uppercase leading-[1.2] text-white sm:text-7xl">
            Убежище для Одержимых
          </h1>
        </FadeInOnScroll>

        {sections.map((section) => (
          <section key={section.label} className="mt-20 sm:mt-24">
            <FadeInOnScroll>
              <p className="text-xs uppercase tracking-[0.4em] text-[#888888]">{section.label}</p>
              <h2 className="mt-4 font-anton text-3xl uppercase leading-[1.2] text-white sm:text-4xl">
                {section.title}
              </h2>
            </FadeInOnScroll>
            <FadeInOnScroll className="mt-6">
              <div className="max-w-xl space-y-4">
                {section.body.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-sm leading-[1.7] text-[#D4D4D4] sm:text-base sm:leading-[1.75]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </FadeInOnScroll>
          </section>
        ))}

        <FadeInOnScroll className="mt-20 sm:mt-24">
          <p className="font-anton text-2xl uppercase leading-[1.3] text-white sm:text-3xl">
            {closingQuote}
          </p>
          <p className="mt-4 text-xs italic text-[#888888]">{closingAuthors}</p>
        </FadeInOnScroll>
      </div>
    </div>
  );
}
