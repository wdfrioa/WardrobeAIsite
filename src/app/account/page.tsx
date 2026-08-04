"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import AuthGate from "@/components/AuthGate";

/**
 * ============================================================
 *  ЛИЧНЫЙ КАБИНЕТ
 * ============================================================
 *  /account/  →  https://wdfrioa.github.io/WardrobeAIsite/account/
 *
 *  Показывает: статус подписки, данные аккаунта, кнопку оплаты.
 *  Если пользователь — админ, появляется ссылка на панель управления.
 * ============================================================ */

const PAYMENTS_ENABLED = false;

function AccountContent() {
  const params = useSearchParams();
  const { user, profile, loading, isAdmin, isPremium, refresh, signOut } =
    useAuth();

  const [message, setMessage] = useState("");
  const [clothesCount, setClothesCount] = useState<number | null>(null);

  const fromApp = params.get("from") === "app";

  useEffect(() => {
    if (user) loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadStats() {
    const { data, error } = await supabase.rpc("my_stats");
    if (!error && data && data.length > 0) {
      setClothesCount(Number(data[0].clothes_count));
    }
  }

  function pay() {
    if (!PAYMENTS_ENABLED) {
      setMessage(
        "Оплата скоро будет доступна. Напишите нам, чтобы получить ранний доступ."
      );
      return;
    }
  }

  /* ---------- загрузка ---------- */

  if (loading) {
    return (
      <Shell>
        <div className="text-muted text-center py-20">Загрузка…</div>
      </Shell>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <div className="rounded-2xl border border-line bg-white p-8 text-center">
          <p className="text-ink font-medium">Supabase не настроен</p>
          <p className="text-muted text-sm mt-2">
            Проверьте переменные окружения.
          </p>
        </div>
      </Shell>
    );
  }

  /* ---------- не авторизован ---------- */

  if (!user) {
    return (
      <Shell>
        <div className="max-w-md mx-auto">
          <AuthGate title="Вход в аккаунт" />

          {fromApp ? (
            <p className="text-center text-xs text-muted/70 mt-6">
              Войдите тем же email, что и в приложении
            </p>
          ) : null}
        </div>
      </Shell>
    );
  }

  /* ---------- личный кабинет ---------- */

  return (
    <Shell>
      <div className="max-w-2xl mx-auto">
        {/* Шапка профиля */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl bg-clay/15 flex items-center
                       justify-center text-2xl font-bold text-clay"
          >
            {(user.email ?? "?").charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-2xl font-bold text-ink truncate">
              {user.email}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                  isPremium
                    ? "bg-ink text-white"
                    : "bg-clay/10 text-clay-dark"
                }`}
              >
                {isPremium ? "💎 Premium" : "Free"}
              </span>

              {isAdmin ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-clay text-white">
                  Разработчик
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Админ-панель */}
        {isAdmin ? (
          <Link
            href="/admin/"
            className="mt-6 flex items-center justify-between rounded-2xl
                       border border-clay/30 bg-clay/5 px-6 py-5 hover:bg-clay/10 transition"
          >
            <div>
              <p className="font-semibold text-ink">Панель управления</p>
              <p className="text-sm text-muted mt-0.5">
                Управление подписками пользователей
              </p>
            </div>
            <span className="text-clay text-xl">→</span>
          </Link>
        ) : null}

        {/* Статус подписки */}
        <section className="mt-6 rounded-3xl border border-line bg-white p-7">
          <h2 className="font-heading text-lg font-bold text-ink">Подписка</h2>

          {isPremium ? (
            <>
              <div className="mt-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-ink font-medium">Premium активен</span>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <Row
                  label="Действует до"
                  value={
                    profile?.premium_expires_at
                      ? new Date(profile.premium_expires_at).toLocaleDateString(
                          "ru-RU"
                        )
                      : "Бессрочно"
                  }
                />
                <Row
                  label="Источник"
                  value={
                    profile?.premium_source === "manual"
                      ? "Выдан вручную"
                      : profile?.premium_source ?? "—"
                  }
                />
              </dl>

              <p className="text-sm text-muted mt-5 leading-relaxed">
                Все функции разблокированы в приложении. Если статус
                не обновился — перезайдите в приложение.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted mt-3 leading-relaxed">
                Сейчас у вас бесплатный план: один образ и базовый гардероб.
              </p>

              <div className="mt-6 rounded-2xl bg-cream p-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-4xl font-bold text-ink">
                    299
                  </span>
                  <span className="text-lg text-muted">₽</span>
                  <span className="text-sm text-muted ml-1">/ месяц</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-sm">
                  {[
                    "Образы на неделю",
                    "Сбор чемодана",
                    "Что купить",
                    "Более качественный AI-подбор",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span className="text-clay">✓</span>
                      <span className="text-ink/80">{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={pay}
                  className="w-full py-3.5 mt-6 rounded-xl bg-ink text-white
                             font-semibold hover:bg-ink/90 transition"
                >
                  Оформить Premium
                </button>
              </div>
            </>
          )}
        </section>

        {/* Данные аккаунта */}
        <section className="mt-6 rounded-3xl border border-line bg-white p-7">
          <h2 className="font-heading text-lg font-bold text-ink">Аккаунт</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Email" value={user.email ?? "—"} />
            <Row
              label="Вещей в гардеробе"
              value={clothesCount === null ? "…" : String(clothesCount)}
            />
            <Row label="ID" value={user.id} mono />
          </dl>
        </section>

        <div className="mt-6 flex gap-3">
          <button
            onClick={refresh}
            className="flex-1 py-3 rounded-xl border border-line bg-white
                       text-ink font-medium hover:bg-cream transition"
          >
            Обновить
          </button>
          <button
            onClick={signOut}
            className="flex-1 py-3 rounded-xl border border-line bg-white
                       text-red-600 font-medium hover:bg-red-50 transition"
          >
            Выйти
          </button>
        </div>

        {message ? (
          <p className="text-center text-sm text-muted mt-5">{message}</p>
        ) : null}

        {fromApp ? (
          <p className="text-center text-xs text-muted/70 mt-8">
            После оформления вернитесь в приложение — статус обновится сам
          </p>
        ) : null}
      </div>
    </Shell>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd
        className={`text-ink font-medium text-right break-all ${
          mono ? "text-xs font-mono" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cream px-5 py-16 md:py-24">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-ink transition mb-10"
        >
          <span>←</span>
          <span className="text-sm font-medium">На главную</span>
        </Link>

        {children}
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-muted">Загрузка…</div>
        </main>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
