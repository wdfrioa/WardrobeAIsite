"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

/**
 * ============================================================
 *  ПРОФИЛЬ — ТОЧНАЯ КОПИЯ ЭКРАНА ИЗ ПРИЛОЖЕНИЯ
 * ============================================================
 *
 *  Положить в:  src/components/WebProfile.tsx
 *
 *  Один в один повторяет app/(tabs)/profile.tsx:
 *   - аватар 104px, имя, email, бейдж статуса
 *   - три карточки статистики: Вещей / Образов / Избранное
 *   - меню из 6 пунктов с теми же иконками
 *   - красная кнопка выхода
 *
 *  Цвета из приложения перенесены как есть:
 *   фон #F8F7F4, акцент #5E5CE6, текст #18181B,
 *   приглушённый #71717A, стрелка #A1A1AA, выход #DC2626
 *
 *  Отличие от приложения: пункт «Developer Mode» ведёт в
 *  админку сайта и виден только администратору.
 * ============================================================
 */

interface MenuItem {
  icon: string;
  title: string;
  href: string;
  adminOnly?: boolean;
}

const MENU: MenuItem[] = [
  { icon: "👤", title: "Аккаунт", href: "/account/" },
  { icon: "☁", title: "Синхронизация", href: "/account/" },
  { icon: "◐", title: "Внешний вид", href: "/account/" },
  { icon: "✦", title: "Wardrobe AI Premium", href: "/premium/" },
  { icon: "?", title: "Помощь", href: "/#faq" },
  { icon: "⚙", title: "Developer Mode", href: "/admin/", adminOnly: true },
];

export default function WebProfile({
  email,
  count,
  premium,
  onBack,
}: {
  email: string;
  count: number;
  premium: boolean;
  onBack: () => void;
}) {
  const { signOut, isAdmin, profile } = useAuth();

  const [outfits, setOutfits] = useState(0);
  const [favorites, setFavorites] = useState(0);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Считаем образы и избранное.
   *
   * Таблиц может не быть — тогда просто оставляем нули,
   * экран от этого не ломается.
   */
  async function loadStats() {
    try {
      const { count: outfitsCount } = await supabase
        .from("outfits")
        .select("*", { count: "exact", head: true });

      if (typeof outfitsCount === "number") setOutfits(outfitsCount);
    } catch {
      // таблицы нет — оставляем 0
    }

    try {
      const { count: favCount } = await supabase
        .from("outfits")
        .select("*", { count: "exact", head: true })
        .eq("is_favorite", true);

      if (typeof favCount === "number") setFavorites(favCount);
    } catch {
      // колонки нет — оставляем 0
    }
  }

  /** Имя пользователя: из профиля, иначе часть email до @. */
  const name =
    (profile as any)?.name ||
    (email ? email.split("@")[0] : "") ||
    "Wardrobe User";

  const visibleMenu = MENU.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div style={{ backgroundColor: "#F8F7F4" }} className="-mx-5 -mt-6 px-6 pt-6 pb-10">
      {/* ---------- кнопка назад ---------- */}
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-xl bg-white flex items-center
                   justify-center text-xl hover:bg-black/5 transition"
        style={{ color: "#A1A1AA" }}
        aria-label="Назад"
      >
        ‹
      </button>

      {/* ---------- шапка профиля ---------- */}
      <div className="flex flex-col items-center mt-4">
        <div
          className="w-26 h-26 rounded-full flex items-center justify-center
                     text-4xl font-bold overflow-hidden"
          style={{
            width: 104,
            height: 104,
            backgroundColor: "#E7E5E4",
            color: "#5E5CE6",
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>

        <p
          className="font-heading font-extrabold mt-4"
          style={{ fontSize: 27, color: "#18181B" }}
        >
          {name}
        </p>

        <p className="mt-1.5" style={{ fontSize: 14, color: "#71717A" }}>
          {email}
        </p>

        <div
          className="mt-4 px-3.5 py-1.5 rounded-2xl"
          style={{
            backgroundColor: premium ? "#18181B" : "#EEEAFE",
          }}
        >
          <span
            className="font-bold"
            style={{
              fontSize: 13,
              color: premium ? "#FFFFFF" : "#5E5CE6",
            }}
          >
            {premium ? "✦ Premium Member" : "✦ Free Member"}
          </span>
        </div>
      </div>

      {/* ---------- статистика ---------- */}
      <div className="flex gap-2.5 mt-7 mb-6">
        <Stat icon="♧" value={count} label="Вещей" />
        <Stat icon="✦" value={outfits} label="Образов" />
        <Stat icon="♡" value={favorites} label="Избранное" />
      </div>

      {/* ---------- меню ---------- */}
      <div className="bg-white px-4.5" style={{ borderRadius: 23, paddingLeft: 18, paddingRight: 18 }}>
        {visibleMenu.map((item, i) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-center hover:bg-black/[0.02] transition -mx-4 px-4"
            style={{
              minHeight: 65,
              borderBottomWidth: i < visibleMenu.length - 1 ? 1 : 0,
              borderBottomColor: "#F1F1F1",
              borderBottomStyle: "solid",
            }}
          >
            <span
              className="shrink-0"
              style={{ fontSize: 18, width: 34, color: "#5E5CE6" }}
            >
              {item.icon}
            </span>

            <span
              className="flex-1 font-semibold"
              style={{ fontSize: 16, color: "#27272A" }}
            >
              {item.title}
            </span>

            <span style={{ fontSize: 28, color: "#A1A1AA" }}>›</span>
          </Link>
        ))}
      </div>

      {/* ---------- выход ---------- */}
      <button
        onClick={signOut}
        className="w-full bg-white flex items-center justify-center
                   hover:bg-red-50 transition mt-6"
        style={{ borderRadius: 18, padding: 18 }}
      >
        <span className="font-bold" style={{ fontSize: 16, color: "#DC2626" }}>
          Выйти из аккаунта
        </span>
      </button>
    </div>
  );
}

/* ============================================================
   КАРТОЧКА СТАТИСТИКИ
   ============================================================ */

function Stat({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number;
  label: string;
}) {
  return (
    <div
      className="flex-1 bg-white flex flex-col items-center"
      style={{ borderRadius: 20, paddingTop: 17, paddingBottom: 17 }}
    >
      <span style={{ fontSize: 20, color: "#5E5CE6" }}>{icon}</span>

      <span
        className="font-extrabold mt-1.5"
        style={{ fontSize: 24, color: "#18181B" }}
      >
        {value}
      </span>

      <span className="mt-0.5" style={{ fontSize: 12, color: "#71717A" }}>
        {label}
      </span>
    </div>
  );
}
