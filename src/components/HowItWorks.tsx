import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";

const steps = [
  {
    number: "01",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    title: "Сфотографируйте одежду",
    description: "Просто наведите камеру на вещь. AI распознает её автоматически и добавит в ваш цифровой гардероб.",
  },
  {
    number: "02",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" />
        <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
        <path d="M16 16c-2.5 1.5-5.5 1.5-8 0" />
      </svg>
    ),
    title: "AI анализирует",
    description: "Нейросеть определяет категорию, цвет, стиль, сезонность и совместимость с другими вещами.",
  },
  {
    number: "03",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Выберите мероприятие",
    description: "Укажите, куда вы собираетесь — на работу, свидание, прогулку или важную встречу.",
  },
  {
    number: "04",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
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
                  {/* Minimalistic circle instead of emoji square */}
                  <motion.div
                    whileInView={{ scale: [0.5, 1.1, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="absolute left-0 top-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-clay to-clay-dark flex items-center justify-center text-white shadow-lg shadow-clay/20"
                  >
                    {step.icon}
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

