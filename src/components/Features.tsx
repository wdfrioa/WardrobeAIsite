"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";

const features = [
  {
    icon: "🔍",
    title: "AI анализ одежды",
    description: "Сфотографируйте вещь — AI определит категорию, цвет, стиль и сезонность за секунды",
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    icon: "🌤",
    title: "Учёт погоды",
    description: "Приложение автоматически учитывает прогноз погоды при подборе образа на каждый день",
    gradient: "from-sky-500/10 to-blue-500/10",
  },
  {
    icon: "🎯",
    title: "Учёт события",
    description: "Деловая встреча, свидание или прогулка — AI подберёт идеальный образ для любого случая",
    gradient: "from-violet-500/10 to-purple-500/10",
  },
  {
    icon: "📋",
    title: "История образов",
    description: "Все ваши образы сохраняются. Никогда не повторяйтесь и отслеживайте свой стиль",
    gradient: "from-emerald-500/10 to-green-500/10",
  },
  {
    icon: "👗",
    title: "Гардероб",
    description: "Полная цифровая копия вашего гардероба. Все вещи организованы и всегда под рукой",
    gradient: "from-rose-500/10 to-pink-500/10",
  },
  {
    icon: "✨",
    title: "AI рекомендации",
    description: "Персональные рекомендации по покупке недостающих вещей для идеального гардероба",
    gradient: "from-yellow-500/10 to-amber-500/10",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="Возможности"
          title="Всё, что нужно вашему стилю"
          subtitle="Шесть мощных инструментов, которые превращают хаос в гардеробе в систему"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative glass rounded-3xl p-7 sm:p-8 h-full cursor-default overflow-hidden"
              >
                {/* Hover glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
                />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cream to-line flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-500">
                    {f.icon}
                  </div>
                  <h3 className="font-heading font-bold text-xl text-ink mb-3">
                    {f.title}
                  </h3>
                  <p className="text-muted leading-relaxed text-sm sm:text-base">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
