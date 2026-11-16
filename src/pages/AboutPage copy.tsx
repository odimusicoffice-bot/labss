import { ArrowLeft } from 'lucide-react';
import FadeInOnScroll from '@/components/FadeInOnScroll';

interface AboutPageProps {
  onBack: () => void;
}

const sections = [
  {
    label: 'Prologue',
    title: 'Разные тени, одна тишина',
    body: 'В шумном Бангкоке Бобби видел, как айдолы сходят с ума от нехватки личного пространства, а в холодном Токио Кир наблюдал, как талантливые новички боятся даже выложить свой первый трек, потому что общество твердит им: «Ты никто».\n\nИндустрия едина в своей жестокости: она ломает и тех, кто на вершине, и тех, кто только пытается взобраться. Бобби и Кир поняли: им нужно построить дом для тех, кто «сломлен, но живет музыкой». Дом, где не нужно притворяться. Так родилась ODI (Obsession Dreams).',
  },
  {
    label: 'Акт I',
    title: 'Джей и Смена Короны',
    body: 'Первой музой проекта стала Джей из России. Она прошла через личный ад, потеряла всё и пришла в ODI с одним лишь голосом. Здесь она нашла не контракт, а тишину, в которой можно было наконец выдохнуть.\n\nЕе песня «The Crown» стала гимном. Это не песня о победе над другими. Это песня о падении старой, прогнившей короны индустрии. О том, что каждый, кто выжил после удара, заслуживает носить свою собственную корону — даже если она выкована из боли и тишины.',
  },
  {
    label: 'Акт II',
    title: 'Два уровня тишины',
    body: 'ODI LABS — это не просто приложение, это сложная архитектура с разными уровнями доступа. Здесь каждый находит свою защиту.\n\nУровень 1: Основное Приложение (Для всех артистов). Это убежище для независимых музыкантов, танцоров Cover Dance и продюсеров. Они прячутся не от папарацци, а от безденежья, творческих кризисов и страха быть непонятыми. Им нужны инструменты: Cloud (чтобы сохранить свои демо), Notes (чтобы фиксировать идеи до того, как они исчезнут), Artists (чтобы заявить о себе) и Map (чтобы найти места для репетиций и съемок). Это их творческая лаборатория.\n\nУровень 2: Safe Zones & VIP-Верификация (Для избранных). Это элитный, закрытый контур. Он создан специально для айдолов и топовых артистов, которым нужна абсолютная тишина и физическая безопасность. Фраза-пароль на видео-кружке и скрытые пины (Safe Zones) на карте — это не просто фичи, это ритуал посвящения. Это места, где айдол может спрятаться от фанатов и прессы, где можно провести закрытую съемку или встречу без риска утечки.',
  },
  {
    label: 'Акт III',
    title: 'Эстетика молчания',
    body: 'Мы убрали бордовый цвет. Он слишком напоминал о старых ранах и крови индустрии. Наша палитра — это «Тихая Роскошь»:\n\nМатовый черный — фон, скрывающий нас от лишних глаз.\nЭлектрический синий — холодный, как лед, и яркий, как молния. Цвет нового сигнала.\nБелый — цвет правды. В ODI LABS артист владеет 100% своих прав.\n\nКаждый элемент — это ритуал. Загрузка трека — это акт доверия. Заметка в 3 часа ночи — это крик души. А прохождение VIP-верификации — это клятва хранить тишину.',
  },
  {
    label: 'Эпилог',
    title: 'Найди свою тишину',
    body: 'ODI LABS — это дом. Для новичка, который боится показать свое лицо. Для танцора, который ищет безопасную студию. Для айдола, который хочет просто посидеть в тишине без камер.\n\nСмена короны начинается с того момента, когда ты перестаешь играть по чужим правилам и находишь свое место.',
  },
];

const closingQuote = '«This is ODI. Studio without walls. Home for the broken but living.»';
const closingAuthors = 'ODI J; ODI BOBBY; ODI KIR';

export default function AboutPage({ onBack }: AboutPageProps) {
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
