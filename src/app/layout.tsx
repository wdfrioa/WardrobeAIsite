import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthProvider";

// export const metadata: Metadata = {
//   title: "Wardrobe AI — Твой личный AI-стилист",
//   description:
//     "Wardrobe AI — мобильное приложение с искусственным интеллектом, которое становится вашим личным стилистом. Никогда больше не думайте, что надеть.",
//   keywords: ["AI", "стилист", "гардероб", "мода", "outfit", "wardrobe"],
// };
export const metadata: Metadata = {
  title: "Wardrobe AI — Твой личный AI-стилист",
  description: "...",
  icons: {
    icon: "/WardrobeAIsite/favicon.png",
  },
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className="...">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
