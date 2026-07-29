"use client";

import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

const aiCards = [
  { emoji: "☀️", title: "18°", sub: "Идеальная погода", x: -40, y: -20, delay: 0.6 },
  { emoji: "🤖", title: "AI", sub: "Подобрал образ", x: 40, y: 60, delay: 0.8 },
  { emoji: "👕", title: "Белая", sub: "Рубашка", x: -30, y: 140, delay: 1.0 },
  { emoji: "📅", title: "Для", sub: "Встречи", x: 50, y: 220, delay: 1.2 },
];

const stats = [
  { value: "1000+", label: "образов ежедневно" },
  { value: "AI", label: "анализ одежды" },
  { value: "24/7", label: "учитывает погоду" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-28 lg:pt-32 pb-16 overflow-hidden">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left - Text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium text-clay-dark">
                <span className="w-2 h-2 bg-clay rounded-full animate-pulse" />
                Новая эра персонального стиля
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-ink tracking-tight leading-[0.95]"
            >
              Твой личный
              <br />
              <span className="bg-gradient-to-r from-clay-dark via-clay to-clay-light bg-clip-text text-transparent">
                AI-стилист
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 sm:mt-8 text-lg sm:text-xl text-muted leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Искусственный интеллект, который понимает вашу одежду, погоду
              и&nbsp;настроение. Создаёт идеальные образы за&nbsp;секунды.
              Навсегда решите вопрос «что&nbsp;надеть».
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <a
                href="#download"
                className="btn-shine group inline-flex items-center gap-3 px-7 py-4 bg-ink text-cream font-heading font-semibold text-base rounded-2xl hover:shadow-2xl hover:shadow-ink/25 transition-all duration-500 hover:scale-[1.03]"
              >
                Скачать приложение
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#features"
                className="group inline-flex items-center gap-3 px-7 py-4 glass font-heading font-semibold text-base text-ink rounded-2xl hover:shadow-lg transition-all duration-500 hover:scale-[1.03]"
              >
                Узнать больше
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto lg:mx-0"
            >
              {stats.map((s) => (
                <div key={s.value} className="text-center lg:text-left">
                  <div className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-muted">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Phone Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative flex justify-center items-center min-h-[500px] sm:min-h-[600px]"
          >
            {/* Main phone */}
            <div className="float-1 relative z-10">
              <div className="phone-frame w-[220px] sm:w-[260px]">
                <div className="phone-screen aspect-[9/19.5] flex flex-col items-center justify-center p-4">
                  <div className="w-full space-y-3">
                    <div className="h-3 bg-clay/20 rounded-full w-3/4 mx-auto" />
                    <div className="h-3 bg-clay/10 rounded-full w-1/2 mx-auto" />
                    <div className="mt-6 grid grid-cols-2 gap-2">
                      <div className="aspect-square bg-gradient-to-br from-clay/20 to-clay-light/20 rounded-xl" />
                      <div className="aspect-square bg-gradient-to-br from-clay-light/20 to-clay/10 rounded-xl" />
                      <div className="aspect-square bg-gradient-to-br from-clay-dark/15 to-clay/15 rounded-xl" />
                      <div className="aspect-square bg-gradient-to-br from-clay/10 to-clay-light/15 rounded-xl" />
                    </div>
                    <div className="mt-4 h-10 bg-gradient-to-r from-clay to-clay-dark rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Left small phone */}
            <div className="float-2 absolute -left-4 sm:left-0 top-16 z-0 opacity-70">
              <div className="phone-frame w-[140px] sm:w-[170px] rotate-[-8deg]">
                <div className="phone-screen aspect-[9/19.5] flex flex-col items-center justify-center p-3">
                  <div className="space-y-2 w-full">
                    <div className="h-2 bg-clay/15 rounded-full w-2/3 mx-auto" />
                    <div className="h-2 bg-clay/10 rounded-full w-1/2 mx-auto" />
                    <div className="mt-4 space-y-2">
                      <div className="h-8 bg-clay/10 rounded-lg" />
                      <div className="h-8 bg-clay/10 rounded-lg" />
                      <div className="h-8 bg-clay/10 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right small phone */}
            <div className="float-3 absolute -right-4 sm:right-0 top-24 z-0 opacity-70">
              <div className="phone-frame w-[140px] sm:w-[170px] rotate-[8deg]">
                <div className="phone-screen aspect-[9/19.5] flex flex-col items-center justify-center p-3">
                  <div className="space-y-2 w-full">
                    <div className="h-2 bg-clay/15 rounded-full w-2/3 mx-auto" />
                    <div className="mt-3 aspect-[4/3] bg-gradient-to-br from-clay/15 to-clay-light/10 rounded-lg" />
                    <div className="h-6 bg-clay/10 rounded-lg" />
                    <div className="h-6 bg-clay-light/10 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Cards floating around */}
            {aiCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: card.delay,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
                className={`absolute z-20 ${i % 2 === 0 ? "float-2" : "float-3"}`}
                style={{
                  left: i < 2 ? `${card.x}px` : undefined,
                  right: i >= 2 ? `${Math.abs(card.x)}px` : undefined,
                  top: `${card.y}px`,
                }}
              >
                <div className="glass rounded-2xl px-4 py-3 shadow-lg shadow-ink/5 flex items-center gap-3 whitespace-nowrap">
                  <span className="text-xl">{card.emoji}</span>
                  <div>
                    <div className="font-heading font-bold text-sm text-ink">
                      {card.title}
                    </div>
                    <div className="text-xs text-muted">{card.sub}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
