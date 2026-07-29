"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";

const faqs = [
  {
    q: "Как Wardrobe AI анализирует мою одежду?",
    a: "Вы просто фотографируете вещь, а наша нейросеть автоматически определяет категорию, цвет, стиль, материал и сезонность. Весь процесс занимает несколько секунд.",
  },
  {
    q: "Нужен ли интернет для работы?",
    a: "Для анализа новых вещей и получения рекомендаций нужен интернет. Но ваш гардероб и сохранённые образы доступны оффлайн.",
  },
  {
    q: "Приложение бесплатное?",
    a: "Базовые функции доступны бесплатно. Для продвинутого AI-подбора, капсульных гардеробов и неограниченного количества образов доступна премиум-подписка.",
  },
  {
    q: "На каких устройствах работает?",
    a: "Wardrobe AI доступен для iOS и Android. Мы также работаем над веб-версией для десктопа.",
  },
  {
    q: "Насколько точны рекомендации AI?",
    a: "Наш AI обучен на миллионах образов и учитывает последние тенденции моды. Точность рекомендаций составляет более 95%, и она постоянно улучшается.",
  },
  {
    q: "Мои данные в безопасности?",
    a: "Абсолютно. Все фотографии хранятся в зашифрованном виде. Мы не делимся вашими данными с третьими лицами и соблюдаем GDPR.",
  },
];

function FAQItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <motion.div
      className="glass rounded-2xl sm:rounded-3xl overflow-hidden"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 p-6 sm:p-8 text-left"
      >
        <span className="font-heading font-semibold text-base sm:text-lg text-ink pr-4">
          {q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cream flex items-center justify-center shrink-0"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-ink"
          >
            <path
              d="M8 1v14M1 8h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              <p className="text-muted leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          badge="FAQ"
          title="Частые вопросы"
          subtitle="Всё, что вы хотели знать о Wardrobe AI"
        />

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <FAQItem
                q={faq.q}
                a={faq.a}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
