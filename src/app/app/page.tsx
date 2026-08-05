"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";
import AuthGate from "@/components/AuthGate";
import WebProfile from "@/components/WebProfile";
import { getWeather, weatherEmoji, type Weather } from "@/lib/webWeather";

/**
 * ============================================================
 *  ВЕБ-ВЕРСИЯ ПРИЛОЖЕНИЯ  —  /app/
 * ============================================================
 *  Повторяет мобильную версию: гардероб, стилист, календарь,
 *  чемодан, профиль. Данные общие через Supabase.
 * ============================================================ */

/** Supabase Edge Functions — работают из России без VPN. */
const API_URL = "https://ksdflortwbpimuknwpka.supabase.co/functions/v1";

/**
 * Убрать картинки перед отправкой в AI.
 *
 * Замер: гардероб с фото весит ~1 МБ и грузится 54 секунды,
 * без фото — 2 КБ и 4 секунды. Серверу картинки не нужны,
 * он подбирает образ по названию и категории, возвращает id.
 */
function slim(clothes: Clothing[]) {
  return clothes.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    type: c.type,
    color: c.color,
    season: c.season,
  }));
}

/** Вернуть картинки обратно по id. */
function restore(items: OutfitItem[], clothes: Clothing[]): OutfitItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((it) => {
    const full = clothes.find((c) => String(c.id) === String(it?.id));
    return full ? { ...it, image_url: full.image_url ?? it.image_url } : it;
  });
}

interface Clothing {
  id: string;
  name: string;
  category: string | null;
  type: string | null;
  color: string | null;
  season: string | null;
  image_url: string | null;
}

interface OutfitItem {
  id: string;
  name: string;
  type?: string | null;
  color?: string | null;
  image_url?: string | null;
}

type Screen = "wardrobe" | "stylist" | "calendar" | "packing" | "profile";

/** Фильтры гардероба — как в мобильном приложении. */
const CATEGORIES = ["Все", "Верх", "Низ", "Обувь", "Аксессуары"];

export default function WebApp() {
  const { user, loading: authLoading, isPremium } = useAuth();

  const [screen, setScreen] = useState<Screen>("wardrobe");
  const [clothes, setClothes] = useState<Clothing[]>([]);
  const [loading, setLoading] = useState(true);

  // Погода берётся один раз наверху и передаётся во все экраны,
  // чтобы AI учитывал её при подборе.
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    getWeather().then(setWeather);
  }, []);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("clothes")
      .select("id, name, category, type, color, season, image_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setClothes((data as Clothing[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

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

  if (!user) {
    return (
      <Shell>
        <div className="pt-10">
          <AuthGate title="Wardrobe AI" />
          <p className="text-center text-xs text-muted/70 mt-6">
            Тот же аккаунт, что в приложении — гардероб общий
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {screen === "wardrobe" ? (
        <Wardrobe
          clothes={clothes}
          userId={user.id}
          email={user.email ?? ""}
          onReload={load}
          onNavigate={setScreen}
          premium={isPremium}
          weather={weather}
        />
      ) : null}

      {screen === "stylist" ? (
        <Stylist
          clothes={clothes}
          weather={weather}
          onBack={() => setScreen("wardrobe")}
        />
      ) : null}

      {screen === "calendar" ? (
        <Calendar
          clothes={clothes}
          premium={isPremium}
          weather={weather}
          onBack={() => setScreen("wardrobe")}
        />
      ) : null}

      {screen === "packing" ? (
        <Packing
          clothes={clothes}
          premium={isPremium}
          onBack={() => setScreen("wardrobe")}
        />
      ) : null}

      {screen === "profile" ? (
        <WebProfile
          email={user.email ?? ""}
          count={clothes.length}
          premium={isPremium}
          onBack={() => setScreen("wardrobe")}
        />
      ) : null}

      <InstallHint />
    </Shell>
  );
}

/* ============================================================
   ГАРДЕРОБ + КРУГЛЫЕ КНОПКИ
   ============================================================ */

function Wardrobe({
  clothes,
  userId,
  email,
  onReload,
  onNavigate,
  premium,
  weather,
}: {
  clothes: Clothing[];
  userId: string;
  email: string;
  onReload: () => void;
  onNavigate: (s: Screen) => void;
  premium: boolean;
  weather: Weather | null;
}) {
  /** Первая буква имени для аватара. */
  const avatarLetter = (email || "?").charAt(0).toUpperCase();
  const [adding, setAdding] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    type: "",
    color: "",
    season: "",
  });

  // Поиск и фильтр по категориям — как в мобильном приложении
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Все");

  const fileRef = useRef<HTMLInputElement>(null);

  /**
   * Отфильтрованный список.
   *
   * Поиск идёт по названию, типу и цвету — так пользователю
   * проще найти вещь, даже если он не помнит точное название.
   */
  const visible = clothes.filter((item) => {
    const byCategory =
      filter === "Все" ||
      (item.category ?? "").toLowerCase().includes(filter.toLowerCase());

    if (!byCategory) return false;

    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [item.name, item.type, item.color]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(query));
  });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
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
        /* заполнит вручную */
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);

    let imageUrl: string | null = null;

    if (preview) {
      const blob = await (await fetch(preview)).blob();
      const fileName = `${userId}/${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from("clothes")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (!error) {
        const { data } = supabase.storage.from("clothes").getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }
    }

    await supabase.from("clothes").insert({
      user_id: userId,
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
    setSaving(false);
    onReload();
  }

  async function remove(id: string) {
    await supabase.from("clothes").delete().eq("id", id);
    onReload();
  }

  return (
    <>
      {/* ---------- ШАПКА: название + аватар ---------- */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-[34px] leading-none font-extrabold text-ink">
            Wardrobe
          </h1>
          <p className="text-muted text-[15px] mt-2">Твоя коллекция одежды</p>
        </div>

        <button
          onClick={() => onNavigate("profile")}
          className="w-12 h-12 rounded-full overflow-hidden shrink-0
                     bg-clay/15 flex items-center justify-center
                     text-lg font-bold text-clay
                     hover:opacity-80 transition"
          aria-label="Профиль"
        >
          {avatarLetter}
        </button>
      </div>

      {/* ---------- ПОГОДА ---------- */}
      {weather ? (
        <div className="mt-6 rounded-3xl bg-white p-5 flex items-center gap-4">
          <span className="text-[42px] leading-none shrink-0">
            {weatherEmoji(weather.main)}
          </span>

          <div className="min-w-0">
            <p className="font-bold text-ink text-[17px] leading-tight">
              {weather.city || "Ваш город"}
            </p>

            <p className="mt-1 leading-tight">
              <span className="font-extrabold text-ink text-[22px]">
                {Math.round(weather.temperature)}°C
              </span>
              <span className="text-muted text-[15px]">
                {" "}
                (Ощущается как {Math.round(weather.feels)}°C)
              </span>
            </p>

            <p className="text-muted text-[15px] mt-1 leading-tight first-letter:uppercase">
              {weather.description}
            </p>
          </div>
        </div>
      ) : null}

      {/* ---------- ПОИСК ---------- */}
      <div className="mt-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по гардеробу…"
          className="w-full rounded-3xl bg-white px-6 py-4 text-[16px]
                     text-ink placeholder:text-muted/70
                     outline-none border border-transparent
                     focus:border-clay/40 transition"
        />
      </div>

      {/* ---------- ФИЛЬТРЫ ПО КАТЕГОРИЯМ ---------- */}
      <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1
                      [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((category) => {
          const active = filter === category;
          return (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-6 py-3 rounded-full text-[15px] font-semibold
                          shrink-0 transition ${
                            active
                              ? "bg-ink text-white"
                              : "bg-white text-ink hover:bg-black/[0.03]"
                          }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* форма добавления */}
      {adding ? (
        <div className="mt-5 rounded-3xl border border-line bg-white p-6">
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
              <img src={preview} alt="" className="w-full h-full object-cover" />
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
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full py-2.5 rounded-xl border border-line bg-cream px-3.5
                             outline-none focus:border-clay transition text-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={() => {
                setAdding(false);
                setPreview(null);
              }}
              className="flex-1 py-3 rounded-xl border border-line text-ink
                         font-medium hover:bg-cream transition"
            >
              Отмена
            </button>
            <button
              onClick={save}
              disabled={saving || !form.name.trim()}
              className="flex-1 py-3 rounded-xl bg-ink text-white font-semibold
                         hover:bg-ink/90 transition disabled:opacity-40"
            >
              {saving ? "Сохраняем…" : "Сохранить"}
            </button>
          </div>
        </div>
      ) : null}

      {/* ---------- СПИСОК ВЕЩЕЙ ---------- */}
      {clothes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl">👕</p>
          <p className="font-medium text-ink mt-4">Гардероб пуст</p>
          <p className="text-muted text-sm mt-1">
            Нажмите + и добавьте первую вещь
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl">🔍</p>
          <p className="font-medium text-ink mt-4">Ничего не найдено</p>
          <p className="text-muted text-sm mt-1">
            Попробуйте изменить запрос или категорию
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mt-5 pb-32">
          {visible.map((item) => (
            <div
              key={item.id}
              className="relative rounded-3xl bg-white overflow-hidden group"
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
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    👕
                  </div>
                )}
              </div>

              <button
                onClick={() => remove(item.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white
                           flex items-center justify-center text-base shadow-md
                           opacity-0 group-hover:opacity-100
                           max-md:opacity-100 transition"
                aria-label="Удалить"
              >
                🗑
              </button>

              <div className="p-4">
                <p className="font-bold text-ink text-[15px] leading-snug">
                  {item.name}
                </p>
                {[item.type, item.color].filter(Boolean).length > 0 ? (
                  <p className="text-muted text-[13px] mt-1 truncate">
                    {[item.type, item.color].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- БАННЕР «ОБРАЗЫ НА НЕДЕЛЮ» ---------- */}
      <button
        onClick={() => onNavigate("calendar")}
        className="fixed bottom-6 left-5 right-24 z-40 max-w-[calc(32rem-6rem)]
                   mx-auto md:left-auto md:right-24
                   flex items-center gap-3 rounded-3xl bg-ink
                   px-5 py-3.5 text-left shadow-xl
                   hover:bg-ink/90 transition"
      >
        <span className="text-2xl shrink-0">📅</span>

        <span className="min-w-0 flex-1">
          <span className="block font-bold text-white text-[15px] leading-tight">
            Образы на неделю
          </span>
          <span className="block text-white/60 text-[12px] leading-tight mt-0.5">
            AI составит комплекты на 7 дней
          </span>
        </span>

        <span className="text-white/60 text-xl shrink-0">›</span>
      </button>

      {/* ---------- КРУГЛЫЕ КНОПКИ ---------- */}
      <div className="fixed bottom-6 right-5 flex flex-col items-center gap-3 z-40">
        <Fab
          emoji="👤"
          label="Профиль"
          onClick={() => onNavigate("profile")}
          light
        />
        <Fab
          emoji="🧳"
          label="Чемодан"
          onClick={() => onNavigate("packing")}
          light
          pro={!premium}
        />
        <Fab
          emoji="📅"
          label="Календарь"
          onClick={() => onNavigate("calendar")}
          light
          pro={!premium}
        />
        <Fab
          emoji="✨"
          label="Стилист"
          onClick={() => onNavigate("stylist")}
          light
        />
        <Fab
          emoji="+"
          label="Добавить"
          onClick={() => setAdding(!adding)}
          big
        />
      </div>
    </>
  );
}

/** Круглая кнопка действия. */
function Fab({
  emoji,
  label,
  onClick,
  big,
  light,
  pro,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  big?: boolean;
  light?: boolean;
  pro?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`relative rounded-full flex items-center justify-center
                  shadow-lg transition hover:scale-105 active:scale-95
                  ${big ? "w-16 h-16 text-3xl" : "w-13 h-13 text-xl"}
                  ${light ? "bg-white border border-line" : "bg-ink text-white"}`}
      style={big ? undefined : { width: 52, height: 52 }}
    >
      <span>{emoji}</span>

      {pro ? (
        <span
          className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-md
                     bg-ink text-white text-[8px] font-bold tracking-wide"
        >
          PRO
        </span>
      ) : null}
    </button>
  );
}

/* ============================================================
   СТИЛИСТ
   ============================================================ */

function Stylist({
  clothes,
  weather,
  onBack,
}: {
  clothes: Clothing[];
  weather: Weather | null;
  onBack: () => void;
}) {
  const [occasion, setOccasion] = useState("");
  const [wish, setWish] = useState("");
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");
  const [outfit, setOutfit] = useState<{
    items: OutfitItem[];
    explanation: string;
  } | null>(null);

  async function build() {
    if (!occasion.trim()) {
      setError("Напишите, куда собираетесь");
      return;
    }

    setBuilding(true);
    setError("");
    setOutfit(null);

    try {
      const res = await fetch(`${API_URL}/stylist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: "male",
          clothes: slim(clothes),
          occasion: occasion.trim(),
          wish: wish.trim(),
          weather,
        }),
      });

      const data = await res.json();

      if (data?.success && data.result?.items?.length) {
        setOutfit({
          items: restore(data.result.items, clothes),
          explanation: data.result.explanation ?? "",
        });
      } else {
        setError(data?.error ?? "Не удалось собрать образ");
      }
    } catch {
      setError("Сервер недоступен. Попробуйте позже.");
    } finally {
      setBuilding(false);
    }
  }

  return (
    <>
      <ScreenHeader title="AI Стилист" subtitle="Образ из ваших вещей" onBack={onBack} />

      <div className="mt-5 rounded-3xl border border-line bg-white p-6">
        <Field
          label="КУДА СОБИРАЕТЕСЬ"
          value={occasion}
          onChange={setOccasion}
          placeholder="Например: ужин в ресторане"
        />
        <Field
          label="ПОЖЕЛАНИЯ"
          value={wish}
          onChange={setWish}
          placeholder="Например: хочу выглядеть дорого"
          textarea
        />

        <button
          onClick={build}
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

        {error ? (
          <p className="text-sm text-red-600 text-center mt-4">{error}</p>
        ) : null}
      </div>

      {outfit ? (
        <div className="mt-5 rounded-3xl border border-line bg-white p-6 mb-8">
          <h3 className="font-heading font-bold text-ink text-lg">Ваш образ</h3>

          <div className="mt-4 space-y-3">
            {outfit.items.map((piece, i) => (
              <ItemRow key={`${piece.id}-${i}`} item={piece} />
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
  );
}

/* ============================================================
   КАЛЕНДАРЬ
   ============================================================ */

function Calendar({
  clothes,
  premium,
  weather,
  onBack,
}: {
  clothes: Clothing[];
  premium: boolean;
  weather: Weather | null;
  onBack: () => void;
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [event, setEvent] = useState("");
  const [building, setBuilding] = useState(false);
  const [outfit, setOutfit] = useState<OutfitItem[] | null>(null);
  const [error, setError] = useState("");

  if (!premium) {
    return <PremiumLock title="Календарь образов" emoji="📅" onBack={onBack} />;
  }

  async function build() {
    if (!event.trim()) {
      setError("Опишите событие");
      return;
    }

    setBuilding(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/stylist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: "male",
          clothes: slim(clothes),
          occasion: `${event.trim()} (${date})`,
          wish: "Учти дату и время года.",
          weather,
        }),
      });

      const data = await res.json();

      if (data?.success && data.result?.items?.length) {
        setOutfit(restore(data.result.items, clothes));
      } else {
        setError(data?.error ?? "Не удалось собрать образ");
      }
    } catch {
      setError("Сервер недоступен");
    } finally {
      setBuilding(false);
    }
  }

  return (
    <>
      <ScreenHeader
        title="Календарь образов"
        subtitle="Планируйте наперёд"
        onBack={onBack}
      />

      <div className="mt-5 rounded-3xl border border-line bg-white p-6">
        <label className="block text-xs font-semibold tracking-wider text-muted mb-2">
          ДАТА
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          /*
           * appearance-none + min-w-0 + box-border лечат баг Safari на iOS:
           * поле type="date" имеет свой встроенный размер и вылезает
           * за границы блока, игнорируя ширину контейнера.
           */
          className="block w-full max-w-full min-w-0 box-border py-3
                     rounded-xl border border-line bg-cream px-4
                     appearance-none outline-none focus:border-clay transition
                     text-ink text-base"
          style={{ WebkitAppearance: "none" }}
        />

        <div className="mt-4">
          <Field
            label="СОБЫТИЕ"
            value={event}
            onChange={setEvent}
            placeholder="Например: собеседование"
          />
        </div>

        <button
          onClick={build}
          disabled={building}
          className="w-full py-3.5 mt-5 rounded-xl bg-ink text-white font-semibold
                     hover:bg-ink/90 transition disabled:opacity-40"
        >
          {building ? "Собираем…" : "Создать образ"}
        </button>

        {error ? (
          <p className="text-sm text-red-600 text-center mt-4">{error}</p>
        ) : null}
      </div>

      {outfit ? (
        <div className="mt-5 rounded-3xl border border-line bg-white p-6 mb-8">
          <p className="text-xs font-semibold text-muted">
            {new Date(date).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
            })}
          </p>
          <h3 className="font-heading font-bold text-ink text-lg mt-1">
            {event}
          </h3>

          <div className="mt-4 space-y-3">
            {outfit.map((piece, i) => (
              <ItemRow key={`${piece.id}-${i}`} item={piece} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ============================================================
   ЧЕМОДАН
   ============================================================ */

function Packing({
  clothes,
  premium,
  onBack,
}: {
  clothes: Clothing[];
  premium: boolean;
  onBack: () => void;
}) {
  const [city, setCity] = useState("");
  const [nights, setNights] = useState("5");
  const [purpose, setPurpose] = useState("");
  const [building, setBuilding] = useState(false);
  const [items, setItems] = useState<OutfitItem[] | null>(null);
  const [packed, setPacked] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  if (!premium) {
    return <PremiumLock title="Сбор чемодана" emoji="🧳" onBack={onBack} />;
  }

  async function build() {
    if (!city.trim() || !purpose.trim()) {
      setError("Заполните город и повод поездки");
      return;
    }

    setBuilding(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/stylist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: "male",
          clothes: slim(clothes),
          occasion: `Поездка в ${city.trim()} на ${nights} ночей. ${purpose.trim()}`,
          wish:
            "Подбери вещи на всю поездку, а не один образ. " +
            "Учти слои и универсальность вещей.",
          // Погода в чемодане своя — по городу назначения, не по текущему
          weather: null,
        }),
      });

      const data = await res.json();

      if (data?.success && data.result?.items?.length) {
        setItems(restore(data.result.items, clothes));
        setPacked(new Set());
      } else {
        setError(data?.error ?? "Не удалось собрать чемодан");
      }
    } catch {
      setError("Сервер недоступен");
    } finally {
      setBuilding(false);
    }
  }

  function toggle(id: string) {
    const next = new Set(packed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPacked(next);
  }

  return (
    <>
      <ScreenHeader
        title="Сбор чемодана"
        subtitle="Что взять в поездку"
        onBack={onBack}
      />

      <div className="mt-5 rounded-3xl border border-line bg-white p-6">
        <Field
          label="КУДА ЕДЕТЕ"
          value={city}
          onChange={setCity}
          placeholder="Например: Сочи"
        />

        <div className="mt-4">
          <label className="block text-xs font-semibold tracking-wider text-muted mb-2">
            НОЧЕЙ
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={nights}
            onChange={(e) => setNights(e.target.value)}
            className="w-full py-3 rounded-xl border border-line bg-cream px-4
                       outline-none focus:border-clay transition"
          />
        </div>

        <div className="mt-4">
          <Field
            label="ПОВОД"
            value={purpose}
            onChange={setPurpose}
            placeholder="Например: отпуск на море"
          />
        </div>

        <button
          onClick={build}
          disabled={building}
          className="w-full py-3.5 mt-5 rounded-xl bg-ink text-white font-semibold
                     hover:bg-ink/90 transition disabled:opacity-40"
        >
          {building ? "Собираем чемодан…" : "Собрать чемодан"}
        </button>

        {error ? (
          <p className="text-sm text-red-600 text-center mt-4">{error}</p>
        ) : null}
      </div>

      {items ? (
        <div className="mt-5 rounded-3xl border border-line bg-white p-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-ink text-lg">
              Что взять
            </h3>
            <span className="text-sm text-muted">
              {packed.size}/{items.length}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {items.map((piece, i) => {
              const done = packed.has(String(piece.id));
              return (
                <button
                  key={`${piece.id}-${i}`}
                  onClick={() => toggle(String(piece.id))}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl
                             bg-cream hover:bg-clay/5 transition text-left"
                >
                  <span
                    className={`w-6 h-6 rounded-lg border-2 flex items-center
                                justify-center text-xs shrink-0 ${
                                  done
                                    ? "bg-ink border-ink text-white"
                                    : "border-line"
                                }`}
                  >
                    {done ? "✓" : ""}
                  </span>

                  <div className="w-11 h-11 rounded-xl bg-white overflow-hidden shrink-0">
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

                  <span
                    className={`text-sm ${
                      done ? "text-muted line-through" : "text-ink"
                    }`}
                  >
                    {piece.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ============================================================
   ОБЩИЕ ЭЛЕМЕНТЫ
   ============================================================ */

function ScreenHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-xl border border-line bg-white
                   flex items-center justify-center text-xl hover:bg-cream transition"
        aria-label="Назад"
      >
        ‹
      </button>
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">{title}</h1>
        {subtitle ? (
          <p className="text-muted text-sm mt-0.5">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wider text-muted mb-2">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full py-3 rounded-xl border border-line bg-cream px-4
                     outline-none focus:border-clay transition resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full py-3 rounded-xl border border-line bg-cream px-4
                     outline-none focus:border-clay transition"
        />
      )}
    </div>
  );
}

function ItemRow({ item }: { item: OutfitItem }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-cream">
      <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">✦</div>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-ink text-sm truncate">{item.name}</p>
        <p className="text-muted text-xs truncate">
          {[item.type, item.color].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}

function PremiumLock({
  title,
  emoji,
  onBack,
}: {
  title: string;
  emoji: string;
  onBack: () => void;
}) {
  return (
    <>
      <ScreenHeader title={title} onBack={onBack} />

      <div className="mt-8 rounded-3xl border border-line bg-white p-8 text-center">
        <div
          className="w-20 h-20 rounded-3xl bg-clay/10 mx-auto
                     flex items-center justify-center text-4xl"
        >
          {emoji}
        </div>

        <h2 className="font-heading text-xl font-bold text-ink mt-6">
          Доступно в Premium
        </h2>
        <p className="text-muted text-sm mt-3 leading-relaxed">
          Оформите подписку, чтобы пользоваться этой функцией
        </p>

        <Link
          href="/account/"
          className="block w-full py-3.5 mt-6 rounded-xl bg-ink text-white
                     font-semibold hover:bg-ink/90 transition"
        >
          Получить Premium
        </Link>
      </div>
    </>
  );
}

/* ============================================================
   ПОДСКАЗКА ОБ УСТАНОВКЕ
   ============================================================ */

function InstallHint() {
  const [hidden, setHidden] = useState(true);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;

    const dismissed = localStorage.getItem("installHintDismissed");
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setHidden(standalone || dismissed === "1");
  }, []);

  if (hidden) return null;

  return (
    <div className="mt-8 mb-28 rounded-2xl border border-clay/30 bg-clay/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink text-sm">
            Добавьте на рабочий стол
          </p>
          <p className="text-muted text-xs mt-1.5 leading-relaxed">
            {isIos
              ? "Нажмите «Поделиться» внизу экрана → «На экран „Домой“»"
              : "Меню браузера (три точки) → «Установить приложение»"}
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
