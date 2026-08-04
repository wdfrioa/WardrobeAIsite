"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * При output: 'export' Next.js НЕ подставляет basePath в src изображений
 * автоматически. Прописываем префикс вручную, иначе на GitHub Pages
 * картинка ищется по /logo/... вместо /WardrobeAIsite/logo/...
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "/WardrobeAIsite";

import { useAuth } from "@/lib/AuthProvider";

const navLinks = [
  { label: "Возможности", href: "#features" },
  { label: "Как работает", href: "#how-it-works" },
  { label: "Демо", href: "#ai-demo" },
  { label: "Отзывы", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 100], [0, 0.8]);
  const headerBlur = useTransform(scrollY, [0, 100], [10, 24]);
  const headerPy = useTransform(scrollY, [0, 100], [20, 12]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerBackground = useTransform(
    headerBg,
    (v) => `rgba(248,246,242,${v})`
  );
  const headerBackdrop = useTransform(headerBlur, (v) => `blur(${v}px)`);

  const { user, isPremium, loading } = useAuth();

  /** Инициал для аватара */
  const initial = (user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        paddingTop: headerPy,
        paddingBottom: headerPy,
      }}
    >
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6"
        style={{
          backgroundColor: headerBackground,
          backdropFilter: headerBackdrop,
          WebkitBackdropFilter: headerBackdrop,
          borderRadius: 16,
          border: "1px solid rgba(231,226,218,0.5)",
        }}
      >
        <div className="flex items-center justify-between py-3 px-4 sm:px-6">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <Image
              src={`${BASE}/logo/logo-clay.png`}
              alt="Wardrobe AI"
              width={44}
              height={33}
              priority
              className="transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-heading font-bold text-lg text-ink tracking-tight">
              Wardrobe
              <span className="text-clay ml-0.5">AI</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors duration-300 rounded-lg hover:bg-clay/5 group"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-clay rounded-full transition-all duration-300 group-hover:w-4" />
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              // Пока проверяем сессию — заглушка, чтобы кнопки не «прыгали»
              <div className="w-24 h-10 rounded-xl bg-clay/5 animate-pulse" />
            ) : user ? (
              // ВОШЁЛ — аватар с email вместо кнопки «Войти»
              <Link
                href="/account/"
                className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-xl border border-line hover:bg-clay/5 transition-all duration-300 group"
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-lg bg-clay/15 flex items-center justify-center text-xs font-bold text-clay">
                    {initial}
                  </div>
                  {isPremium ? (
                    <span
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-ink border-2 border-cream"
                      title="Premium"
                    />
                  ) : null}
                </div>

                <span className="text-sm font-medium text-ink max-w-[130px] truncate">
                  {user.email}
                </span>
              </Link>
            ) : (
              // НЕ ВОШЁЛ
              <Link
                href="/account/"
                className="px-5 py-2.5 text-sm font-medium text-ink rounded-xl border border-line hover:bg-clay/5 transition-all duration-300"
              >
                Войти
              </Link>
            )}

            <a
              href="#download"
              className="btn-shine inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream text-sm font-medium rounded-xl hover:bg-ink/90 transition-all duration-300 hover:shadow-lg hover:shadow-ink/20 hover:scale-105"
            >
              Скачать
              <svg
                width="14"
                height="14"
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
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-clay/5 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5">
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block w-5 h-0.5 bg-ink rounded-full origin-center"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block w-5 h-0.5 bg-ink rounded-full"
              />
              <motion.span
                animate={
                  mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }
                }
                className="block w-5 h-0.5 bg-ink rounded-full origin-center"
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={
            mobileOpen
              ? { height: "auto", opacity: 1 }
              : { height: 0, opacity: 0 }
          }
          className="lg:hidden overflow-hidden"
        >
          <nav className="flex flex-col px-4 pb-4 gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-medium text-muted hover:text-ink hover:bg-clay/5 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}

            <a
              href="#download"
              onClick={() => setMobileOpen(false)}
              className="btn-shine mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 bg-ink text-cream text-sm font-medium rounded-xl"
            >
              Скачать приложение
            </a>

            {!loading ? (
              user ? (
                <Link
                  href="/account/"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 flex items-center gap-3 px-4 py-3 rounded-xl border border-line hover:bg-clay/5 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-clay/15 flex items-center justify-center text-xs font-bold text-clay shrink-0">
                    {initial}
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-medium text-ink truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted">
                      {isPremium ? "Premium" : "Личный кабинет"}
                    </p>
                  </div>

                  <span className="text-muted">›</span>
                </Link>
              ) : (
                <Link
                  href="/account/"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-ink rounded-xl border border-line hover:bg-clay/5 transition"
                >
                  Войти
                </Link>
              )
            ) : null}
          </nav>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}
