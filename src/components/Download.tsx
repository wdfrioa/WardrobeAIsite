"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import ScrollReveal from "./ScrollReveal";

/**
 * ============================================================
 *  СЕКЦИЯ СКАЧИВАНИЯ
 * ============================================================
 *  Две ветки:
 *   - Android: прямая ссылка на APK
 *   - iOS: переход в веб-версию + подсказка «на рабочий стол»
 * ============================================================
 */

/**
 * Префикс статики: "/WardrobeAIsite" на GitHub Pages, "" на своём сервере.
 * Задаётся переменной NEXT_PUBLIC_BASE_PATH при сборке.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Заменить на реальный файл, когда соберёшь APK. */
const APK_URL = `${BASE}/downloads/wardrobe-ai.apk`;
const APK_VERSION = "1.0.0";
const APK_SIZE = "58 МБ";

export default function Download() {
  const [showIosHint, setShowIosHint] = useState(false);

  return (
    <section id="download" className="relative py-24 md:py-32 overflow-hidden">
      {/* мягкое свечение */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-clay/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-clay-light/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-5">
        <ScrollReveal>
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-clay/10 text-clay-dark text-xs font-semibold tracking-wider">
              ДОСТУПНО ДЛЯ IOS И ANDROID
            </span>

            <h2 className="font-heading text-4xl md:text-5xl font-bold text-ink mt-6 leading-tight">
              Начните одеваться
              <br />
              безупречно
            </h2>

            <p className="text-muted text-lg mt-5 max-w-xl mx-auto leading-relaxed">
              Выберите свою платформу — и забудьте о проблеме выбора одежды
            </p>
          </div>
        </ScrollReveal>

        {/* ---------- ДВЕ КАРТОЧКИ ---------- */}
        <div className="grid md:grid-cols-2 gap-5 mt-14">
          {/* ===== ANDROID ===== */}
          <ScrollReveal delay={0.1}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-3xl border border-line bg-white p-8 flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-clay/10 flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-clay-dark"
                >
                  <path d="M17.523 15.341a.998.998 0 100-1.996.998.998 0 000 1.996m-11.046 0a.998.998 0 100-1.996.998.998 0 000 1.996m11.405-6.02l1.997-3.46a.416.416 0 00-.152-.567.416.416 0 00-.568.152l-2.022 3.503A12.07 12.07 0 0012 7.787c-1.86 0-3.606.418-5.137 1.162L4.841 5.446a.416.416 0 00-.568-.152.416.416 0 00-.152.568l1.997 3.459C2.688 11.117.417 14.494 0 18.514h24c-.417-4.02-2.688-7.397-6.118-9.193" />
                </svg>
              </div>

              <h3 className="font-heading text-2xl font-bold text-ink mt-6">
                Android
              </h3>
              <p className="text-muted mt-2 leading-relaxed">
                Полноценное приложение. Установка из файла — так же, как
                из магазина.
              </p>

              <ul className="mt-6 space-y-2.5 text-sm flex-1">
                {[
                  "Все функции без ограничений",
                  "Работает офлайн с гардеробом",
                  "Камера для съёмки вещей",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="text-clay">✓</span>
                    <span className="text-ink/75">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href={APK_URL}
                download
                className="btn-shine mt-7 w-full py-4 rounded-2xl bg-ink text-cream
                           font-semibold text-center hover:bg-ink/90 transition-all
                           duration-300 hover:shadow-lg hover:shadow-ink/20 block"
              >
                Скачать APK
              </a>

              <p className="text-xs text-muted/70 text-center mt-3">
                Версия {APK_VERSION} · {APK_SIZE}
              </p>
            </motion.div>
          </ScrollReveal>

          {/* ===== iOS ===== */}
          <ScrollReveal delay={0.2}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-3xl border border-line bg-white p-8 flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-clay/10 flex items-center justify-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-clay-dark"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>

              <h3 className="font-heading text-2xl font-bold text-ink mt-6">
                iPhone и iPad
              </h3>
              <p className="text-muted mt-2 leading-relaxed">
                Веб-версия. Работает прямо в браузере, устанавливать
                ничего не нужно.
              </p>

              <ul className="mt-6 space-y-2.5 text-sm flex-1">
                {[
                  "Открывается за секунду",
                  "Можно добавить на рабочий стол",
                  "Обновляется автоматически",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="text-clay">✓</span>
                    <span className="text-ink/75">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/app/"
                className="btn-shine mt-7 w-full py-4 rounded-2xl bg-ink text-cream
                           font-semibold text-center hover:bg-ink/90 transition-all
                           duration-300 hover:shadow-lg hover:shadow-ink/20 block"
              >
                Открыть веб-версию
              </Link>

              <button
                onClick={() => setShowIosHint(!showIosHint)}
                className="text-xs text-clay-dark font-medium text-center mt-3
                           hover:text-clay transition underline underline-offset-4"
              >
                Как добавить на рабочий стол?
              </button>
            </motion.div>
          </ScrollReveal>
        </div>

        {/* ---------- ИНСТРУКЦИЯ ДЛЯ IOS ---------- */}
        <motion.div
          initial={false}
          animate={
            showIosHint
              ? { height: "auto", opacity: 1, marginTop: 20 }
              : { height: 0, opacity: 0, marginTop: 0 }
          }
          className="overflow-hidden"
        >
          <div className="rounded-3xl border border-line bg-cream p-7 md:p-8">
            <h4 className="font-heading font-bold text-ink text-lg">
              Приложение на рабочем столе iPhone
            </h4>
            <p className="text-muted text-sm mt-2 leading-relaxed">
              После этого Wardrobe AI будет открываться как обычное
              приложение — со своей иконкой и без адресной строки браузера.
            </p>

            <ol className="mt-6 space-y-4">
              {[
                {
                  n: "1",
                  t: "Откройте веб-версию в Safari",
                  d: "Именно в Safari — в Chrome на iPhone эта функция недоступна",
                },
                {
                  n: "2",
                  t: "Нажмите кнопку «Поделиться»",
                  d: "Квадрат со стрелкой вверх — внизу экрана по центру",
                },
                {
                  n: "3",
                  t: "Выберите «На экран “Домой”»",
                  d: "Нужно немного прокрутить список вниз",
                },
                {
                  n: "4",
                  t: "Нажмите «Добавить»",
                  d: "Иконка появится на рабочем столе среди других приложений",
                },
              ].map((step) => (
                <li key={step.n} className="flex gap-4">
                  <span
                    className="shrink-0 w-7 h-7 rounded-lg bg-clay text-white
                               text-sm font-bold flex items-center justify-center"
                  >
                    {step.n}
                  </span>
                  <div>
                    <p className="font-medium text-ink text-sm">{step.t}</p>
                    <p className="text-muted text-xs mt-1 leading-relaxed">
                      {step.d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 pt-5 border-t border-line">
              <p className="text-xs text-muted leading-relaxed">
                <span className="font-semibold text-ink">На Android</span> это
                тоже работает: откройте веб-версию в Chrome, нажмите на три
                точки в углу и выберите «Установить приложение».
              </p>
            </div>
          </div>
        </motion.div>

        {/* ---------- СНОСКА ---------- */}
        <ScrollReveal delay={0.3}>
          <p className="text-center text-sm text-muted/80 mt-10 max-w-lg mx-auto leading-relaxed">
            Приложение бесплатное. Premium-функции — по подписке,
            оформляется в личном кабинете.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
