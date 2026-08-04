import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { AuthProvider } from "@/lib/AuthProvider";

/**
 * Префикс для статики.
 *  - GitHub Pages: "/WardrobeAIsite"
 *  - свой сервер:  "" (пусто)
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Wardrobe AI — Твой личный AI-стилист",
  description:
    "Wardrobe AI — мобильное приложение с искусственным интеллектом, которое становится вашим личным стилистом. Никогда больше не думайте, что надеть.",
  keywords: ["AI", "стилист", "гардероб", "мода", "outfit", "wardrobe"],

  // PWA: позволяет добавить сайт на рабочий стол как приложение.
  // ВАЖНО: при переезде на свой домен поправить пути внутри
  // public/manifest.json — убрать префикс /WardrobeAIsite
  manifest: `${BASE}/manifest.json`,

  // Иконка во вкладке браузера. Несколько размеров — чтобы
  // на любом экране и в закладках выглядело чётко.
  icons: {
    icon: [
      { url: `${BASE}/favicon.ico`, sizes: "any" },
      { url: `${BASE}/favicon-16.png`, sizes: "16x16", type: "image/png" },
      { url: `${BASE}/favicon-32.png`, sizes: "32x32", type: "image/png" },
    ],
    apple: `${BASE}/apple-touch-icon.png`,
    shortcut: `${BASE}/favicon.ico`,
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wardrobe AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#F8F6F2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="grain">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
