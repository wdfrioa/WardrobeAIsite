"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";

const steps = [
  {
    number: "01",
    emoji: "📸",
    title: "Сфотографируйте одежду",
    description: "Просто наведите камеру на вещь. AI распознает её автоматически и добавит в ваш цифровой гардероб.",
  },
  {
    number: "02",
    emoji: "🧠",
    title: "AI анализирует",
    description: "Нейросеть определяет категорию, цвет, стиль, сезонность и совместимость с другими вещами.",
  },
  {
    number: "03",
    emoji: "🎯",
    title: "Выберите мероприятие",
    description: "Укажите, куда вы собираетесь — на работу, свидание, прогулку или важную встречу.",
  },
  {
    number: "04",
    emoji: "✨",
    title: "Получите готовый образ",
    description: "AI создаёт идеальный look из вашего гардероба с учётом погоды, события и вашего стиля.",
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.5"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          badge="Как это работает"
          title="Четыре простых шага"
          subtitle="От фотографии до идеального образа — всего за минуту"
        />

        <div ref={containerRef} className="relative max-w-2xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-line">
            <motion.div
              className="w-full timeline-line-bg rounded-full origin-top"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="space-y-12 sm:space-y-16">
            {steps.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 0.15}>
                <div className="relative pl-16 sm:pl-20">
                  {/* Step circle */}
                  <motion.div
                    whileInView={{ scale: [0.5, 1.1, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="absolute left-0 top-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-clay to-clay-dark flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-clay/20"
                  >
                    {step.emoji}
                  </motion.div>

                  <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                    <span className="text-xs font-heading font-bold text-clay tracking-widest uppercase">
                      Шаг {step.number}
                    </span>
                    <h3 className="mt-2 font-heading font-bold text-xl sm:text-2xl text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
