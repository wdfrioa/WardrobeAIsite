"use client";

import { useState } from "react";

/**
 * ============================================================
 *  СБОР ЧЕМОДАНА
 * ============================================================
 *
 *  Положить в:  src/components/WebPacking.tsx
 *
 *  Раньше здесь была заглушка «Скоро появится». Теперь работает
 *  полностью: город, число ночей, повод — и AI собирает список
 *  вещей на всю поездку.
 *
 *  Погода берётся в городе назначения, а не в текущем: собирая
 *  чемодан в Сочи из Москвы, важна сочинская погода.
 *
 *  Список — чек-лист: отмечаешь то, что уже положил в сумку.
 * ============================================================
 */

const API_URL = "https://ksdflortwbpimuknwpka.supabase.co/functions/v1";

interface Clothing {
  id: string;
  name: string;
  category: string | null;
  type: string | null;
  color: string | null;
  image_url: string | null;
}

interface TripWeather {
  city: string;
  minTemp: number;
  maxTemp: number;
  description: string;
  willRain: boolean;
  isForecast: boolean;
}

interface Result {
  items: Clothing[];
  explanation: string;
  tips: string[];
  weather: TripWeather | null;
}

export default function WebPacking({
  clothes,
  gender,
  onBack,
}: {
  clothes: Clothing[];
  gender: string;
  onBack: () => void;
}) {
  const [city, setCity] = useState("");
  const [nights, setNights] = useState("5");
  const [purpose, setPurpose] = useState("");

  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  /** Что уже положено в чемодан. */
  const [packed, setPacked] = useState<Set<string>>(new Set());

  async function build() {
    if (!city.trim()) {
      setError("Укажите город");
      return;
    }

    setBuilding(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/packing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          // Картинки не отправляем: серверу нужны только названия
          clothes: clothes.map((c) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            type: c.type,
            color: c.color,
          })),
          city: city.trim(),
          nights: Number(nights) || 3,
          purpose: purpose.trim(),
        }),
      });

      const data = await res.json();

      if (data?.success && data.result?.items?.length) {
        // Возвращаем картинки на место по id
        const items = data.result.items.map((item: any) => {
          const full = clothes.find((c) => String(c.id) === String(item.id));
          return full ? { ...item, image_url: full.image_url } : item;
        });

        setResult({ ...data.result, items });
        setPacked(new Set());
      } else {
        setError(data?.error ?? "Не удалось собрать чемодан");
      }
    } catch {
      setError("Сервер недоступен. Проверьте интернет.");
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
        Сбор чемодана
      </h1>

      <p className="mt-2" style={{ fontSize: 14, color: "#71717A", lineHeight: 1.5 }}>
        Скажите куда и насколько — AI подберёт вещи под погоду в этом городе.
      </p>

      {/* ---------- форма ---------- */}
      <div className="mt-5 bg-white p-5" style={{ borderRadius: 22 }}>
        <Label>КУДА ЕДЕТЕ</Label>
        <Input
          value={city}
          onChange={setCity}
          placeholder="Например: Сочи"
        />

        <Label>СКОЛЬКО НОЧЕЙ</Label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNights(String(Math.max(Number(nights) - 1, 1)))}
            className="w-11 h-11 rounded-xl flex items-center justify-center
                       text-xl font-bold hover:opacity-70 transition"
            style={{ backgroundColor: "#F4F3F1", color: "#18181B" }}
          >
            −
          </button>

          <input
            type="number"
            min={1}
            max={30}
            value={nights}
            onChange={(e) => setNights(e.target.value)}
            className="flex-1 text-center outline-none border border-transparent
                       focus:border-clay/40 transition"
            style={{
              borderRadius: 16,
              padding: "12px 0",
              backgroundColor: "#F4F3F1",
              fontSize: 18,
              fontWeight: 800,
              color: "#18181B",
            }}
          />

          <button
            onClick={() => setNights(String(Math.min(Number(nights) + 1, 30)))}
            className="w-11 h-11 rounded-xl flex items-center justify-center
                       text-xl font-bold hover:opacity-70 transition"
            style={{ backgroundColor: "#F4F3F1", color: "#18181B" }}
          >
            +
          </button>
        </div>

        <Label>ПОВОД</Label>
        <Input
          value={purpose}
          onChange={setPurpose}
          placeholder="Например: отпуск на море"
        />

        <button
          onClick={build}
          disabled={building || clothes.length === 0}
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
          {building ? "Собираем чемодан…" : "🧳 Собрать чемодан"}
        </button>

        {clothes.length === 0 ? (
          <p className="text-center mt-3" style={{ fontSize: 13, color: "#A1A1AA" }}>
            Сначала добавьте вещи в гардероб
          </p>
        ) : null}

        {error ? (
          <p className="text-center mt-4" style={{ fontSize: 14, color: "#DC2626" }}>
            {error}
          </p>
        ) : null}
      </div>

      {/* ---------- погода в городе ---------- */}
      {result?.weather ? (
        <div className="mt-4 bg-white p-4" style={{ borderRadius: 18 }}>
          <p className="font-bold" style={{ fontSize: 14, color: "#18181B" }}>
            Погода: {result.weather.city}
          </p>
          <p className="mt-1" style={{ fontSize: 13.5, color: "#71717A" }}>
            от {result.weather.minTemp}° до {result.weather.maxTemp}°,{" "}
            {result.weather.description}
            {result.weather.willRain ? " · возможен дождь" : ""}
          </p>
          {!result.weather.isForecast ? (
            <p className="mt-1.5" style={{ fontSize: 12, color: "#A1A1AA" }}>
              Поездка далеко — показана климатическая норма, не точный прогноз
            </p>
          ) : null}
        </div>
      ) : null}

      {/* ---------- список вещей ---------- */}
      {result ? (
        <div className="mt-4 bg-white p-5" style={{ borderRadius: 22 }}>
          <div className="flex items-center justify-between">
            <p className="font-extrabold" style={{ fontSize: 17, color: "#18181B" }}>
              Что взять
            </p>
            <span style={{ fontSize: 13.5, color: "#A1A1AA" }}>
              {packed.size} из {result.items.length}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {result.items.map((item, i) => {
              const done = packed.has(String(item.id));

              return (
                <button
                  key={`${item.id}-${i}`}
                  onClick={() => toggle(String(item.id))}
                  className="w-full flex items-center gap-3 p-2.5 text-left
                             transition hover:opacity-80"
                  style={{ borderRadius: 15, backgroundColor: "#F4F3F1" }}
                >
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center
                               text-xs shrink-0 border-2"
                    style={{
                      backgroundColor: done ? "#18181B" : "transparent",
                      borderColor: done ? "#18181B" : "#D4D4D8",
                      color: "#FFFFFF",
                    }}
                  >
                    {done ? "✓" : ""}
                  </span>

                  <div
                    className="rounded-xl overflow-hidden shrink-0 bg-white"
                    style={{ width: 44, height: 44 }}
                  >
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
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
                    className="flex-1 min-w-0 truncate"
                    style={{
                      fontSize: 14,
                      color: done ? "#A1A1AA" : "#18181B",
                      textDecoration: done ? "line-through" : "none",
                    }}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          {result.explanation ? (
            <div
              className="mt-5 p-4"
              style={{ borderRadius: 16, backgroundColor: "#EEEAFE" }}
            >
              <p
                className="font-bold tracking-wider"
                style={{ fontSize: 11.5, color: "#5E5CE6" }}
              >
                ПОЧЕМУ ИМЕННО ЭТО
              </p>
              <p
                className="mt-2"
                style={{ fontSize: 14, color: "#27272A", lineHeight: 1.5 }}
              >
                {result.explanation}
              </p>
            </div>
          ) : null}

          {result.tips.length > 0 ? (
            <div className="mt-4">
              <p
                className="font-bold tracking-wider mb-2"
                style={{ fontSize: 11.5, color: "#A1A1AA" }}
              >
                СОВЕТЫ
              </p>
              {result.tips.map((tip, i) => (
                <p
                  key={i}
                  className="flex gap-2 mt-1.5"
                  style={{ fontSize: 13.5, color: "#71717A", lineHeight: 1.5 }}
                >
                  <span style={{ color: "#5E5CE6" }}>•</span>
                  <span>{tip}</span>
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   ЭЛЕМЕНТЫ
   ============================================================ */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-bold tracking-wider mt-5 mb-2 first:mt-0"
      style={{ fontSize: 12, color: "#A1A1AA" }}
    >
      {children}
    </p>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
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
  );
}
