"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

/**
 * ============================================================
 *  ВЕБ-ВЕРСИЯ ПРИЛОЖЕНИЯ  —  /app/
 * ============================================================
 *
 *  Для тех, у кого iPhone: App Store сейчас недоступен,
 *  поэтому приложение работает прямо в браузере.
 *
 *  Возможности повторяют мобильную версию:
 *   - гардероб с фотографиями
 *   - добавление вещи с распознаванием через AI
 *   - подбор образа с учётом погоды
 *
 *  Данные те же, что в приложении — общая база Supabase.
 * ============================================================ */

const API_URL = "https://wardrobeai-30q0.onrender.com";

interface Clothing {
  id: string;
  name: string;
  category: string | null;
  type: string | null;
  color: string | null;
  season: string | null;
  brand: string | null;
  image_url: string | null;
}

interface OutfitItem {
  id: string;
  name: string;
  type?: string | null;
  color?: string | null;
  image_url?: string | null;
}

type Tab = "wardrobe" | "stylist";

export default function WebApp() {
  const { user, loading: authLoading, isPremium } = useAuth();

  const [tab, setTab] = useState<Tab>("wardrobe");
  const [clothes, setClothes] = useState<Clothing[]>([]);
  const [loading, setLoading] = useState(true);

  /* вход */
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  /* добавление вещи */
  const [adding, setAdding] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    type: "",
    color: "",
    season: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* стилист */
  const [occasion, setOccasion] = useState("");
  const [wish, setWish] = useState("");
  const [building, setBuilding] = useState(false);
  const [outfit, setOutfit] = useState<{
    items: OutfitItem[];
    explanation: string;
  } | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("clothes")
      .select("id, name, category, type, color, season, brand, image_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setClothes((data as Clothing[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  /* ---------- вход ---------- */

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href },
    });

    setSending(false);
    setMessage(
      error ? `Ошибка: ${error.message}` : "Проверьте почту — там ссылка для входа"
    );
  }

  /* ---------- добавление вещи ---------- */

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      await analyze(base64);
    };
    reader.readAsDataURL(file);
  }

  async function analyze(base64: string) {
    setAnalyzing(true);
    try {
      const res = await fetch(`${API_URL}/analyze-clothing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await res.json();

      if (data?.success && data.result) {
        setForm({
          name: data.result.name ?? "",
          category: data.result.category ?? "",
          type: data.result.type ?? "",
          color: data.result.color ?? "",
          season: data.result.season ?? "",
        });
      }
    } catch {
      setMessage("Не удалось распознать. Заполните поля вручную.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveItem() {
    if (!user || !form.name.trim()) return;

    setSending(true);

    let imageUrl: string | null = null;

    if (preview) {
      const blob = await (await fetch(preview)).blob();
      const fileName = `${user.id}/${Date.now()}.jpg`;

      const { error: upErr } = await supabase.storage
        .from("clothes")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (!upErr) {
        const { data } = supabase.storage.from("clothes").getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }
    }

    await supabase.from("clothes").insert({
      user_id: user.id,
      name: form.name.trim(),
      category: form.category.trim(),
      type: form.type.trim(),
      color: form.color.trim(),
      season: form.season.trim(),
      image_url: imageUrl,
    });

    setForm({ name: "", category: "", type: "", color: "", season: "" });
    setPreview(null);
    setAdding(false);
    setSending(false);
    await load();
  }

  /* ---------- подбор образа ---------- */

  async function buildOutfit() {
    if (!occasion.trim()) {
      setMessage("Напишите, куда собираетесь");
      return;
    }

    setBuilding(true);
    setOutfit(null);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/stylist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: "male",
          clothes,
          occasion: occasion.trim(),
          wish: wish.trim(),
          weather: null,
        }),
      });

      const data = await res.json();

      if (data?.success && data.result?.items?.length) {
        setOutfit({
          items: data.result.items,
          explanation: data.result.explanation ?? "",
        });
      } else {
        setMessage(data?.error ?? "Не удалось собрать образ");
      }
    } catch {
      setMessage("Сервер недоступен. Попробуйте позже.");
    } finally {
      setBuilding(false);
    }
  }

  /* ============================================================ */

  if (authLoading || loading) {
    return (
      <Shell>
        <p className="text-center text-muted py-20">Загрузка…</p>
      </Shell>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <div className="rounded-2xl border border-line bg-white p-8 text-center">
          <p className="font-medium text-ink">Supabase не настроен</p>
        </div>
      </Shell>
    );
  }

  /* ---------- не авторизован ---------- */

  if (!user) {
    return (
      <Shell>
        <div className="max-w-md mx-auto pt-10">
          <h1 className="font-heading text-3xl font-bold text-ink text-center">
            Wardrobe AI
          </h1>
          <p className="text-muted text-center mt-3">
            Войдите тем же email, что и в приложении — гардероб общий
          </p>

          <form
            onSubmit={signIn}
            className="mt-8 rounded-3xl border border-line bg-white p-7"
          >
            <label className="block text-xs font-semibold tracking-wider text-muted mb-2">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="вы@почта.ру"
              className="w-full py-3 rounded-xl border border-line bg-cream px-4
                         outline-none focus:border-clay transition"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 mt-4 rounded-xl bg-ink text-white font-semibold
                         hover:bg-ink/90 transition disabled:opacity-50"
            >
              {sending ? "Отправляем…" : "Получить ссылку"}
            </button>
            <p className="text-xs text-muted text-center mt-4">
              Пароль не нужен — вход по ссылке из письма
            </p>
          </form>

          {message ? (
            <p className="text-center text-sm text-muted mt-5">{message}</p>
          ) : null}
        </div>
      </Shell>
    );
  }

  /* ---------- приложение ---------- */

  return (
    <Shell>
      {/* шапка */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">
            {tab === "wardrobe" ? "Гардероб" : "AI Стилист"}
          </h1>
          <p className="text-muted text-sm mt-0.5">
            {tab === "wardrobe"
              ? `${clothes.length} вещей`
              : "Подберу образ из ваших вещей"}
          </p>
        </div>

        <Link
          href="/account/"
          className="w-10 h-10 rounded-xl bg-clay/15 flex items-center justify-center
                     text-clay font-bold hover:bg-clay/25 transition"
        >
          {(user.email ?? "?").charAt(0).toUpperCase()}
        </Link>
      </div>

      {/* вкладки */}
      <div className="flex gap-2 mt-6 p-1 rounded-2xl bg-white border border-line">
        {(
          [
            ["wardrobe", "Гардероб"],
            ["stylist", "Стилист"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
              tab === id ? "bg-ink text-white" : "text-muted hover:bg-cream"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ===== ГАРДЕРОБ ===== */}
      {tab === "wardrobe" ? (
        <>
          <button
            onClick={() => setAdding(!adding)}
            className="w-full py-3.5 mt-5 rounded-2xl bg-ink text-white font-semibold
                       hover:bg-ink/90 transition"
          >
            {adding ? "Отменить" : "Добавить вещь"}
          </button>

          {adding ? (
            <div className="mt-4 rounded-3xl border border-line bg-white p-6">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFile}
                className="hidden"
              />

              <button
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-video rounded-2xl bg-cream border border-line
                           flex flex-col items-center justify-center gap-2
                           hover:bg-clay/5 transition overflow-hidden"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <span className="text-3xl">📷</span>
                    <span className="text-sm text-muted">
                      Сфотографировать или выбрать
                    </span>
                  </>
                )}
              </button>

              {analyzing ? (
                <p className="text-center text-sm text-clay-dark mt-4">
                  ИИ распознаёт вещь…
                </p>
              ) : null}

              <div className="mt-5 space-y-3">
                {(
                  [
                    ["name", "Название"],
                    ["category", "Категория"],
                    ["type", "Тип"],
                    ["color", "Цвет"],
                    ["season", "Сезон"],
                  ] as [keyof typeof form, string][]
                ).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold tracking-wider text-muted mb-1.5">
                      {label.toUpperCase()}
                    </label>
                    <input
                      value={form[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      className="w-full py-2.5 rounded-xl border border-line bg-cream px-3.5
                                 outline-none focus:border-clay transition text-sm"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={saveItem}
                disabled={sending || !form.name.trim()}
                className="w-full py-3.5 mt-5 rounded-xl bg-ink text-white font-semibold
                           hover:bg-ink/90 transition disabled:opacity-40"
              >
                {sending ? "Сохраняем…" : "Сохранить"}
              </button>
            </div>
          ) : null}

          {clothes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl">👕</p>
              <p className="font-medium text-ink mt-4">Гардероб пуст</p>
              <p className="text-muted text-sm mt-1">
                Добавьте первую вещь
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-5">
              {clothes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-line bg-white overflow-hidden"
                >
                  <div className="aspect-square bg-cream">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        👕
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-ink text-sm truncate">
                      {item.name}
                    </p>
                    <p className="text-muted text-xs mt-0.5 truncate">
                      {[item.type, item.color].filter(Boolean).join(" · ") ||
                        "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ===== СТИЛИСТ ===== */
        <>
          <div className="mt-5 rounded-3xl border border-line bg-white p-6">
            <label className="block text-xs font-semibold tracking-wider text-muted mb-2">
              КУДА СОБИРАЕТЕСЬ
            </label>
            <input
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="Например: ужин в ресторане"
              className="w-full py-3 rounded-xl border border-line bg-cream px-4
                         outline-none focus:border-clay transition"
            />

            <label className="block text-xs font-semibold tracking-wider text-muted mb-2 mt-4">
              ПОЖЕЛАНИЯ
            </label>
            <textarea
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder="Например: хочу выглядеть дорого"
              rows={3}
              className="w-full py-3 rounded-xl border border-line bg-cream px-4
                         outline-none focus:border-clay transition resize-none"
            />

            <button
              onClick={buildOutfit}
              disabled={building || clothes.length === 0}
              className="w-full py-3.5 mt-5 rounded-xl bg-ink text-white font-semibold
                         hover:bg-ink/90 transition disabled:opacity-40"
            >
              {building ? "Собираем образ…" : "Собрать образ"}
            </button>

            {clothes.length === 0 ? (
              <p className="text-xs text-muted text-center mt-3">
                Сначала добавьте вещи в гардероб
              </p>
            ) : null}
          </div>

          {outfit ? (
            <div className="mt-5 rounded-3xl border border-line bg-white p-6">
              <h3 className="font-heading font-bold text-ink text-lg">
                Ваш образ
              </h3>

              <div className="mt-4 space-y-3">
                {outfit.items.map((piece, i) => (
                  <div
                    key={`${piece.id}-${i}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-cream"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0">
                      {piece.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={piece.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          ✦
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink text-sm truncate">
                        {piece.name}
                      </p>
                      <p className="text-muted text-xs truncate">
                        {[piece.type, piece.color].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {outfit.explanation ? (
                <div className="mt-5 p-4 rounded-2xl bg-clay/5">
                  <p className="text-xs font-semibold text-clay-dark">
                    ПОЧЕМУ ЭТО РАБОТАЕТ
                  </p>
                  <p className="text-sm text-ink/80 mt-2 leading-relaxed">
                    {outfit.explanation}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}

      {message ? (
        <p className="text-center text-sm text-muted mt-5">{message}</p>
      ) : null}

      {/* подсказка про рабочий стол */}
      <InstallHint />
    </Shell>
  );
}

/* ============================================================
   ПОДСКАЗКА «ДОБАВИТЬ НА РАБОЧИЙ СТОЛ»
   ============================================================ */

function InstallHint() {
  const [hidden, setHidden] = useState(true);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // не показываем, если уже запущено как приложение
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;

    const dismissed = localStorage.getItem("installHintDismissed");
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

    setIsIos(ios);
    setHidden(standalone || dismissed === "1");
  }, []);

  if (hidden) return null;

  return (
    <div className="mt-8 rounded-2xl border border-clay/30 bg-clay/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink text-sm">
            Добавьте на рабочий стол
          </p>
          <p className="text-muted text-xs mt-1.5 leading-relaxed">
            {isIos
              ? "Нажмите «Поделиться» внизу экрана → «На экран „Домой“». Приложение будет открываться со своей иконкой, без адресной строки."
              : "Меню браузера (три точки) → «Установить приложение». Wardrobe AI появится среди других приложений."}
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.setItem("installHintDismissed", "1");
            setHidden(true);
          }}
          className="shrink-0 text-muted hover:text-ink transition text-lg leading-none"
          aria-label="Скрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ОБОЛОЧКА
   ============================================================ */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cream px-5 py-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-ink
                     transition mb-6 text-sm font-medium"
        >
          <span>←</span>
          <span>На главную</span>
        </Link>

        {children}
      </div>
    </main>
  );
}
