#!/usr/bin/env node

// =============================================
// Wardrobe AI — Setup Script (Node.js)
// Работает на Windows, Mac, Linux
// Запуск: node setup.js
// =============================================

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PROJECT = path.join(process.env.HOME || process.env.USERPROFILE, "Desktop", "wardrobe-ai-landing");

function log(msg) { console.log(`\x1b[36m${msg}\x1b[0m`); }
function ok(msg) { console.log(`\x1b[32m  ✓ ${msg}\x1b[0m`); }

function writeFile(rel, content) {
  const full = path.join(PROJECT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
}

// =============================================
log("\n══════════════════════════════════════");
log("  WARDROBE AI — Установка");
log("══════════════════════════════════════\n");

// Check Node
try {
  const v = execSync("node --version", { encoding: "utf8" }).trim();
  ok("Node.js " + v);
} catch {
  console.error("Node.js не установлен! https://nodejs.org");
  process.exit(1);
}

// Create project
log("\n[1/4] Создаю проект...");
if (fs.existsSync(PROJECT)) fs.rmSync(PROJECT, { recursive: true, force: true });
fs.mkdirSync(path.join(PROJECT, "src", "app"), { recursive: true });
fs.mkdirSync(path.join(PROJECT, "src", "components"), { recursive: true });
ok("Папка создана: " + PROJECT);

// =============================================
log("\n[2/4] Записываю файлы...");

// --- package.json ---
writeFile("package.json", JSON.stringify({
  name: "wardrobe-ai-landing",
  private: true,
  scripts: { dev: "next dev", build: "next build", start: "next start" }
}, null, 2));

// --- tsconfig.json ---
writeFile("tsconfig.json", JSON.stringify({
  compilerOptions: {
    target: "ES2017", lib: ["dom", "dom.iterable", "esnext"],
    allowJs: false, skipLibCheck: true, strict: true, noEmit: true,
    esModuleInterop: true, module: "esnext", moduleResolution: "bundler",
    resolveJsonModule: true, isolatedModules: true, jsx: "preserve",
    incremental: true, baseUrl: ".",
    paths: { "@/*": ["./src/*"] },
    plugins: [{ name: "next" }]
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  exclude: ["node_modules"]
}, null, 2));

// --- next.config.js ---
writeFile("next.config.js", `/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
`);

// --- postcss.config.js ---
writeFile("postcss.config.js", `module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
`);

// --- tailwind.config.js ---
writeFile("tailwind.config.js", `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F6F2",
        clay: { DEFAULT: "#B1886A", dark: "#8F6A4F", light: "#C9A68C" },
        ink: "#111827",
        muted: "#6B7280",
        line: "#E7E2DA",
      },
      fontFamily: {
        heading: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
`);

// --- .gitignore ---
writeFile(".gitignore", `node_modules
.next
out
build
.DS_Store
*.tsbuildinfo
next-env.d.ts
`);

// --- globals.css ---
writeFile("src/app/globals.css", `@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; background-color: #F8F6F2; color: #111827; overflow-x: hidden; }
  ::selection { background-color: #B1886A; color: white; }
}

.grain::before {
  content: ''; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none; z-index: 1;
}

.grid-bg {
  background-image: linear-gradient(rgba(177,136,106,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(177,136,106,0.05) 1px, transparent 1px);
  background-size: 60px 60px;
}

.glass { background: rgba(248,246,242,0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(231,226,218,0.6); }
.glass-dark { background: rgba(17,24,39,0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }

@keyframes shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
.btn-shine { position: relative; overflow: hidden; }
.btn-shine::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); animation: shine 3s ease-in-out infinite; }

@keyframes float1 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(1deg); } }
@keyframes float2 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-1deg); } }
@keyframes float3 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-25px) rotate(2deg); } }
.float-1 { animation: float1 6s ease-in-out infinite; }
.float-2 { animation: float2 8s ease-in-out infinite; }
.float-3 { animation: float3 7s ease-in-out infinite; }

@keyframes glow-pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
.glow-animate { animation: glow-pulse 4s ease-in-out infinite; }

.phone-frame { background: linear-gradient(145deg, #1a1a2e, #16213e); border-radius: 40px; padding: 8px; box-shadow: 0 25px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1); }
.phone-screen { border-radius: 32px; overflow: hidden; background: linear-gradient(180deg, #f8f6f2, #e8e4dc); }
.timeline-line-bg { background: linear-gradient(180deg, #B1886A, #C9A68C); }

@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.marquee-track { animation: marquee 30s linear infinite; }
.marquee-track:hover { animation-play-state: paused; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #F8F6F2; }
::-webkit-scrollbar-thumb { background: #C9A68C; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #B1886A; }
`);

// --- layout.tsx ---
writeFile("src/app/layout.tsx", `import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wardrobe AI \\u2014 \\u0422\\u0432\\u043E\\u0439 \\u043B\\u0438\\u0447\\u043D\\u044B\\u0439 AI-\\u0441\\u0442\\u0438\\u043B\\u0438\\u0441\\u0442",
  description: "Wardrobe AI \\u2014 \\u043C\\u043E\\u0431\\u0438\\u043B\\u044C\\u043D\\u043E\\u0435 \\u043F\\u0440\\u0438\\u043B\\u043E\\u0436\\u0435\\u043D\\u0438\\u0435 \\u0441 AI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
`);

// --- page.tsx ---
writeFile("src/app/page.tsx", `import Background from "@/components/Background";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Showcase from "@/components/Showcase";
import AIDemo from "@/components/AIDemo";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Background />
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Showcase />
        <AIDemo />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
`);

// --- Background.tsx ---
writeFile("src/components/Background.tsx", `"use client";

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 grid-bg grain">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full glow-animate" style={{ background: "radial-gradient(circle, rgba(177,136,106,0.15) 0%, transparent 70%)" }} />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full glow-animate" style={{ background: "radial-gradient(circle, rgba(201,166,140,0.12) 0%, transparent 70%)", animationDelay: "2s" }} />
      <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] rounded-full glow-animate" style={{ background: "radial-gradient(circle, rgba(143,106,79,0.1) 0%, transparent 70%)", animationDelay: "4s" }} />
    </div>
  );
}
`);

// --- ScrollReveal.tsx ---
writeFile("src/components/ScrollReveal.tsx", `"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props { children: ReactNode; className?: string; delay?: number; }

export default function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >{children}</motion.div>
  );
}
`);

// --- SectionHeading.tsx ---
writeFile("src/components/SectionHeading.tsx", `"use client";
import ScrollReveal from "./ScrollReveal";

interface Props { badge?: string; title: string; subtitle?: string; }

export default function SectionHeading({ badge, title, subtitle }: Props) {
  return (
    <div className="text-center mb-16 sm:mb-20">
      {badge && (
        <ScrollReveal>
          <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium text-clay-dark mb-6">
            <span className="w-1.5 h-1.5 bg-clay rounded-full" />{badge}
          </span>
        </ScrollReveal>
      )}
      <ScrollReveal delay={0.1}>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-ink tracking-tight leading-tight">{title}</h2>
      </ScrollReveal>
      {subtitle && (
        <ScrollReveal delay={0.2}>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
        </ScrollReveal>
      )}
    </div>
  );
}
`);

// --- Header.tsx ---
writeFile("src/components/Header.tsx", `"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";

const navLinks = [
  { label: "\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438", href: "#features" },
  { label: "\u041A\u0430\u043A \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442", href: "#how-it-works" },
  { label: "\u0414\u0435\u043C\u043E", href: "#ai-demo" },
  { label: "\u041E\u0442\u0437\u044B\u0432\u044B", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 100], [0, 0.8]);
  const headerBlur = useTransform(scrollY, [0, 100], [10, 24]);
  const headerPy = useTransform(scrollY, [0, 100], [20, 12]);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header className="fixed top-0 left-0 right-0 z-50" style={{ paddingTop: headerPy, paddingBottom: headerPy }}>
      <motion.div className="mx-auto max-w-7xl px-4 sm:px-6" style={{
        backgroundColor: useTransform(headerBg, (v) => \`rgba(248,246,242,\${v})\`),
        backdropFilter: useTransform(headerBlur, (v) => \`blur(\${v}px)\`),
        WebkitBackdropFilter: useTransform(headerBlur, (v) => \`blur(\${v}px)\`),
        borderRadius: 16, border: "1px solid rgba(231,226,218,0.5)",
      }}>
        <div className="flex items-center justify-between py-3 px-4 sm:px-6">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-clay to-clay-dark flex items-center justify-center">
              <span className="text-white text-sm font-bold font-heading">W</span>
            </div>
            <span className="font-heading font-bold text-lg text-ink tracking-tight">Wardrobe<span className="text-clay ml-0.5">AI</span></span>
          </a>
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="relative px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors duration-300 rounded-lg hover:bg-clay/5 group">
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-clay rounded-full transition-all duration-300 group-hover:w-4" />
              </a>
            ))}
          </nav>
          <div className="hidden lg:block">
            <a href="#download" className="btn-shine inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream text-sm font-medium rounded-xl hover:bg-ink/90 transition-all duration-300 hover:shadow-lg hover:shadow-ink/20 hover:scale-105">
              \u0421\u043A\u0430\u0447\u0430\u0442\u044C
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-clay/5 transition-colors" aria-label="Menu">
            <div className="flex flex-col gap-1.5">
              <motion.span animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block w-5 h-0.5 bg-ink rounded-full origin-center" />
              <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} className="block w-5 h-0.5 bg-ink rounded-full" />
              <motion.span animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block w-5 h-0.5 bg-ink rounded-full origin-center" />
            </div>
          </button>
        </div>
        <motion.div initial={false} animate={mobileOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }} className="lg:hidden overflow-hidden">
          <nav className="flex flex-col px-4 pb-4 gap-1">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="px-4 py-3 text-sm font-medium text-muted hover:text-ink hover:bg-clay/5 rounded-xl transition-colors">{link.label}</a>
            ))}
            <a href="#download" onClick={() => setMobileOpen(false)} className="btn-shine mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 bg-ink text-cream text-sm font-medium rounded-xl">\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435</a>
          </nav>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}
`);

// --- Hero.tsx ---
writeFile("src/components/Hero.tsx", `"use client";
import { motion } from "framer-motion";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const } },
};

const aiCards = [
  { emoji: "\\u2600\\uFE0F", title: "18\\u00B0", sub: "\\u0418\\u0434\\u0435\\u0430\\u043B\\u044C\\u043D\\u0430\\u044F \\u043F\\u043E\\u0433\\u043E\\u0434\\u0430", x: -40, y: -20, delay: 0.6 },
  { emoji: "\\uD83E\\uDD16", title: "AI", sub: "\\u041F\\u043E\\u0434\\u043E\\u0431\\u0440\\u0430\\u043B \\u043E\\u0431\\u0440\\u0430\\u0437", x: 40, y: 60, delay: 0.8 },
  { emoji: "\\uD83D\\uDC55", title: "\\u0411\\u0435\\u043B\\u0430\\u044F", sub: "\\u0420\\u0443\\u0431\\u0430\\u0448\\u043A\\u0430", x: -30, y: 140, delay: 1.0 },
  { emoji: "\\uD83D\\uDCC5", title: "\\u0414\\u043B\\u044F", sub: "\\u0412\\u0441\\u0442\\u0440\\u0435\\u0447\\u0438", x: 50, y: 220, delay: 1.2 },
];

const stats = [
  { value: "1000+", label: "\\u043E\\u0431\\u0440\\u0430\\u0437\\u043E\\u0432 \\u0435\\u0436\\u0435\\u0434\\u043D\\u0435\\u0432\\u043D\\u043E" },
  { value: "AI", label: "\\u0430\\u043D\\u0430\\u043B\\u0438\\u0437 \\u043E\\u0434\\u0435\\u0436\\u0434\\u044B" },
  { value: "24/7", label: "\\u0443\\u0447\\u0438\\u0442\\u044B\\u0432\\u0430\\u0435\\u0442 \\u043F\\u043E\\u0433\\u043E\\u0434\\u0443" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-28 lg:pt-32 pb-16 overflow-hidden">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="text-center lg:text-left">
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium text-clay-dark">
                <span className="w-2 h-2 bg-clay rounded-full animate-pulse" />
                \\u041D\\u043E\\u0432\\u0430\\u044F \\u044D\\u0440\\u0430 \\u043F\\u0435\\u0440\\u0441\\u043E\\u043D\\u0430\\u043B\\u044C\\u043D\\u043E\\u0433\\u043E \\u0441\\u0442\\u0438\\u043B\\u044F
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-ink tracking-tight leading-[0.95]">
              \\u0422\\u0432\\u043E\\u0439 \\u043B\\u0438\\u0447\\u043D\\u044B\\u0439<br />
              <span className="bg-gradient-to-r from-clay-dark via-clay to-clay-light bg-clip-text text-transparent">AI-\\u0441\\u0442\\u0438\\u043B\\u0438\\u0441\\u0442</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 sm:mt-8 text-lg sm:text-xl text-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
              \\u0418\\u0441\\u043A\\u0443\\u0441\\u0441\\u0442\\u0432\\u0435\\u043D\\u043D\\u044B\\u0439 \\u0438\\u043D\\u0442\\u0435\\u043B\\u043B\\u0435\\u043A\\u0442, \\u043A\\u043E\\u0442\\u043E\\u0440\\u044B\\u0439 \\u043F\\u043E\\u043D\\u0438\\u043C\\u0430\\u0435\\u0442 \\u0432\\u0430\\u0448\\u0443 \\u043E\\u0434\\u0435\\u0436\\u0434\\u0443, \\u043F\\u043E\\u0433\\u043E\\u0434\\u0443 \\u0438&nbsp;\\u043D\\u0430\\u0441\\u0442\\u0440\\u043E\\u0435\\u043D\\u0438\\u0435. \\u0421\\u043E\\u0437\\u0434\\u0430\\u0451\\u0442 \\u0438\\u0434\\u0435\\u0430\\u043B\\u044C\\u043D\\u044B\\u0435 \\u043E\\u0431\\u0440\\u0430\\u0437\\u044B \\u0437\\u0430&nbsp;\\u0441\\u0435\\u043A\\u0443\\u043D\\u0434\\u044B.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <a href="#download" className="btn-shine group inline-flex items-center gap-3 px-7 py-4 bg-ink text-cream font-heading font-semibold text-base rounded-2xl hover:shadow-2xl hover:shadow-ink/25 transition-all duration-500 hover:scale-[1.03]">
                \\u0421\\u043A\\u0430\\u0447\\u0430\\u0442\\u044C \\u043F\\u0440\\u0438\\u043B\\u043E\\u0436\\u0435\\u043D\\u0438\\u0435
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
              <a href="#features" className="group inline-flex items-center gap-3 px-7 py-4 glass font-heading font-semibold text-base text-ink rounded-2xl hover:shadow-lg transition-all duration-500 hover:scale-[1.03]">
                \\u0423\\u0437\\u043D\\u0430\\u0442\\u044C \\u0431\\u043E\\u043B\\u044C\\u0448\\u0435
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </a>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto lg:mx-0">
              {stats.map((s) => (
                <div key={s.value} className="text-center lg:text-left">
                  <div className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">{s.value}</div>
                  <div className="mt-1 text-xs sm:text-sm text-muted">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }} className="relative flex justify-center items-center min-h-[500px] sm:min-h-[600px]">
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
            <div className="float-2 absolute -left-4 sm:left-0 top-16 z-0 opacity-70">
              <div className="phone-frame w-[140px] sm:w-[170px] rotate-[-8deg]">
                <div className="phone-screen aspect-[9/19.5] flex flex-col items-center justify-center p-3">
                  <div className="space-y-2 w-full">
                    <div className="h-2 bg-clay/15 rounded-full w-2/3 mx-auto" />
                    <div className="h-2 bg-clay/10 rounded-full w-1/2 mx-auto" />
                    <div className="mt-4 space-y-2"><div className="h-8 bg-clay/10 rounded-lg" /><div className="h-8 bg-clay/10 rounded-lg" /><div className="h-8 bg-clay/10 rounded-lg" /></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="float-3 absolute -right-4 sm:right-0 top-24 z-0 opacity-70">
              <div className="phone-frame w-[140px] sm:w-[170px] rotate-[8deg]">
                <div className="phone-screen aspect-[9/19.5] flex flex-col items-center justify-center p-3">
                  <div className="space-y-2 w-full">
                    <div className="h-2 bg-clay/15 rounded-full w-2/3 mx-auto" />
                    <div className="mt-3 aspect-[4/3] bg-gradient-to-br from-clay/15 to-clay-light/10 rounded-lg" />
                    <div className="h-6 bg-clay/10 rounded-lg" /><div className="h-6 bg-clay-light/10 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
            {aiCards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: card.delay, ease: [0.25, 0.4, 0.25, 1] }}
                className={\`absolute z-20 \${i % 2 === 0 ? "float-2" : "float-3"}\`}
                style={{ left: i < 2 ? \`\${card.x}px\` : undefined, right: i >= 2 ? \`\${Math.abs(card.x)}px\` : undefined, top: \`\${card.y}px\` }}>
                <div className="glass rounded-2xl px-4 py-3 shadow-lg shadow-ink/5 flex items-center gap-3 whitespace-nowrap">
                  <span className="text-xl">{card.emoji}</span>
                  <div><div className="font-heading font-bold text-sm text-ink">{card.title}</div><div className="text-xs text-muted">{card.sub}</div></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
`);

// --- Features.tsx ---
writeFile("src/components/Features.tsx", `"use client";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";

const features = [
  { icon: "\\uD83D\\uDD0D", title: "AI \\u0430\\u043D\\u0430\\u043B\\u0438\\u0437 \\u043E\\u0434\\u0435\\u0436\\u0434\\u044B", description: "\\u0421\\u0444\\u043E\\u0442\\u043E\\u0433\\u0440\\u0430\\u0444\\u0438\\u0440\\u0443\\u0439\\u0442\\u0435 \\u0432\\u0435\\u0449\\u044C \\u2014 AI \\u043E\\u043F\\u0440\\u0435\\u0434\\u0435\\u043B\\u0438\\u0442 \\u043A\\u0430\\u0442\\u0435\\u0433\\u043E\\u0440\\u0438\\u044E, \\u0446\\u0432\\u0435\\u0442, \\u0441\\u0442\\u0438\\u043B\\u044C \\u0438 \\u0441\\u0435\\u0437\\u043E\\u043D\\u043D\\u043E\\u0441\\u0442\\u044C \\u0437\\u0430 \\u0441\\u0435\\u043A\\u0443\\u043D\\u0434\\u044B", gradient: "from-amber-500/10 to-orange-500/10" },
  { icon: "\\uD83C\\uDF24", title: "\\u0423\\u0447\\u0451\\u0442 \\u043F\\u043E\\u0433\\u043E\\u0434\\u044B", description: "\\u041F\\u0440\\u0438\\u043B\\u043E\\u0436\\u0435\\u043D\\u0438\\u0435 \\u0430\\u0432\\u0442\\u043E\\u043C\\u0430\\u0442\\u0438\\u0447\\u0435\\u0441\\u043A\\u0438 \\u0443\\u0447\\u0438\\u0442\\u044B\\u0432\\u0430\\u0435\\u0442 \\u043F\\u0440\\u043E\\u0433\\u043D\\u043E\\u0437 \\u043F\\u043E\\u0433\\u043E\\u0434\\u044B \\u043F\\u0440\\u0438 \\u043F\\u043E\\u0434\\u0431\\u043E\\u0440\\u0435 \\u043E\\u0431\\u0440\\u0430\\u0437\\u0430", gradient: "from-sky-500/10 to-blue-500/10" },
  { icon: "\\uD83C\\uDFAF", title: "\\u0423\\u0447\\u0451\\u0442 \\u0441\\u043E\\u0431\\u044B\\u0442\\u0438\\u044F", description: "\\u0414\\u0435\\u043B\\u043E\\u0432\\u0430\\u044F \\u0432\\u0441\\u0442\\u0440\\u0435\\u0447\\u0430, \\u0441\\u0432\\u0438\\u0434\\u0430\\u043D\\u0438\\u0435 \\u0438\\u043B\\u0438 \\u043F\\u0440\\u043E\\u0433\\u0443\\u043B\\u043A\\u0430 \\u2014 AI \\u043F\\u043E\\u0434\\u0431\\u0435\\u0440\\u0451\\u0442 \\u0438\\u0434\\u0435\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u043E\\u0431\\u0440\\u0430\\u0437", gradient: "from-violet-500/10 to-purple-500/10" },
  { icon: "\\uD83D\\uDCCB", title: "\\u0418\\u0441\\u0442\\u043E\\u0440\\u0438\\u044F \\u043E\\u0431\\u0440\\u0430\\u0437\\u043E\\u0432", description: "\\u0412\\u0441\\u0435 \\u0432\\u0430\\u0448\\u0438 \\u043E\\u0431\\u0440\\u0430\\u0437\\u044B \\u0441\\u043E\\u0445\\u0440\\u0430\\u043D\\u044F\\u044E\\u0442\\u0441\\u044F. \\u041D\\u0438\\u043A\\u043E\\u0433\\u0434\\u0430 \\u043D\\u0435 \\u043F\\u043E\\u0432\\u0442\\u043E\\u0440\\u044F\\u0439\\u0442\\u0435\\u0441\\u044C", gradient: "from-emerald-500/10 to-green-500/10" },
  { icon: "\\uD83D\\uDC57", title: "\\u0413\\u0430\\u0440\\u0434\\u0435\\u0440\\u043E\\u0431", description: "\\u041F\\u043E\\u043B\\u043D\\u0430\\u044F \\u0446\\u0438\\u0444\\u0440\\u043E\\u0432\\u0430\\u044F \\u043A\\u043E\\u043F\\u0438\\u044F \\u0432\\u0430\\u0448\\u0435\\u0433\\u043E \\u0433\\u0430\\u0440\\u0434\\u0435\\u0440\\u043E\\u0431\\u0430. \\u0412\\u0441\\u0435 \\u0432\\u0435\\u0449\\u0438 \\u043E\\u0440\\u0433\\u0430\\u043D\\u0438\\u0437\\u043E\\u0432\\u0430\\u043D\\u044B", gradient: "from-rose-500/10 to-pink-500/10" },
  { icon: "\\u2728", title: "AI \\u0440\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0430\\u0446\\u0438\\u0438", description: "\\u041F\\u0435\\u0440\\u0441\\u043E\\u043D\\u0430\\u043B\\u044C\\u043D\\u044B\\u0435 \\u0440\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0430\\u0446\\u0438\\u0438 \\u043F\\u043E \\u043F\\u043E\\u043A\\u0443\\u043F\\u043A\\u0435 \\u043D\\u0435\\u0434\\u043E\\u0441\\u0442\\u0430\\u044E\\u0449\\u0438\\u0445 \\u0432\\u0435\\u0449\\u0435\\u0439", gradient: "from-yellow-500/10 to-amber-500/10" },
];

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading badge="\\u0412\\u043E\\u0437\\u043C\\u043E\\u0436\\u043D\\u043E\\u0441\\u0442\\u0438" title="\\u0412\\u0441\\u0451, \\u0447\\u0442\\u043E \\u043D\\u0443\\u0436\\u043D\\u043E \\u0432\\u0430\\u0448\\u0435\\u043C\\u0443 \\u0441\\u0442\\u0438\\u043B\\u044E" subtitle="\\u0428\\u0435\\u0441\\u0442\\u044C \\u043C\\u043E\\u0449\\u043D\\u044B\\u0445 \\u0438\\u043D\\u0441\\u0442\\u0440\\u0443\\u043C\\u0435\\u043D\\u0442\\u043E\\u0432" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.1}>
              <motion.div whileHover={{ y: -6, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="group relative glass rounded-3xl p-7 sm:p-8 h-full cursor-default overflow-hidden">
                <div className={\`absolute inset-0 bg-gradient-to-br \${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl\`} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cream to-line flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
                  <h3 className="font-heading font-bold text-xl text-ink mb-3">{f.title}</h3>
                  <p className="text-muted leading-relaxed text-sm sm:text-base">{f.description}</p>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
`);

// --- HowItWorks.tsx ---
writeFile("src/components/HowItWorks.tsx", `"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";

const steps = [
  { number: "01", emoji: "\\uD83D\\uDCF8", title: "\\u0421\\u0444\\u043E\\u0442\\u043E\\u0433\\u0440\\u0430\\u0444\\u0438\\u0440\\u0443\\u0439\\u0442\\u0435 \\u043E\\u0434\\u0435\\u0436\\u0434\\u0443", description: "\\u041F\\u0440\\u043E\\u0441\\u0442\\u043E \\u043D\\u0430\\u0432\\u0435\\u0434\\u0438\\u0442\\u0435 \\u043A\\u0430\\u043C\\u0435\\u0440\\u0443 \\u043D\\u0430 \\u0432\\u0435\\u0449\\u044C. AI \\u0440\\u0430\\u0441\\u043F\\u043E\\u0437\\u043D\\u0430\\u0435\\u0442 \\u0435\\u0451 \\u0430\\u0432\\u0442\\u043E\\u043C\\u0430\\u0442\\u0438\\u0447\\u0435\\u0441\\u043A\\u0438." },
  { number: "02", emoji: "\\uD83E\\uDDE0", title: "AI \\u0430\\u043D\\u0430\\u043B\\u0438\\u0437\\u0438\\u0440\\u0443\\u0435\\u0442", description: "\\u041D\\u0435\\u0439\\u0440\\u043E\\u0441\\u0435\\u0442\\u044C \\u043E\\u043F\\u0440\\u0435\\u0434\\u0435\\u043B\\u044F\\u0435\\u0442 \\u043A\\u0430\\u0442\\u0435\\u0433\\u043E\\u0440\\u0438\\u044E, \\u0446\\u0432\\u0435\\u0442, \\u0441\\u0442\\u0438\\u043B\\u044C \\u0438 \\u0441\\u0435\\u0437\\u043E\\u043D\\u043D\\u043E\\u0441\\u0442\\u044C." },
  { number: "03", emoji: "\\uD83C\\uDFAF", title: "\\u0412\\u044B\\u0431\\u0435\\u0440\\u0438\\u0442\\u0435 \\u043C\\u0435\\u0440\\u043E\\u043F\\u0440\\u0438\\u044F\\u0442\\u0438\\u0435", description: "\\u0423\\u043A\\u0430\\u0436\\u0438\\u0442\\u0435, \\u043A\\u0443\\u0434\\u0430 \\u0432\\u044B \\u0441\\u043E\\u0431\\u0438\\u0440\\u0430\\u0435\\u0442\\u0435\\u0441\\u044C." },
  { number: "04", emoji: "\\u2728", title: "\\u041F\\u043E\\u043B\\u0443\\u0447\\u0438\\u0442\\u0435 \\u0433\\u043E\\u0442\\u043E\\u0432\\u044B\\u0439 \\u043E\\u0431\\u0440\\u0430\\u0437", description: "AI \\u0441\\u043E\\u0437\\u0434\\u0430\\u0451\\u0442 \\u0438\\u0434\\u0435\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 look \\u0438\\u0437 \\u0432\\u0430\\u0448\\u0435\\u0433\\u043E \\u0433\\u0430\\u0440\\u0434\\u0435\\u0440\\u043E\\u0431\\u0430." },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 0.8", "end 0.5"] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading badge="\\u041A\\u0430\\u043A \\u044D\\u0442\\u043E \\u0440\\u0430\\u0431\\u043E\\u0442\\u0430\\u0435\\u0442" title="\\u0427\\u0435\\u0442\\u044B\\u0440\\u0435 \\u043F\\u0440\\u043E\\u0441\\u0442\\u044B\\u0445 \\u0448\\u0430\\u0433\\u0430" subtitle="\\u041E\\u0442 \\u0444\\u043E\\u0442\\u043E\\u0433\\u0440\\u0430\\u0444\\u0438\\u0438 \\u0434\\u043E \\u0438\\u0434\\u0435\\u0430\\u043B\\u044C\\u043D\\u043E\\u0433\\u043E \\u043E\\u0431\\u0440\\u0430\\u0437\\u0430" />
        <div ref={containerRef} className="relative max-w-2xl mx-auto">
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-line">
            <motion.div className="w-full timeline-line-bg rounded-full origin-top" style={{ height: lineHeight }} />
          </div>
          <div className="space-y-12 sm:space-y-16">
            {steps.map((step, i) => (
              <ScrollReveal key={step.number} delay={i * 0.15}>
                <div className="relative pl-16 sm:pl-20">
                  <motion.div whileInView={{ scale: [0.5, 1.1, 1] }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="absolute left-0 top-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-clay to-clay-dark flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-clay/20">{step.emoji}</motion.div>
                  <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                    <span className="text-xs font-heading font-bold text-clay tracking-widest uppercase">\\u0428\\u0430\\u0433 {step.number}</span>
                    <h3 className="mt-2 font-heading font-bold text-xl sm:text-2xl text-ink">{step.title}</h3>
                    <p className="mt-3 text-muted leading-relaxed">{step.description}</p>
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
`);

// --- Showcase.tsx ---
writeFile("src/components/Showcase.tsx", `"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "./SectionHeading";

const screens = [
  { title: "\\u0413\\u0430\\u0440\\u0434\\u0435\\u0440\\u043E\\u0431", items: ["\\uD83D\\uDC55 \\u0411\\u0435\\u043B\\u0430\\u044F \\u0440\\u0443\\u0431\\u0430\\u0448\\u043A\\u0430", "\\uD83D\\uDC56 \\u0421\\u0438\\u043D\\u0438\\u0435 \\u0434\\u0436\\u0438\\u043D\\u0441\\u044B", "\\uD83E\\uDDE5 \\u0411\\u0435\\u0436\\u0435\\u0432\\u044B\\u0439 \\u043F\\u0438\\u0434\\u0436\\u0430\\u043A", "\\uD83D\\uDC5F \\u0411\\u0435\\u043B\\u044B\\u0435 \\u043A\\u0440\\u043E\\u0441\\u0441\\u043E\\u0432\\u043A\\u0438"], accent: "from-clay/20 to-clay-light/20" },
  { title: "AI \\u043F\\u043E\\u0434\\u0431\\u043E\\u0440", items: ["\\uD83C\\uDF24 \\u0422\\u0435\\u043C\\u043F\\u0435\\u0440\\u0430\\u0442\\u0443\\u0440\\u0430: 22\\u00B0", "\\uD83D\\uDCCD \\u0414\\u0435\\u043B\\u043E\\u0432\\u0430\\u044F \\u0432\\u0441\\u0442\\u0440\\u0435\\u0447\\u0430", "\\uD83D\\uDCA1 \\u0421\\u0442\\u0438\\u043B\\u044C: Smart Casual"], accent: "from-sky-400/15 to-blue-500/15" },
  { title: "\\u0413\\u043E\\u0442\\u043E\\u0432\\u044B\\u0439 \\u043E\\u0431\\u0440\\u0430\\u0437", items: ["\\u2705 \\u0411\\u0435\\u0436\\u0435\\u0432\\u044B\\u0439 \\u043F\\u0438\\u0434\\u0436\\u0430\\u043A", "\\u2705 \\u0411\\u0435\\u043B\\u0430\\u044F \\u0440\\u0443\\u0431\\u0430\\u0448\\u043A\\u0430", "\\u2705 \\u0421\\u0438\\u043D\\u0438\\u0435 \\u0434\\u0436\\u0438\\u043D\\u0441\\u044B", "\\u2705 \\u0411\\u0435\\u043B\\u044B\\u0435 \\u043A\\u0440\\u043E\\u0441\\u0441\\u043E\\u0432\\u043A\\u0438"], accent: "from-emerald-400/15 to-green-500/15" },
];

export default function Showcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section className="py-24 sm:py-32 lg:py-40 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading badge="\\u041F\\u0440\\u0435\\u0432\\u044C\\u044E" title="\\u0412\\u0430\\u0448 \\u0441\\u0442\\u0438\\u043B\\u044C \\u0432 \\u043A\\u0430\\u0440\\u043C\\u0430\\u043D\\u0435" subtitle="\\u0418\\u043D\\u0442\\u0443\\u0438\\u0442\\u0438\\u0432\\u043D\\u044B\\u0439 \\u0438\\u043D\\u0442\\u0435\\u0440\\u0444\\u0435\\u0439\\u0441" />
        <div ref={containerRef} className="flex justify-center">
          <motion.div style={{ y }} className="relative">
            <div className="phone-frame w-[280px] sm:w-[320px]">
              <div className="phone-screen aspect-[9/19.5] overflow-hidden relative">
                <motion.div animate={{ y: ["0%", "-66.67%"] }} transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} className="flex flex-col">
                  {screens.map((screen, si) => (
                    <div key={si} className="min-h-full p-5 sm:p-6 flex flex-col justify-center" style={{ minHeight: "calc(100%)" }}>
                      <div className="flex justify-between items-center mb-6 text-xs text-muted"><span>9:41</span><div className="flex gap-1"><div className="w-4 h-2 bg-ink/30 rounded-sm" /><div className="w-3 h-2 bg-ink/20 rounded-sm" /></div></div>
                      <div className={\`rounded-2xl bg-gradient-to-br \${screen.accent} p-4 mb-4\`}><h4 className="font-heading font-bold text-lg text-ink mb-1">{screen.title}</h4><div className="h-0.5 w-8 bg-clay/30 rounded-full" /></div>
                      <div className="space-y-3">{screen.items.map((item, ii) => (<div key={ii} className="flex items-center gap-3 p-3 bg-white/60 rounded-xl"><span className="text-sm">{item}</span></div>))}</div>
                      <div className="mt-6 h-12 bg-gradient-to-r from-clay to-clay-dark rounded-xl flex items-center justify-center"><span className="text-white text-sm font-medium">\\u041F\\u0440\\u043E\\u0434\\u043E\\u043B\\u0436\\u0438\\u0442\\u044C</span></div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
            <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-br from-clay via-clay-light to-transparent rounded-full scale-150" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
`);

// --- AIDemo.tsx ---
writeFile("src/components/AIDemo.tsx", `"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";

const userMessage = "\\u0418\\u0434\\u0443 \\u043D\\u0430 \\u0441\\u0432\\u0438\\u0434\\u0430\\u043D\\u0438\\u0435 \\uD83D\\uDC95";
const aiResponse = "\\u041E\\u0442\\u043B\\u0438\\u0447\\u043D\\u044B\\u0439 \\u043F\\u043E\\u0432\\u043E\\u0434 \\u0432\\u044B\\u0433\\u043B\\u044F\\u0434\\u0435\\u0442\\u044C \\u043D\\u0435\\u043E\\u0442\\u0440\\u0430\\u0437\\u0438\\u043C\\u043E! \\u0412\\u043E\\u0442 \\u0447\\u0442\\u043E \\u044F \\u043F\\u043E\\u0434\\u043E\\u0431\\u0440\\u0430\\u043B:";
const outfitCards = [
  { emoji: "\\uD83E\\uDDE5", name: "\\u0411\\u0435\\u0436\\u0435\\u0432\\u044B\\u0439 \\u043F\\u0438\\u0434\\u0436\\u0430\\u043A", style: "Casual Elegance" },
  { emoji: "\\uD83D\\uDC54", name: "\\u0411\\u0435\\u043B\\u0430\\u044F \\u0440\\u0443\\u0431\\u0430\\u0448\\u043A\\u0430", style: "Slim Fit" },
  { emoji: "\\uD83D\\uDC56", name: "\\u0422\\u0451\\u043C\\u043D\\u044B\\u0435 \\u0431\\u0440\\u044E\\u043A\\u0438", style: "Chinos" },
  { emoji: "\\uD83D\\uDC5E", name: "\\u041A\\u043E\\u0440\\u0438\\u0447\\u043D\\u0435\\u0432\\u044B\\u0435 \\u043B\\u043E\\u0444\\u0435\\u0440\\u044B", style: "Leather" },
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
        <SectionHeading badge="AI \\u0432 \\u0434\\u0435\\u0439\\u0441\\u0442\\u0432\\u0438\\u0438" title="\\u041F\\u043E\\u043F\\u0440\\u043E\\u0431\\u0443\\u0439\\u0442\\u0435 \\u043F\\u0440\\u044F\\u043C\\u043E \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441" subtitle="AI \\u043F\\u043E\\u0434\\u0431\\u0435\\u0440\\u0451\\u0442 \\u0438\\u0434\\u0435\\u0430\\u043B\\u044C\\u043D\\u044B\\u0439 \\u043E\\u0431\\u0440\\u0430\\u0437" />
        <ScrollReveal>
          <div ref={ref} className="max-w-4xl mx-auto glass rounded-3xl sm:rounded-[2rem] p-6 sm:p-10 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-clay to-clay-dark flex items-center justify-center text-white text-sm font-bold">\\u0412\\u044B</div>
                  <div><div className="font-heading font-semibold text-sm text-ink">\\u0412\\u044B</div><div className="text-xs text-muted">\\u0442\\u043E\\u043B\\u044C\\u043A\\u043E \\u0447\\u0442\\u043E</div></div>
                </div>
                {step >= 1 && (<motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4 }} className="bg-ink text-cream rounded-2xl rounded-tl-md px-5 py-4"><p className="text-base">{userMessage}</p></motion.div>)}
                {step >= 2 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center gap-2 text-sm text-muted"><motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>AI \\u0430\\u043D\\u0430\\u043B\\u0438\\u0437\\u0438\\u0440\\u0443\\u0435\\u0442 \\u0432\\u0430\\u0448 \\u0433\\u0430\\u0440\\u0434\\u0435\\u0440\\u043E\\u0431...</motion.span></motion.div>)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-clay-light to-clay flex items-center justify-center text-lg">\\uD83E\\uDD16</div>
                  <div><div className="font-heading font-semibold text-sm text-ink">Wardrobe AI</div><div className="text-xs text-muted">\\u043E\\u0442\\u0432\\u0435\\u0442\\u0438\\u043B \\u043C\\u0433\\u043D\\u043E\\u0432\\u0435\\u043D\\u043D\\u043E</div></div>
                </div>
                {step >= 3 && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-cream/80 border border-line rounded-2xl rounded-tl-md px-5 py-4 mb-4"><p className="text-sm text-ink">{aiResponse}</p></motion.div>)}
                <div className="space-y-3">
                  {outfitCards.map((card, i) => {
                    if (step < 4 + i) return null;
                    return (
                      <motion.div key={card.name} initial={{ opacity: 0, x: 20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                        className="flex items-center gap-4 p-4 glass rounded-2xl hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cream to-line flex items-center justify-center text-2xl shrink-0">{card.emoji}</div>
                        <div className="min-w-0"><div className="font-heading font-semibold text-sm text-ink truncate">{card.name}</div><div className="text-xs text-muted">{card.style}</div></div>
                        <div className="ml-auto"><div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><span className="text-green-600 text-xs">\\u2713</span></div></div>
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
`);

// --- Testimonials.tsx ---
writeFile("src/components/Testimonials.tsx", `"use client";
import SectionHeading from "./SectionHeading";

const testimonials = [
  { name: "\\u0410\\u043D\\u043D\\u0430 \\u041A.", role: "\\u0414\\u0438\\u0437\\u0430\\u0439\\u043D\\u0435\\u0440", text: "Wardrobe AI \\u043F\\u043E\\u043B\\u043D\\u043E\\u0441\\u0442\\u044C\\u044E \\u0438\\u0437\\u043C\\u0435\\u043D\\u0438\\u043B \\u043C\\u043E\\u0439 \\u043F\\u043E\\u0434\\u0445\\u043E\\u0434 \\u043A \\u043E\\u0434\\u0435\\u0436\\u0434\\u0435. \\u041A\\u0430\\u0436\\u0434\\u043E\\u0435 \\u0443\\u0442\\u0440\\u043E \\u044D\\u043A\\u043E\\u043D\\u043E\\u043C\\u043B\\u044E 30 \\u043C\\u0438\\u043D\\u0443\\u0442!", avatar: "\\u0410" },
  { name: "\\u041C\\u0438\\u0445\\u0430\\u0438\\u043B \\u0420.", role: "\\u041F\\u0440\\u0435\\u0434\\u043F\\u0440\\u0438\\u043D\\u0438\\u043C\\u0430\\u0442\\u0435\\u043B\\u044C", text: "\\u041D\\u0438\\u043A\\u043E\\u0433\\u0434\\u0430 \\u043D\\u0435 \\u0434\\u0443\\u043C\\u0430\\u043B, \\u0447\\u0442\\u043E AI \\u043C\\u043E\\u0436\\u0435\\u0442 \\u0442\\u0430\\u043A \\u0445\\u043E\\u0440\\u043E\\u0448\\u043E \\u0440\\u0430\\u0437\\u0431\\u0438\\u0440\\u0430\\u0442\\u044C\\u0441\\u044F \\u0432 \\u0441\\u0442\\u0438\\u043B\\u0435.", avatar: "\\u041C" },
  { name: "\\u0421\\u043E\\u0444\\u0438\\u044F \\u041B.", role: "\\u041C\\u0430\\u0440\\u043A\\u0435\\u0442\\u043E\\u043B\\u043E\\u0433", text: "\\u041E\\u0431\\u043E\\u0436\\u0430\\u044E \\u0444\\u0443\\u043D\\u043A\\u0446\\u0438\\u044E \\u0443\\u0447\\u0451\\u0442\\u0430 \\u043F\\u043E\\u0433\\u043E\\u0434\\u044B. \\u0422\\u0435\\u043F\\u0435\\u0440\\u044C \\u044F \\u0432\\u0441\\u0435\\u0433\\u0434\\u0430 \\u043E\\u0434\\u0435\\u0442\\u0430 \\u043F\\u043E \\u043F\\u043E\\u0433\\u043E\\u0434\\u0435.", avatar: "\\u0421" },
  { name: "\\u0414\\u043C\\u0438\\u0442\\u0440\\u0438\\u0439 \\u0412.", role: "\\u0420\\u0430\\u0437\\u0440\\u0430\\u0431\\u043E\\u0442\\u0447\\u0438\\u043A", text: "\\u0414\\u043B\\u044F \\u043C\\u0435\\u043D\\u044F \\u044D\\u0442\\u043E \\u043F\\u0440\\u0438\\u043B\\u043E\\u0436\\u0435\\u043D\\u0438\\u0435 \\u2014 \\u043D\\u0430\\u0441\\u0442\\u043E\\u044F\\u0449\\u0435\\u0435 \\u0441\\u043F\\u0430\\u0441\\u0435\\u043D\\u0438\\u0435. \\u0412\\u044B\\u0433\\u043B\\u044F\\u0436\\u0443 \\u043D\\u0430 100%!", avatar: "\\u0414" },
  { name: "\\u0415\\u043B\\u0435\\u043D\\u0430 \\u041F.", role: "\\u0421\\u0442\\u0438\\u043B\\u0438\\u0441\\u0442", text: "AI \\u043F\\u043E\\u0434\\u0431\\u0438\\u0440\\u0430\\u0435\\u0442 \\u043E\\u0431\\u0440\\u0430\\u0437\\u044B \\u043D\\u0430 \\u0443\\u0440\\u043E\\u0432\\u043D\\u0435 \\u043E\\u043F\\u044B\\u0442\\u043D\\u043E\\u0433\\u043E \\u044D\\u043A\\u0441\\u043F\\u0435\\u0440\\u0442\\u0430.", avatar: "\\u0415" },
  { name: "\\u0410\\u0440\\u0442\\u0451\\u043C \\u041D.", role: "\\u0424\\u043E\\u0442\\u043E\\u0433\\u0440\\u0430\\u0444", text: "\\u041A\\u0430\\u043F\\u0441\\u0443\\u043B\\u044C\\u043D\\u044B\\u0439 \\u0433\\u0430\\u0440\\u0434\\u0435\\u0440\\u043E\\u0431 \\u043F\\u043E\\u043C\\u043E\\u0433 \\u0441\\u043E\\u043A\\u0440\\u0430\\u0442\\u0438\\u0442\\u044C \\u0433\\u0430\\u0440\\u0434\\u0435\\u0440\\u043E\\u0431 \\u0432\\u0434\\u0432\\u043E\\u0435.", avatar: "\\u0410" },
];
const doubled = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 lg:py-40 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading badge="\\u041E\\u0442\\u0437\\u044B\\u0432\\u044B" title="\\u0418\\u043C \\u043D\\u0440\\u0430\\u0432\\u0438\\u0442\\u0441\\u044F Wardrobe AI" subtitle="\\u041F\\u0440\\u0438\\u0441\\u043E\\u0435\\u0434\\u0438\\u043D\\u044F\\u0439\\u0442\\u0435\\u0441\\u044C \\u043A \\u0442\\u044B\\u0441\\u044F\\u0447\\u0430\\u043C \\u043F\\u043E\\u043B\\u044C\\u0437\\u043E\\u0432\\u0430\\u0442\\u0435\\u043B\\u0435\\u0439" />
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-r from-cream to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 bg-gradient-to-l from-cream to-transparent z-10 pointer-events-none" />
        <div className="marquee-track flex gap-5 sm:gap-6 w-max">
          {doubled.map((t, i) => (
            <div key={i} className="glass rounded-3xl p-6 sm:p-8 w-[300px] sm:w-[360px] shrink-0 hover:shadow-lg transition-shadow duration-300">
              <div className="flex gap-1 mb-4">{[...Array(5)].map((_, si) => (<span key={si} className="text-amber-400 text-sm">\\u2605</span>))}</div>
              <p className="text-ink text-sm sm:text-base leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-clay to-clay-dark flex items-center justify-center text-white text-sm font-bold">{t.avatar}</div>
                <div><div className="font-heading font-semibold text-sm text-ink">{t.name}</div><div className="text-xs text-muted">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`);

// --- FAQ.tsx ---
writeFile("src/components/FAQ.tsx", `"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import SectionHeading from "./SectionHeading";

const faqs = [
  { q: "\\u041A\\u0430\\u043A Wardrobe AI \\u0430\\u043D\\u0430\\u043B\\u0438\\u0437\\u0438\\u0440\\u0443\\u0435\\u0442 \\u043C\\u043E\\u044E \\u043E\\u0434\\u0435\\u0436\\u0434\\u0443?", a: "\\u0412\\u044B \\u043F\\u0440\\u043E\\u0441\\u0442\\u043E \\u0444\\u043E\\u0442\\u043E\\u0433\\u0440\\u0430\\u0444\\u0438\\u0440\\u0443\\u0435\\u0442\\u0435 \\u0432\\u0435\\u0449\\u044C, \\u0430 \\u043D\\u0435\\u0439\\u0440\\u043E\\u0441\\u0435\\u0442\\u044C \\u043E\\u043F\\u0440\\u0435\\u0434\\u0435\\u043B\\u044F\\u0435\\u0442 \\u043A\\u0430\\u0442\\u0435\\u0433\\u043E\\u0440\\u0438\\u044E, \\u0446\\u0432\\u0435\\u0442, \\u0441\\u0442\\u0438\\u043B\\u044C." },
  { q: "\\u041D\\u0443\\u0436\\u0435\\u043D \\u043B\\u0438 \\u0438\\u043D\\u0442\\u0435\\u0440\\u043D\\u0435\\u0442?", a: "\\u0414\\u043B\\u044F \\u0430\\u043D\\u0430\\u043B\\u0438\\u0437\\u0430 \\u043D\\u0443\\u0436\\u0435\\u043D. \\u0413\\u0430\\u0440\\u0434\\u0435\\u0440\\u043E\\u0431 \\u0434\\u043E\\u0441\\u0442\\u0443\\u043F\\u0435\\u043D \\u043E\\u0444\\u0444\\u043B\\u0430\\u0439\\u043D." },
  { q: "\\u041F\\u0440\\u0438\\u043B\\u043E\\u0436\\u0435\\u043D\\u0438\\u0435 \\u0431\\u0435\\u0441\\u043F\\u043B\\u0430\\u0442\\u043D\\u043E\\u0435?", a: "\\u0411\\u0430\\u0437\\u043E\\u0432\\u044B\\u0435 \\u0444\\u0443\\u043D\\u043A\\u0446\\u0438\\u0438 \\u0431\\u0435\\u0441\\u043F\\u043B\\u0430\\u0442\\u043D\\u044B. \\u0415\\u0441\\u0442\\u044C \\u043F\\u0440\\u0435\\u043C\\u0438\\u0443\\u043C-\\u043F\\u043E\\u0434\\u043F\\u0438\\u0441\\u043A\\u0430." },
  { q: "\\u041D\\u0430 \\u043A\\u0430\\u043A\\u0438\\u0445 \\u0443\\u0441\\u0442\\u0440\\u043E\\u0439\\u0441\\u0442\\u0432\\u0430\\u0445 \\u0440\\u0430\\u0431\\u043E\\u0442\\u0430\\u0435\\u0442?", a: "iOS \\u0438 Android." },
  { q: "\\u041D\\u0430\\u0441\\u043A\\u043E\\u043B\\u044C\\u043A\\u043E \\u0442\\u043E\\u0447\\u043D\\u044B \\u0440\\u0435\\u043A\\u043E\\u043C\\u0435\\u043D\\u0434\\u0430\\u0446\\u0438\\u0438?", a: "\\u0422\\u043E\\u0447\\u043D\\u043E\\u0441\\u0442\\u044C \\u0431\\u043E\\u043B\\u0435\\u0435 95%." },
  { q: "\\u041C\\u043E\\u0438 \\u0434\\u0430\\u043D\\u043D\\u044B\\u0435 \\u0432 \\u0431\\u0435\\u0437\\u043E\\u043F\\u0430\\u0441\\u043D\\u043E\\u0441\\u0442\\u0438?", a: "\\u0414\\u0430. \\u0412\\u0441\\u0435 \\u0434\\u0430\\u043D\\u043D\\u044B\\u0435 \\u0437\\u0430\\u0448\\u0438\\u0444\\u0440\\u043E\\u0432\\u0430\\u043D\\u044B. GDPR." },
];

function FAQItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <motion.div className="glass rounded-2xl sm:rounded-3xl overflow-hidden" whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
      <button onClick={onClick} className="w-full flex items-center justify-between gap-4 p-6 sm:p-8 text-left">
        <span className="font-heading font-semibold text-base sm:text-lg text-ink pr-4">{q}</span>
        <motion.div animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cream flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-ink"><path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}><div className="px-6 sm:px-8 pb-6 sm:pb-8"><p className="text-muted leading-relaxed">{a}</p></div></motion.div>)}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading badge="FAQ" title="\\u0427\\u0430\\u0441\\u0442\\u044B\\u0435 \\u0432\\u043E\\u043F\\u0440\\u043E\\u0441\\u044B" subtitle="\\u0412\\u0441\\u0451, \\u0447\\u0442\\u043E \\u0432\\u044B \\u0445\\u043E\\u0442\\u0435\\u043B\\u0438 \\u0437\\u043D\\u0430\\u0442\\u044C" />
        <div className="space-y-4">
          {faqs.map((faq, i) => (<ScrollReveal key={i} delay={i * 0.08}><FAQItem q={faq.q} a={faq.a} isOpen={openIndex === i} onClick={() => setOpenIndex(openIndex === i ? null : i)} /></ScrollReveal>))}
        </div>
      </div>
    </section>
  );
}
`);

// --- FinalCTA.tsx ---
writeFile("src/components/FinalCTA.tsx", `"use client";
import { motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

export default function FinalCTA() {
  return (
    <section id="download" className="py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-ink p-10 sm:p-16 lg:p-24 text-center">
            <div className="absolute top-[-50%] left-[20%] w-[400px] h-[400px] rounded-full bg-clay/20 blur-[100px] glow-animate" />
            <div className="absolute bottom-[-50%] right-[20%] w-[500px] h-[500px] rounded-full bg-clay-dark/15 blur-[120px] glow-animate" style={{ animationDelay: "2s" }} />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            <div className="relative z-10">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 glass-dark rounded-full text-sm font-medium text-clay-light mb-8">
                <span className="w-2 h-2 bg-clay rounded-full animate-pulse" />\\u0414\\u043E\\u0441\\u0442\\u0443\\u043F\\u043D\\u043E \\u0434\\u043B\\u044F iOS \\u0438 Android
              </motion.div>
              <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-cream tracking-tight leading-tight max-w-3xl mx-auto">
                \\u041D\\u0430\\u0447\\u043D\\u0438\\u0442\\u0435 \\u043E\\u0434\\u0435\\u0432\\u0430\\u0442\\u044C\\u0441\\u044F<br /><span className="bg-gradient-to-r from-clay-light via-clay to-clay-dark bg-clip-text text-transparent">\\u0431\\u0435\\u0437\\u0443\\u043F\\u0440\\u0435\\u0447\\u043D\\u043E</span>
              </h2>
              <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-cream/60 max-w-xl mx-auto leading-relaxed">\\u0421\\u043A\\u0430\\u0447\\u0430\\u0439\\u0442\\u0435 Wardrobe AI</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="mt-10 sm:mt-12 inline-block">
                <a href="#" className="btn-shine group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-clay to-clay-dark text-cream font-heading font-bold text-lg rounded-2xl shadow-2xl shadow-clay/30 hover:shadow-clay/50 transition-shadow duration-500">
                  \\u0421\\u043A\\u0430\\u0447\\u0430\\u0442\\u044C \\u0431\\u0435\\u0441\\u043F\\u043B\\u0430\\u0442\\u043D\\u043E
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </a>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
`);

// --- Footer.tsx ---
writeFile("src/components/Footer.tsx", `export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-clay to-clay-dark flex items-center justify-center"><span className="text-white text-xs font-bold font-heading">W</span></div>
            <span className="font-heading font-bold text-base text-ink tracking-tight">Wardrobe<span className="text-clay ml-0.5">AI</span></span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted">
            <a href="#" className="hover:text-ink transition-colors duration-300">Privacy</a>
            <a href="#" className="hover:text-ink transition-colors duration-300">Terms</a>
            <a href="#" className="hover:text-ink transition-colors duration-300" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            </a>
          </nav>
          <p className="text-xs text-muted">\\u00A9 2024 Wardrobe AI</p>
        </div>
      </div>
    </footer>
  );
}
`);

ok("13 \\u0444\\u0430\\u0439\\u043B\\u043E\\u0432 \\u0441\\u043E\\u0437\\u0434\\u0430\\u043D\\u043E!");

// ===== INSTALL =====
log("\n[3/4] \\u0423\\u0441\\u0442\\u0430\\u043D\\u0430\\u0432\\u043B\\u0438\\u0432\\u0430\\u044E \\u0437\\u0430\\u0432\\u0438\\u0441\\u0438\\u043C\\u043E\\u0441\\u0442\\u0438 (\\u044D\\u0442\\u043E \\u0437\\u0430\\u0439\\u043C\\u0451\\u0442 1-2 \\u043C\\u0438\\u043D\\u0443\\u0442\\u044B)...");
execSync("npm install next@latest react@latest react-dom@latest framer-motion", { cwd: PROJECT, stdio: "inherit" });
execSync("npm install -D typescript @types/react @types/react-dom @types/node tailwindcss postcss autoprefixer", { cwd: PROJECT, stdio: "inherit" });

ok("\\u0417\\u0430\\u0432\\u0438\\u0441\\u0438\\u043C\\u043E\\u0441\\u0442\\u0438 \\u0443\\u0441\\u0442\\u0430\\u043D\\u043E\\u0432\\u043B\\u0435\\u043D\\u044B!");

log("\n[4/4] \\u0413\\u043E\\u0442\\u043E\\u0432\\u043E!");

console.log(`
\x1b[32m══════════════════════════════════════\x1b[0m
\x1b[32m  \\u2705 WARDROBE AI \\u0423\\u0421\\u0422\\u0410\\u041D\\u041E\\u0412\\u041B\\u0415\\u041D!\x1b[0m
\x1b[32m══════════════════════════════════════\x1b[0m

  \\u0422\\u0435\\u043F\\u0435\\u0440\\u044C \\u0432\\u044B\\u043F\\u043E\\u043B\\u043D\\u0438\\u0442\\u0435:

  \x1b[36mcd "${PROJECT}"\x1b[0m
  \x1b[36mnpm run dev\x1b[0m

  \\u041E\\u0442\\u043A\\u0440\\u043E\\u0439\\u0442\\u0435: \x1b[36mhttp://localhost:3000\x1b[0m
`);
