"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

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
  is_beta: boolean;
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
  const [filter, setFilter] = useState<"all" | "premium" | "beta">("all");

  const load = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, email, is_premium, is_beta, premium_source, premium_expires_at, role, created_at"
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

    const { data, error } = await supabase
      .from("profiles")
      .update({
        is_premium: active,
        premium_source: "manual",
        premium_expires_at: expiresAt,
      })
      .eq("id", row.id)
      .select("id");

    if (error) {
      alert(`Не удалось обновить: ${error.message}`);
    } else if (!data || data.length === 0) {
      alert(
        "База не приняла изменение.\n\n" +
          "Скорее всего, не выполнен скрипт fix-beta-trigger.sql " +
          "или у вас нет роли admin."
      );
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

  /** Бета-доступ: экспериментальные функции для выбранных людей. */
  async function setBeta(row: Row, active: boolean) {
    setBusy(row.id);

    /*
     * .select() после update обязателен.
     *
     * Без него Supabase возвращает успех, даже если строка
     * не изменилась — например, её откатил триггер защиты
     * или не пустила RLS-политика. Интерфейс показывал, что
     * бета выдана, а после «Обновить» флаг пропадал.
     *
     * С .select() приходит реально записанная строка: если
     * массив пустой — значит изменение не применилось.
     */
    const { data, error } = await supabase
      .from("profiles")
      .update({ is_beta: active })
      .eq("id", row.id)
      .select("id, is_beta");

    if (error) {
      alert(`Не удалось обновить: ${error.message}`);
    } else if (!data || data.length === 0) {
      alert(
        "База не приняла изменение.\n\n" +
          "Скорее всего, не выполнен скрипт fix-beta-trigger.sql " +
          "или у вас нет роли admin."
      );
    } else {
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, is_beta: data[0].is_beta } : item
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

    if (!matchQuery) return false;

    if (filter === "premium") return row.is_premium;
    if (filter === "beta") return row.is_beta;

    return true;
  });

  /* ---------- метрики ---------- */

  const premiumCount = rows.filter((r) => r.is_premium).length;
  const betaCount = rows.filter((r) => r.is_beta).length;

  const conversion =
    rows.length > 0 ? Math.round((premiumCount / rows.length) * 100) : 0;

  /** Сколько зарегистрировалось за последние 7 дней. */
  const weekAgo = Date.now() - 7 * 86400000;
  const newThisWeek = rows.filter(
    (r) => new Date(r.created_at).getTime() > weekAgo
  ).length;

  /** Регистрации по дням за две недели — для графика. */
  const chart = buildChart(rows);
  const chartMax = Math.max(...chart.map((d) => d.count), 1);

  return (
    <main className="min-h-screen bg-cream px-5 py-12">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-ink
                     transition mb-6 text-sm font-medium"
        >
          <span>←</span>
          <span>На главную</span>
        </Link>

        <h1 className="font-heading text-3xl font-bold text-ink">
          Панель управления
        </h1>
        <p className="text-muted text-sm mt-1.5">
          Пользователи, подписки и бета-доступ
        </p>

        {/* ---------- МЕТРИКИ ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-7">
          <Metric
            icon="👥"
            label="Всего пользователей"
            value={rows.length}
            delta={newThisWeek > 0 ? `+${newThisWeek}` : undefined}
          />
          <Metric icon="💎" label="Premium" value={premiumCount} />
          <Metric icon="🧪" label="Бета-тестеры" value={betaCount} />
          <Metric icon="📈" label="Конверсия" value={`${conversion}%`} />
        </div>

        {/* ---------- ГРАФИК ---------- */}
        <div className="mt-5 rounded-2xl border border-line bg-white p-6">
          <h2 className="font-bold text-ink text-[17px]">Регистрации</h2>
          <p className="text-muted text-[13px] mt-0.5">За последние 14 дней</p>

          <div className="flex items-end gap-2 h-32 mt-6">
            {chart.map((day, i) => (
              <div
                key={day.label}
                className="flex-1 flex flex-col items-center gap-2"
                title={`${day.label}: ${day.count}`}
              >
                <div
                  className="w-full max-w-[42px] rounded-t-md transition-all"
                  style={{
                    // Минимум 3px, чтобы пустые дни были видны
                    height: `${Math.max((day.count / chartMax) * 104, 3)}px`,
                    backgroundColor: i >= 12 ? "#111827" : "#B1886A",
                    opacity: i >= 12 ? 1 : 0.85,
                  }}
                />
                <span className="text-[11px] text-muted">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- ПОИСК И ФИЛЬТРЫ ---------- */}
        <div className="flex gap-2.5 mt-5 flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по email…"
            className="flex-1 min-w-[220px] rounded-xl border border-line bg-white
                       px-4 py-2.5 text-sm outline-none focus:border-clay transition"
          />

          <FilterChip
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Все
          </FilterChip>

          <FilterChip
            active={filter === "premium"}
            onClick={() => setFilter("premium")}
          >
            Premium
          </FilterChip>

          <FilterChip
            active={filter === "beta"}
            violet
            onClick={() => setFilter("beta")}
          >
            Beta
          </FilterChip>
        </div>

        {/* ---------- ТАБЛИЦА ---------- */}
        <div className="mt-5 rounded-2xl border border-line bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 className="font-bold text-ink text-[17px]">Пользователи</h2>
            <span className="text-[13px] text-muted">
              Показано {filtered.length} из {rows.length}
            </span>
          </div>

          {loading ? (
            <p className="text-center text-muted py-16 text-sm">Загрузка…</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted py-16 text-sm">
              Никого не найдено
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FCFBF9] border-b border-line">
                    <Th>ПОЛЬЗОВАТЕЛЬ</Th>
                    <Th>СТАТУС</Th>
                    <Th>ДО КОГДА</Th>
                    <Th right>ДЕЙСТВИЯ</Th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((row) => {
                    const expired =
                      row.premium_expires_at != null &&
                      new Date(row.premium_expires_at).getTime() < Date.now();

                    const active = row.is_premium && !expired;

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-[#F4F2EE] last:border-0
                                   hover:bg-[#FCFBF9] transition"
                      >
                        {/* пользователь */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center
                                         justify-center font-bold text-[15px] shrink-0"
                              style={{
                                backgroundColor: "#EEEAFE",
                                color: "#5E5CE6",
                              }}
                            >
                              {(row.email ?? "?").charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-ink text-sm truncate">
                                {row.email ?? "—"}
                              </p>
                              <p className="text-[12px] text-muted mt-0.5">
                                с{" "}
                                {new Date(row.created_at).toLocaleDateString(
                                  "ru-RU",
                                  { day: "numeric", month: "long" }
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* статус */}
                        <td className="px-5 py-4">
                          {row.role === "admin" ? (
                            <Badge bg="#B1886A" color="#FFFFFF">
                              Админ
                            </Badge>
                          ) : expired ? (
                            <Badge bg="#FEF3F2" color="#D92D20">
                              Истёк
                            </Badge>
                          ) : active ? (
                            <Badge bg="#111827" color="#FFFFFF">
                              Premium
                            </Badge>
                          ) : (
                            <Badge bg="#F3F4F6" color="#6B7280">
                              Free
                            </Badge>
                          )}
                        </td>

                        {/* срок */}
                        <td className="px-5 py-4 text-sm">
                          {active && row.premium_expires_at ? (
                            <span className="text-ink">
                              {new Date(
                                row.premium_expires_at
                              ).toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "long",
                              })}
                            </span>
                          ) : active ? (
                            <span className="text-muted">бессрочно</span>
                          ) : expired ? (
                            <span style={{ color: "#D92D20" }}>
                              {new Date(
                                row.premium_expires_at as string
                              ).toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "long",
                              })}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                        {/* действия */}
                        <td className="px-5 py-4">
                          <div className="flex gap-1.5 justify-end flex-wrap">
                            <ActionButton
                              disabled={busy === row.id}
                              onClick={() => setBeta(row, !row.is_beta)}
                              style={
                                row.is_beta
                                  ? {
                                      backgroundColor: "#EEEAFE",
                                      color: "#5E5CE6",
                                      borderColor: "transparent",
                                    }
                                  : undefined
                              }
                            >
                              {row.is_beta ? "✓ Beta" : "Beta"}
                            </ActionButton>

                            {active ? (
                              <ActionButton
                                disabled={busy === row.id}
                                onClick={() => setPremium(row, false)}
                                style={{ color: "#D92D20" }}
                              >
                                Забрать
                              </ActionButton>
                            ) : (
                              <>
                                <ActionButton
                                  disabled={busy === row.id}
                                  onClick={() => setPremium(row, true, 30)}
                                >
                                  30 дней
                                </ActionButton>

                                <ActionButton
                                  disabled={busy === row.id}
                                  onClick={() => setPremium(row, true)}
                                  style={{
                                    backgroundColor: "#111827",
                                    color: "#FFFFFF",
                                    borderColor: "#111827",
                                  }}
                                >
                                  Навсегда
                                </ActionButton>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-[12.5px] text-muted mt-6 leading-relaxed">
          Фото для бета-гардероба загружаются в Supabase → Storage → бакет{" "}
          <b>demo</b>. Папки задают категорию: <code>unisex/top</code>,{" "}
          <code>female/dress</code> и так далее. Имя файла становится названием
          вещи.
        </p>
      </div>
    </main>
  );
}

/* ============================================================
   ЭЛЕМЕНТЫ
   ============================================================ */

/** Регистрации по дням за последние 14 дней. */
function buildChart(rows: Row[]): { label: string; count: number }[] {
  const days: { label: string; count: number }[] = [];

  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const next = new Date(date);
    next.setDate(next.getDate() + 1);

    const count = rows.filter((row) => {
      const created = new Date(row.created_at).getTime();
      return created >= date.getTime() && created < next.getTime();
    }).length;

    days.push({ label: String(date.getDate()), count });
  }

  return days;
}

function Metric({
  icon,
  label,
  value,
  delta,
}: {
  icon: string;
  label: string;
  value: number | string;
  delta?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div
        className="w-10 h-10 rounded-xl bg-cream flex items-center
                   justify-center text-[18px]"
      >
        {icon}
      </div>

      <p className="text-muted text-[13px] mt-4">{label}</p>

      <div className="flex items-end justify-between mt-1">
        <span className="text-[26px] font-extrabold text-ink leading-none">
          {value}
        </span>

        {delta ? (
          <span
            className="text-[12px] font-bold px-2 py-0.5 rounded-lg"
            style={{ backgroundColor: "#ECFDF3", color: "#12B76A" }}
          >
            {delta}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function FilterChip({
  children,
  active,
  violet,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  violet?: boolean;
  onClick: () => void;
}) {
  const style = active
    ? violet
      ? { backgroundColor: "#EEEAFE", color: "#5E5CE6", borderColor: "transparent" }
      : { backgroundColor: "#111827", color: "#FFFFFF", borderColor: "#111827" }
    : undefined;

  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-line bg-white px-4 py-2.5
                 text-sm font-semibold text-ink transition hover:bg-cream"
      style={style}
    >
      {children}
    </button>
  );
}

function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`px-5 py-3 text-[11.5px] font-bold tracking-wider text-muted ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Badge({
  children,
  bg,
  color,
}: {
  children: React.ReactNode;
  bg: string;
  color: string;
}) {
  return (
    <span
      className="inline-block text-[11.5px] font-bold px-2.5 py-1 rounded-lg"
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
  style,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="text-[12.5px] font-semibold px-3 py-1.5 rounded-lg
                 border border-line bg-white text-ink whitespace-nowrap
                 transition hover:bg-cream disabled:opacity-40"
      style={style}
    >
      {children}
    </button>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-5">
      <div className="text-center">{children}</div>
    </main>
  );
}
