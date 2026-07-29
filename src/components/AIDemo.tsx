"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";

const userMessage = "Иду на свидание 💕";
const aiResponse = "Отличный повод выглядеть неотразимо! Вот что я подобрал:";

const outfitCards = [
  { emoji: "🧥", name: "Бежевый пиджак", style: "Casual Elegance" },
  { emoji: "👔", name: "Белая рубашка", style: "Slim Fit" },
  { emoji: "👖", name: "Тёмные брюки", style: "Chinos" },
  { emoji: "👞", name: "Коричневые лоферы", style: "Leather" },
];

export default function AIDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStep(1), 500));
    timers.push(setTimeout(() => setStep(2), 1500));
    timers.push(setTimeout(() => setStep(3), 2500));
    timers.push(setTimeout(() => setStep(4), 3200));
    timers.push(setTimeout(() => setStep(5), 3800));
    timers.push(setTimeout(() => setStep(6), 4400));
    timers.push(setTimeout(() => setStep(7), 5000));
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <section id="ai-demo" className="py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="AI в действии"
          title="Попробуйте прямо сейчас"
          subtitle="Напишите куда собираетесь — AI подберёт идеальный образ"
        />

        <ScrollReveal>
          <div
            ref={ref}
            className="max-w-4xl mx-auto glass rounded-3xl sm:rounded-[2rem] p-6 sm:p-10 lg:p-12"
          >
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left — User */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-clay to-clay-dark flex items-center justify-center text-white text-sm font-bold">
                    Вы
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-sm text-ink">
                      Вы
                    </div>
                    <div className="text-xs text-muted">только что</div>
                  </div>
                </div>

                {step >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-ink text-cream rounded-2xl rounded-tl-md px-5 py-4"
                  >
                    <p className="text-base">{userMessage}</p>
                  </motion.div>
                )}

                {step >= 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center gap-2 text-sm text-muted"
                  >
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      AI анализирует ваш гардероб...
                    </motion.span>
                  </motion.div>
                )}
              </div>

              {/* Right — AI Response */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-clay-light to-clay flex items-center justify-center text-lg">
                    🤖
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-sm text-ink">
                      Wardrobe AI
                    </div>
                    <div className="text-xs text-muted">ответил мгновенно</div>
                  </div>
                </div>

                {step >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-cream/80 border border-line rounded-2xl rounded-tl-md px-5 py-4 mb-4"
                  >
                    <p className="text-sm text-ink">{aiResponse}</p>
                  </motion.div>
                )}

                <div className="space-y-3">
                  {outfitCards.map((card, i) => {
                    const cardStep = 4 + i;
                    if (step < cardStep) return null;
                    return (
                      <motion.div
                        key={card.name}
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{
                          duration: 0.4,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="flex items-center gap-4 p-4 glass rounded-2xl hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cream to-line flex items-center justify-center text-2xl shrink-0">
                          {card.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="font-heading font-semibold text-sm text-ink truncate">
                            {card.name}
                          </div>
                          <div className="text-xs text-muted">{card.style}</div>
                        </div>
                        <div className="ml-auto">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
