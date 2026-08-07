"use client";

import { useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

/**
 * ============================================================
 *  ЧТО ДОКУПИТЬ — только для Premium
 * ============================================================
 *
 *  Положить в:  src/components/WebShopping.tsx
 *
 *  AI смотрит на гардероб и говорит, чего в нём не хватает.
 *  Не абстрактное «купите рубашку», а с объяснением: какую,
 *  зачем и с чем она будет сочетаться из уже имеющегося.
 *
 *  Premium проверяется дважды: здесь — чтобы показать замок
 *  вместо формы, и на сервере — чтобы запрос нельзя было
 *  подделать через консоль браузера.
 * ============================================================
 */

const API_URL = "https://ksdflortwbpimuknwpka.supabase.co/functions/v1";

interface Clothing {
  id: string;
  name: string;
  category: string | null;
  type: string | null;
  color: string | null;
  season: string | null;
}

interface Suggestion {
  name: string;
  category: string;
  why: string;
  combines: string;
  priority: string;
}

export default function WebShopping({
  clothes,
  premium,
  onBack,
}: {
  clothes: Clothing[];
  premium: boolean;
  onBack: () => void;
}) {
  const [budget, setBudget] = useState("");
  const [style, setStyle] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [items, setItems] = useState<Suggestion[] | null>(null);

  /* ---------- замок для бесплатных ---------- */

  if (!premium) {
    return (
      <div className="pb-28">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center text-3xl
                     hover:opacity-60 transition"
          style={{ color: "#18181B" }}
          aria-label="Назад"
        >
          ‹
        </button>

        <div
          className="mt-8 bg-white p-8 text-center"
          style={{ borderRadius: 22 }}
        >
          <div
            className="w-20 h-20 rounded-3xl mx-auto flex items-center
                       justify-center text-4xl"
            style={{ backgroundColor: "#EEEAFE" }}
          >
            🛍
          </div>

          <p
            className="font-extrabold mt-6"
            style={{ fontSize: 20, color: "#18181B" }}
          >
            Что докупить
          </p>

          <p
            className="mt-3"
            style={{ fontSize: 14.5, color: "#71717A", lineHeight: 1.55 }}
          >
            AI разберёт ваш гардероб и подскажет, каких вещей не хватает:
            что купить, зачем и с чем это будет сочетаться.
          </p>

          <Link
            href="/premium/"
            className="block w-full font-bold transition hover:opacity-90 mt-6"
            style={{
              borderRadius: 18,
              padding: 16,
              backgroundColor: "#18181B",
              color: "#FFFFFF",
              fontSize: 15.5,
            }}
          >
            Получить Premium
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- запрос ---------- */

  async function analyse() {
    setLoading(true);
    setError("");
    setItems(null);

    try {
      // Токен нужен серверу, чтобы проверить подписку
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${API_URL}/shopping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({
          clothes: clothes.map((c) => ({
            name: c.name,
            category: c.category,
            type: c.type,
            color: c.color,
            season: c.season,
          })),
          budget: budget.trim(),
          style: style.trim(),
        }),
      });

      const data = await res.json();

      if (data?.success && data.result?.items?.length) {
        setSummary(data.result.summary ?? "");
        setItems(data.result.items);
      } else {
        setError(data?.error ?? "Не удалось составить список");
      }
    } catch {
      setError("Сервер недоступен. Проверьте интернет.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-28">
      {/* ---------- шапка ---------- */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center text-3xl
                     hover:opacity-60 transition"
          style={{ color: "#18181B" }}
          aria-label="Назад"
        >
          ‹
        </button>

        <span
          className="font-bold tracking-wider px-4 py-2 rounded-full"
          style={{ fontSize: 12, backgroundColor: "#18181B", color: "#FFFFFF" }}
        >
          PREMIUM
        </span>
      </div>

      <h1
        className="font-heading font-extrabold mt-4"
        style={{ fontSize: 27, color: "#18181B", lineHeight: 1.1 }}
      >
        Что докупить
      </h1>

      <p className="mt-2" style={{ fontSize: 14, color: "#71717A", lineHeight: 1.5 }}>
        AI найдёт пробелы в гардеробе и подскажет, что добавить.
      </p>

      {/* ---------- форма ---------- */}
      <div className="mt-5 bg-white p-5" style={{ borderRadius: 22 }}>
        <p
          className="font-bold tracking-wider mb-2"
          style={{ fontSize: 12, color: "#A1A1AA" }}
        >
          БЮДЖЕТ — необязательно
        </p>
        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Например: до 15 000 ₽"
          className="w-full outline-none border border-transparent
                     focus:border-clay/40 transition"
          style={{
            borderRadius: 16,
            padding: "15px 18px",
            backgroundColor: "#F4F3F1",
            fontSize: 14.5,
            color: "#18181B",
          }}
        />

        <p
          className="font-bold tracking-wider mb-2 mt-5"
          style={{ fontSize: 12, color: "#A1A1AA" }}
        >
          СТИЛЬ — необязательно
        </p>
        <input
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="Например: минимализм, casual"
          className="w-full outline-none border border-transparent
                     focus:border-clay/40 transition"
          style={{
            borderRadius: 16,
            padding: "15px 18px",
            backgroundColor: "#F4F3F1",
            fontSize: 14.5,
            color: "#18181B",
          }}
        />

        <button
          onClick={analyse}
          disabled={loading || clothes.length < 3}
          className="w-full font-bold transition hover:opacity-90
                     disabled:opacity-40 mt-5"
          style={{
            borderRadius: 18,
            padding: 16,
            backgroundColor: "#1B2333",
            color: "#FFFFFF",
            fontSize: 15.5,
          }}
        >
          {loading ? "Анализируем гардероб…" : "🛍 Что мне докупить"}
        </button>

        {clothes.length < 3 ? (
          <p className="text-center mt-3" style={{ fontSize: 13, color: "#A1A1AA" }}>
            Добавьте хотя бы три вещи — иначе советовать не из чего
          </p>
        ) : null}

        {error ? (
          <p className="text-center mt-4" style={{ fontSize: 14, color: "#DC2626" }}>
            {error}
          </p>
        ) : null}
      </div>

      {/* ---------- разбор гардероба ---------- */}
      {summary && items ? (
        <div
          className="mt-4 p-4"
          style={{ borderRadius: 18, backgroundColor: "#EEEAFE" }}
        >
          <p
            className="font-bold tracking-wider"
            style={{ fontSize: 11.5, color: "#5E5CE6" }}
          >
            РАЗБОР ГАРДЕРОБА
          </p>
          <p
            className="mt-2"
            style={{ fontSize: 14, color: "#27272A", lineHeight: 1.55 }}
          >
            {summary}
          </p>
        </div>
      ) : null}

      {/* ---------- список покупок ---------- */}
      {items ? (
        <div className="mt-4 space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-white p-5" style={{ borderRadius: 20 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="font-extrabold"
                    style={{ fontSize: 16.5, color: "#18181B" }}
                  >
                    {item.name}
                  </p>
                  <p className="mt-0.5" style={{ fontSize: 12.5, color: "#A1A1AA" }}>
                    {item.category}
                  </p>
                </div>

                <PriorityBadge priority={item.priority} />
              </div>

              <p
                className="mt-3"
                style={{ fontSize: 14, color: "#27272A", lineHeight: 1.55 }}
              >
                {item.why}
              </p>

              {item.combines ? (
                <div
                  className="mt-3 p-3"
                  style={{ borderRadius: 14, backgroundColor: "#F4F3F1" }}
                >
                  <p
                    className="font-bold tracking-wider"
                    style={{ fontSize: 11, color: "#A1A1AA" }}
                  >
                    СОЧЕТАЕТСЯ С
                  </p>
                  <p
                    className="mt-1"
                    style={{ fontSize: 13.5, color: "#27272A", lineHeight: 1.5 }}
                  >
                    {item.combines}
                  </p>
                </div>
              ) : null}
            </div>
          ))}

          <p
            className="text-center pt-2"
            style={{ fontSize: 12.5, color: "#A1A1AA", lineHeight: 1.5 }}
          >
            Список составлен по вашему гардеробу.
            Начните с вещей высокого приоритета — они дадут больше всего
            новых образов.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   БЕЙДЖ ПРИОРИТЕТА
   ============================================================ */

function PriorityBadge({ priority }: { priority: string }) {
  const p = (priority || "").toLowerCase();

  const style =
    p === "высокий"
      ? { bg: "#18181B", color: "#FFFFFF", text: "Важно" }
      : p === "низкий"
        ? { bg: "#F3F4F6", color: "#6B7280", text: "Потом" }
        : { bg: "#EEEAFE", color: "#5E5CE6", text: "Стоит взять" };

  return (
    <span
      className="shrink-0 font-bold px-2.5 py-1 rounded-lg"
      style={{ fontSize: 11, backgroundColor: style.bg, color: style.color }}
    >
      {style.text}
    </span>
  );
}
