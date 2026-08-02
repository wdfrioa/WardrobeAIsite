"use client";

import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import Link from "next/link";

<Link href="/premium/">Получить Premium</Link>
export default function FinalCTA() {
  return (
    <section id="download" className="py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-ink p-10 sm:p-16 lg:p-24 text-center">
            {/* Glow effects */}
            <div className="absolute top-[-50%] left-[20%] w-[400px] h-[400px] rounded-full bg-clay/20 blur-[100px] glow-animate" />
            <div
              className="absolute bottom-[-50%] right-[20%] w-[500px] h-[500px] rounded-full bg-clay-dark/15 blur-[120px] glow-animate"
              style={{ animationDelay: "2s" }}
            />

            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 glass-dark rounded-full text-sm font-medium text-clay-light mb-8"
              >
                <span className="w-2 h-2 bg-clay rounded-full animate-pulse" />
                Доступно для iOS и Android
              </motion.div>

              <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-cream tracking-tight leading-tight max-w-3xl mx-auto">
                Начните одеваться
                <br />
                <span className="bg-gradient-to-r from-clay-light via-clay to-clay-dark bg-clip-text text-transparent">
                  безупречно
                </span>
              </h2>

              <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-cream/60 max-w-xl mx-auto leading-relaxed">
                Скачайте Wardrobe AI и&nbsp;забудьте о&nbsp;проблеме выбора
                одежды навсегда
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="mt-10 sm:mt-12 inline-block"
              >
                <a
                  href="#"
                  className="btn-shine group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-clay to-clay-dark text-cream font-heading font-bold text-lg rounded-2xl shadow-2xl shadow-clay/30 hover:shadow-clay/50 transition-shadow duration-500"
                >
                  Скачать бесплатно
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
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
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
