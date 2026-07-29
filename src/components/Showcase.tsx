"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "./SectionHeading";

const screens = [
  {
    title: "Гардероб",
    items: ["👕 Белая рубашка", "👖 Синие джинсы", "🧥 Бежевый пиджак", "👟 Белые кроссовки"],
    accent: "from-clay/20 to-clay-light/20",
  },
  {
    title: "AI подбор",
    items: ["🌤 Температура: 22°", "📍 Деловая встреча", "💡 Стиль: Smart Casual"],
    accent: "from-sky-400/15 to-blue-500/15",
  },
  {
    title: "Готовый образ",
    items: ["✅ Бежевый пиджак", "✅ Белая рубашка", "✅ Синие джинсы", "✅ Белые кроссовки"],
    accent: "from-emerald-400/15 to-green-500/15",
  },
];

export default function Showcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section className="py-24 sm:py-32 lg:py-40 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="Превью"
          title="Ваш стиль в кармане"
          subtitle="Интуитивный интерфейс, который делает подбор одежды удовольствием"
        />

        <div ref={containerRef} className="flex justify-center">
          <motion.div style={{ y }} className="relative">
            <div className="phone-frame w-[280px] sm:w-[320px]">
              <div className="phone-screen aspect-[9/19.5] overflow-hidden relative">
                {/* Scrolling screens */}
                <motion.div
                  animate={{ y: ["0%", "-66.67%"] }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                  className="flex flex-col"
                >
                  {screens.map((screen, si) => (
                    <div
                      key={si}
                      className="min-h-full p-5 sm:p-6 flex flex-col justify-center"
                      style={{ minHeight: "calc(100%)" }}
                    >
                      {/* Status bar */}
                      <div className="flex justify-between items-center mb-6 text-xs text-muted">
                        <span>9:41</span>
                        <div className="flex gap-1">
                          <div className="w-4 h-2 bg-ink/30 rounded-sm" />
                          <div className="w-3 h-2 bg-ink/20 rounded-sm" />
                        </div>
                      </div>

                      <div className={`rounded-2xl bg-gradient-to-br ${screen.accent} p-4 mb-4`}>
                        <h4 className="font-heading font-bold text-lg text-ink mb-1">
                          {screen.title}
                        </h4>
                        <div className="h-0.5 w-8 bg-clay/30 rounded-full" />
                      </div>

                      <div className="space-y-3">
                        {screen.items.map((item, ii) => (
                          <div
                            key={ii}
                            className="flex items-center gap-3 p-3 bg-white/60 rounded-xl"
                          >
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 h-12 bg-gradient-to-r from-clay to-clay-dark rounded-xl flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          Продолжить
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Glow behind phone */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-br from-clay via-clay-light to-transparent rounded-full scale-150" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
