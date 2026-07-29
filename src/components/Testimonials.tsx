"use client";

import SectionHeading from "./SectionHeading";

const testimonials = [
  {
    name: "Анна К.",
    role: "Дизайнер",
    text: "Wardrobe AI полностью изменил мой подход к одежде. Каждое утро экономлю 30 минут!",
    avatar: "А",
  },
  {
    name: "Михаил Р.",
    role: "Предприниматель",
    text: "Никогда не думал, что AI может так хорошо разбираться в стиле. Рекомендации невероятно точные.",
    avatar: "М",
  },
  {
    name: "София Л.",
    role: "Маркетолог",
    text: "Обожаю функцию учёта погоды. Теперь я всегда одета по погоде и при этом стильно.",
    avatar: "С",
  },
  {
    name: "Дмитрий В.",
    role: "Разработчик",
    text: "Для меня, человека далёкого от моды, это приложение — настоящее спасение. Выгляжу на 100%!",
    avatar: "Д",
  },
  {
    name: "Елена П.",
    role: "Стилист",
    text: "Как профессиональный стилист, могу сказать — AI подбирает образы на уровне опытного эксперта.",
    avatar: "Е",
  },
  {
    name: "Артём Н.",
    role: "Фотограф",
    text: "Функция капсульного гардероба помогла сократить гардероб вдвое, но выглядеть стал лучше.",
    avatar: "А",
  },
];

const doubled = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 lg:py-40 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="Отзывы"
          title="Им нравится Wardrobe AI"
          subtitle="Присоединяйтесь к тысячам пользователей, которые уже изменили свой стиль"
        />
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-r from-cream to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-l from-cream to-transparent z-10 pointer-events-none" />

        <div className="marquee-track flex gap-5 sm:gap-6 w-max">
          {doubled.map((t, i) => (
            <div
              key={i}
              className="glass rounded-3xl p-6 sm:p-8 w-[300px] sm:w-[360px] shrink-0 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, si) => (
                  <span key={si} className="text-amber-400 text-sm">
                    ★
                  </span>
                ))}
              </div>

              <p className="text-ink text-sm sm:text-base leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-clay to-clay-dark flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-heading font-semibold text-sm text-ink">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
