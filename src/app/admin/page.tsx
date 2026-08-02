"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";

/**
 * ============================================================
 *  ПАНЕЛЬ РАЗРАБОТЧИКА
 * ============================================================
 *  /admin/  →  https://wdfrioa.github.io/WardrobeAIsite/admin/
 *
 *  Доступна только если в profiles.role = 'admin'.
 *  Защита не только в интерфейсе: RLS-политики в базе разрешают
 *  читать чужие профили и менять is_premium исключительно админам.
 *  Даже если открыть страницу напрямую — данные не придут.
 * ============================================================ */

interface Row {
  id: string;
  email: string | null;
  is_premium: boolean;
  premium_source: string | null;
  premium_expires_at: string | null;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [onlyPremium, setOnlyPremium] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, is_premium, premium_source, premium_expires_at, role, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (!error && data) setRows(data as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  async function setPremium(row: Row, active: boolean, days?: number) {
    setBusy(row.id);

    const expiresAt =
      active && days
        ? new Date(Date.now() + days * 86400000).toISOString()
        : null;

    const { error } = await supabase
      .from("profiles")
      .update({
        is_premium: active,
        premium_source: "manual",
        premium_expires_at: expiresAt,
      })
      .eq("id", row.id);

    if (error) {
      alert(`Не удалось обновить: ${error.message}`);
    } else {
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                is_premium: active,
                premium_source: "manual",
                premium_expires_at: expiresAt,
              }
            : item
        )
      );
    }

    setBusy(null);
  }

  /* ---------- доступ ---------- */

  if (authLoading) {
    return <Center>Загрузка…</Center>;
  }

  if (!user) {
    return (
      <Center>
        <p className="text-ink font-medium">Требуется вход</p>
        <Link
          href="/account/"
          className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-ink text-white text-sm font-semibold"
        >
          Войти
        </Link>
      </Center>
    );
  }

  if (!isAdmin) {
    return (
      <Center>
        <p className="text-2xl mb-3">🔒</p>
        <p className="text-ink font-medium">Доступ только для разработчика</p>
        <p className="text-muted text-sm mt-2">
          У вашего аккаунта нет прав администратора.
        </p>
        <Link
          href="/account/"
          className="inline-block mt-5 px-5 py-2.5 rounded-xl border border-line text-sm font-medium"
        >
          В личный кабинет
        </Link>
      </Center>
    );
  }

  /* ---------- фильтрация ---------- */

  const filtered = rows.filter((row) => {
    const matchQuery =
      !query ||
      row.email?.toLowerCase().includes(query.toLowerCase()) ||
      row.id.includes(query);

    const matchPremium = !onlyPremium || row.is_premium;

    return matchQuery && matchPremium;
  });

  const premiumCount = rows.filter((r) => r.is_premium).length;

  return (
    <main className="min-h-screen bg-cream px-5 py-16">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/account/"
          className="inline-flex items-center gap-2 text-muted hover:text-ink transition mb-8"
        >
          <span>←</span>
          <span className="text-sm font-medium">Личный кабинет</span>
        </Link>

        <h1 className="font-heading text-3xl font-bold text-ink">
          Панель управления
        </h1>
        <p className="text-muted mt-2">Подписки пользователей</p>

        {/* Метрики */}
        <div className="grid grid-cols-3 gap-3 mt-7">
          <Stat label="Всего" value={rows.length} />
          <Stat label="Premium" value={premiumCount} accent />
          <Stat label="Free" value={rows.length - premiumCount} />
        </div>

        {/* Поиск */}
        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по email или ID…"
            className="flex-1 py-3 px-4 rounded-xl border border-line bg-white
                       outline-none focus:border-clay transition"
          />

          <button
            onClick={() => setOnlyPremium(!onlyPremium)}
            className={`px-5 py-3 rounded-xl border font-medium text-sm transition ${
              onlyPremium
                ? "bg-ink text-white border-ink"
                : "bg-white text-ink border-line hover:bg-cream"
            }`}
          >
            Только Premium
          </button>

          <button
            onClick={load}
            className="px-5 py-3 rounded-xl border border-line bg-white
                       text-ink font-medium text-sm hover:bg-cream transition"
          >
            Обновить
          </button>
        </div>

        {/* Список */}
        {loading ? (
          <p className="text-muted text-center py-16">Загрузка…</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted text-center py-16">Ничего не найдено</p>
        ) : (
          <div className="mt-5 space-y-3">
            {filtered.map((row) => {
              const expired =
                row.premium_expires_at &&
                new Date(row.premium_expires_at).getTime() < Date.now();

              const active = row.is_premium && !expired;

              return (
                <div
                  key={row.id}
                  className="rounded-2xl border border-line bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-ink break-all">
                          {row.email ?? "—"}
                        </p>

                        {active ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-ink text-white">
                            Premium
                          </span>
                        ) : null}

                        {expired ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            Истёк
                          </span>
                        ) : null}

                        {row.role === "admin" ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-clay text-white">
                            Админ
                          </span>
                        ) : null}
                      </div>

                      <p className="text-xs text-muted font-mono mt-1.5 break-all">
                        {row.id}
                      </p>

                      {row.premium_expires_at ? (
                        <p className="text-xs text-muted mt-1">
                          До{" "}
                          {new Date(
                            row.premium_expires_at
                          ).toLocaleDateString("ru-RU")}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {active ? (
                        <button
                          disabled={busy === row.id}
                          onClick={() => setPremium(row, false)}
                          className="px-4 py-2 rounded-lg border border-line text-sm
                                     font-medium text-red-600 hover:bg-red-50
                                     transition disabled:opacity-40"
                        >
                          Забрать
                        </button>
                      ) : (
                        <>
                          <button
                            disabled={busy === row.id}
                            onClick={() => setPremium(row, true, 30)}
                            className="px-4 py-2 rounded-lg border border-line text-sm
                                       font-medium text-ink hover:bg-cream
                                       transition disabled:opacity-40"
                          >
                            30 дней
                          </button>
                          <button
                            disabled={busy === row.id}
                            onClick={() => setPremium(row, true)}
                            className="px-4 py-2 rounded-lg bg-ink text-white text-sm
                                       font-semibold hover:bg-ink/90
                                       transition disabled:opacity-40"
                          >
                            Навсегда
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted/70 text-center mt-10 leading-relaxed">
          Изменения применяются в приложении мгновенно через Realtime
        </p>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent ? "border-clay/30 bg-clay/5" : "border-line bg-white"
      }`}
    >
      <p className="font-heading text-3xl font-bold text-ink">{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-5">
      <div className="text-center">{children}</div>
    </main>
  );
}
