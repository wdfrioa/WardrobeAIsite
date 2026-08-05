"use client";

/**
 * ============================================================
 *  AI STYLIST — КАК В ПРИЛОЖЕНИИ
 * ============================================================
 *
 *  Положить в:  src/components/WebStylist.tsx
 *
 *  Повторяет экран из приложения:
 *   - крупный заголовок «AI Stylist»
 *   - подзаголовок в две строки
 *   - белая карточка-подсказка со звёздочкой и примерами
 *   - поля «Событие» и «Пожелания»
 *   - тёмная кнопка «✨ Создать образ»
 *
 *  Готовый образ показывается ниже формы.
 * ============================================================
 */

export interface OutfitPiece {
  id: string;
  name: string;
  type?: string | null;
  color?: string | null;
  image_url?: string | null;
}

export default function WebStylist({
  occasion,
  wish,
  building,
  error,
  outfit,
  disabled,
  onOccasion,
  onWish,
  onBuild,
}: {
  occasion: string;
  wish: string;
  building: boolean;
  error: string;
  outfit: { items: OutfitPiece[]; explanation: string } | null;
  disabled: boolean;
  onOccasion: (v: string) => void;
  onWish: (v: string) => void;
  onBuild: () => void;
}) {
  return (
    <div className="pb-28">
      {/* ---------- заголовок ---------- */}
      <h1
        className="font-heading font-extrabold"
        style={{ fontSize: 34, color: "#18181B", lineHeight: 1.1 }}
      >
        AI Stylist
      </h1>

      <p className="mt-3" style={{ fontSize: 16, color: "#71717A", lineHeight: 1.5 }}>
        Опиши куда ты собираешься, а ИИ сам подберёт лучший образ.
      </p>

      {/* ---------- карточка-подсказка ---------- */}
      <div className="mt-6 bg-white p-7" style={{ borderRadius: 28 }}>
        <p style={{ fontSize: 40, lineHeight: 1 }}>✨</p>

        <p
          className="font-extrabold mt-5"
          style={{ fontSize: 23, color: "#18181B" }}
        >
          Куда вы собираетесь?
        </p>

        <p className="mt-3" style={{ fontSize: 16, color: "#71717A", lineHeight: 1.55 }}>
          Напишите любое место или событие. Например: • свадьба • концерт •
          свидание • офис • море • отпуск • собеседование
        </p>
      </div>

      {/* ---------- событие ---------- */}
      <p
        className="font-extrabold mt-7 mb-3"
        style={{ fontSize: 20, color: "#18181B" }}
      >
        Событие
      </p>
      <input
        value={occasion}
        onChange={(e) => onOccasion(e.target.value)}
        placeholder="Например: свадьба друга"
        className="w-full bg-white outline-none border border-transparent
                   focus:border-clay/40 transition"
        style={{
          borderRadius: 20,
          padding: "20px 22px",
          fontSize: 16,
          color: "#18181B",
        }}
      />

      {/* ---------- пожелания ---------- */}
      <p
        className="font-extrabold mt-6 mb-3"
        style={{ fontSize: 20, color: "#18181B" }}
      >
        Пожелания
      </p>
      <textarea
        value={wish}
        onChange={(e) => onWish(e.target.value)}
        placeholder="Например: хочу выглядеть дорого, современно и минималистично"
        rows={3}
        className="w-full bg-white outline-none border border-transparent
                   focus:border-clay/40 transition resize-none"
        style={{
          borderRadius: 20,
          padding: "20px 22px",
          fontSize: 16,
          color: "#18181B",
        }}
      />

      {/* ---------- кнопка ---------- */}
      <button
        onClick={onBuild}
        disabled={building || disabled}
        className="w-full font-bold transition hover:opacity-90
                   disabled:opacity-40 mt-6"
        style={{
          borderRadius: 22,
          padding: 20,
          backgroundColor: "#1B2333",
          color: "#FFFFFF",
          fontSize: 18,
        }}
      >
        {building ? "Собираем образ…" : "✨ Создать образ"}
      </button>

      {disabled ? (
        <p
          className="text-center mt-3"
          style={{ fontSize: 14, color: "#A1A1AA" }}
        >
          Сначала добавьте вещи в гардероб
        </p>
      ) : null}

      {error ? (
        <p
          className="text-center mt-4"
          style={{ fontSize: 14, color: "#DC2626" }}
        >
          {error}
        </p>
      ) : null}

      {/* ---------- готовый образ ---------- */}
      {outfit ? (
        <div className="mt-6 bg-white p-6" style={{ borderRadius: 28 }}>
          <p
            className="font-extrabold"
            style={{ fontSize: 20, color: "#18181B" }}
          >
            Ваш образ
          </p>

          <div className="mt-4 space-y-3">
            {outfit.items.map((piece, i) => (
              <div
                key={`${piece.id}-${i}`}
                className="flex items-center gap-3 p-3"
                style={{ borderRadius: 18, backgroundColor: "#F4F3F1" }}
              >
                <div
                  className="rounded-xl overflow-hidden shrink-0 bg-white"
                  style={{ width: 56, height: 56 }}
                >
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
                  <p
                    className="font-bold truncate"
                    style={{ fontSize: 15, color: "#18181B" }}
                  >
                    {piece.name}
                  </p>
                  <p className="truncate" style={{ fontSize: 13, color: "#A1A1AA" }}>
                    {[piece.type, piece.color].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {outfit.explanation ? (
            <div
              className="mt-5 p-4"
              style={{ borderRadius: 18, backgroundColor: "#EEEAFE" }}
            >
              <p
                className="font-bold tracking-wider"
                style={{ fontSize: 12, color: "#5E5CE6" }}
              >
                ПОЧЕМУ ЭТО РАБОТАЕТ
              </p>
              <p
                className="mt-2"
                style={{ fontSize: 15, color: "#27272A", lineHeight: 1.5 }}
              >
                {outfit.explanation}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
