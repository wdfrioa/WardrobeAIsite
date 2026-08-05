"use client";

import { useMemo, useState } from "react";

/**
 * ============================================================
 *  КАЛЕНДАРЬ ОБРАЗОВ — КАК В ПРИЛОЖЕНИИ
 * ============================================================
 *
 *  Положить в:  src/components/WebCalendar.tsx
 *
 *  Повторяет экран из приложения:
 *   - бейдж PREMIUM в правом верхнем углу
 *   - сетка месяца с листанием ‹ ›
 *   - выходные приглушены, выбранный день чёрный кружок
 *   - точка под днём, если на него уже создан образ
 *   - карточка выбранного дня: время, событие, пожелания
 *   - список ближайших событий с миниатюрами вещей
 *
 *  Собственный календарь вместо <input type="date"> — тот
 *  вылезал за границы блока в Safari на iOS и выглядел
 *  чужеродно рядом с остальным интерфейсом.
 * ============================================================
 */

export interface PlannedOutfit {
  id: string;
  date: string;
  time: string;
  event: string;
  items: { id: string; name: string; image_url?: string | null }[];
}

const WEEKDAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

/** Дата в формате YYYY-MM-DD без сдвига часового пояса. */
function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function WebCalendar({
  planned,
  building,
  error,
  onBuild,
  onOpen,
  onBack,
}: {
  planned: PlannedOutfit[];
  building: boolean;
  error: string;
  onBuild: (date: string, time: string, event: string, wish: string) => void;
  onOpen: (outfit: PlannedOutfit) => void;
  onBack: () => void;
}) {
  const today = new Date();

  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selected, setSelected] = useState(() => toKey(today));

  const [time, setTime] = useState("09:00");
  const [editingTime, setEditingTime] = useState(false);
  const [event, setEvent] = useState("");
  const [wish, setWish] = useState("");

  /** Дни месяца с пустыми клетками в начале. */
  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    const first = new Date(year, month, 1);
    // В JS неделя начинается с воскресенья — сдвигаем на понедельник
    const shift = (first.getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = Array(shift).fill(null);
    for (let d = 1; d <= total; d += 1) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  }, [cursor]);

  /** Даты, на которые уже есть образ — под ними точка. */
  const markedDates = useMemo(
    () => new Set(planned.map((p) => p.date)),
    [planned]
  );

  /** Ближайшие события, отсортированные по дате. */
  const upcoming = useMemo(() => {
    const now = toKey(new Date());
    return planned
      .filter((p) => p.date >= now)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 6);
  }, [planned]);

  const selectedDate = new Date(`${selected}T12:00:00`);

  const selectedLabel = selectedDate.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });

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
        style={{ fontSize: 34, color: "#18181B", lineHeight: 1.1 }}
      >
        Календарь образов
      </h1>

      <p className="mt-3" style={{ fontSize: 16, color: "#71717A", lineHeight: 1.5 }}>
        Выберите день и время, опишите событие — AI соберёт образ из вашего
        гардероба.
      </p>

      {/* ---------- сетка месяца ---------- */}
      <div className="mt-6 bg-white p-5" style={{ borderRadius: 28 }}>
        <div className="flex items-center justify-between">
          <ArrowButton
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
            label="Предыдущий месяц"
          >
            ‹
          </ArrowButton>

          <p className="font-bold" style={{ fontSize: 17, color: "#18181B" }}>
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </p>

          <ArrowButton
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
            label="Следующий месяц"
          >
            ›
          </ArrowButton>
        </div>

        <div className="grid grid-cols-7 gap-y-1 mt-5">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className="text-center font-bold"
              style={{
                fontSize: 12,
                color: i >= 5 ? "#C9A68C" : "#A1A1AA",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2 mt-3">
          {days.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;

            const key = toKey(date);
            const isSelected = key === selected;
            const isPast = key < toKey(today);
            const isWeekend = [5, 6].includes((date.getDay() + 6) % 7);

            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className="relative h-11 flex flex-col items-center justify-center
                           transition"
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center
                             justify-center font-semibold transition"
                  style={{
                    fontSize: 16,
                    backgroundColor: isSelected ? "#18181B" : "transparent",
                    color: isSelected
                      ? "#FFFFFF"
                      : isPast
                        ? "#D4D4D8"
                        : isWeekend
                          ? "#71717A"
                          : "#18181B",
                  }}
                >
                  {date.getDate()}
                </span>

                {markedDates.has(key) && !isSelected ? (
                  <span
                    className="absolute bottom-0 w-1 h-1 rounded-full"
                    style={{ backgroundColor: "#18181B" }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- карточка выбранного дня ---------- */}
      <div className="mt-4 bg-white p-6" style={{ borderRadius: 28 }}>
        <p
          className="font-bold first-letter:uppercase"
          style={{ fontSize: 19, color: "#18181B" }}
        >
          {selectedLabel}
        </p>

        {/* время */}
        <SectionLabel>ВРЕМЯ</SectionLabel>
        {editingTime ? (
          <input
            type="time"
            value={time}
            autoFocus
            onChange={(e) => setTime(e.target.value)}
            onBlur={() => setEditingTime(false)}
            className="w-full outline-none border border-transparent
                       focus:border-clay/40 transition"
            style={{
              borderRadius: 16,
              padding: "16px 20px",
              backgroundColor: "#F4F3F1",
              fontSize: 22,
              fontWeight: 800,
              color: "#18181B",
            }}
          />
        ) : (
          <button
            onClick={() => setEditingTime(true)}
            className="w-full flex items-center justify-between
                       hover:opacity-80 transition"
            style={{
              borderRadius: 16,
              padding: "16px 20px",
              backgroundColor: "#F4F3F1",
            }}
          >
            <span
              className="font-extrabold"
              style={{ fontSize: 24, color: "#18181B" }}
            >
              {time}
            </span>
            <span style={{ fontSize: 15, color: "#A1A1AA" }}>изменить</span>
          </button>
        )}

        {/* событие */}
        <SectionLabel>СОБЫТИЕ</SectionLabel>
        <textarea
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          placeholder="Например: ужин в ресторане с друзьями"
          rows={2}
          className="w-full outline-none border border-transparent
                     focus:border-clay/40 transition resize-none"
          style={{
            borderRadius: 16,
            padding: "16px 20px",
            backgroundColor: "#F4F3F1",
            fontSize: 16,
            color: "#18181B",
          }}
        />

        {/* пожелания */}
        <SectionLabel>ПОЖЕЛАНИЯ</SectionLabel>
        <textarea
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          placeholder="Например: хочу выглядеть дорого, но не слишком официально"
          rows={2}
          className="w-full outline-none border border-transparent
                     focus:border-clay/40 transition resize-none"
          style={{
            borderRadius: 16,
            padding: "16px 20px",
            backgroundColor: "#F4F3F1",
            fontSize: 16,
            color: "#18181B",
          }}
        />

        <button
          onClick={() => onBuild(selected, time, event, wish)}
          disabled={building}
          className="w-full font-bold transition hover:opacity-90
                     disabled:opacity-50 mt-5"
          style={{
            borderRadius: 20,
            padding: 20,
            backgroundColor: "#18181B",
            color: "#FFFFFF",
            fontSize: 17,
          }}
        >
          {building ? "Собираем образ…" : "Создать образ"}
        </button>

        {error ? (
          <p
            className="text-center mt-4"
            style={{ fontSize: 14, color: "#DC2626" }}
          >
            {error}
          </p>
        ) : null}
      </div>

      {/* ---------- ближайшие события ---------- */}
      {upcoming.length > 0 ? (
        <>
          <p
            className="font-bold tracking-wider mt-8 mb-3"
            style={{ fontSize: 13, color: "#A1A1AA" }}
          >
            БЛИЖАЙШИЕ СОБЫТИЯ
          </p>

          <div className="bg-white overflow-hidden" style={{ borderRadius: 28 }}>
            {upcoming.map((item, i) => (
              <button
                key={item.id}
                onClick={() => onOpen(item)}
                className="w-full flex items-start gap-4 p-5 text-left
                           hover:bg-black/[0.02] transition"
                style={{
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: "#F1F1F1",
                  borderTopStyle: "solid",
                }}
              >
                <div className="shrink-0" style={{ width: 54 }}>
                  <p
                    className="font-extrabold"
                    style={{ fontSize: 17, color: "#18181B" }}
                  >
                    {item.time}
                  </p>
                  <p style={{ fontSize: 13, color: "#A1A1AA" }}>
                    {formatShortDate(item.date)}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="font-bold truncate"
                    style={{ fontSize: 16, color: "#18181B" }}
                  >
                    {item.event}
                  </p>

                  <div className="flex gap-2 mt-2">
                    {item.items.slice(0, 4).map((piece, index) => (
                      <div
                        key={`${piece.id}-${index}`}
                        className="rounded-xl overflow-hidden shrink-0"
                        style={{
                          width: 44,
                          height: 44,
                          backgroundColor: "#F4F3F1",
                        }}
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
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p
            className="text-center mt-4"
            style={{ fontSize: 13, color: "#A1A1AA" }}
          >
            Нажмите, чтобы открыть образ
          </p>
        </>
      ) : null}
    </div>
  );
}

/* ============================================================
   ЭЛЕМЕНТЫ
   ============================================================ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-bold tracking-wider mt-5 mb-2"
      style={{ fontSize: 12, color: "#A1A1AA" }}
    >
      {children}
    </p>
  );
}

function ArrowButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-10 h-10 rounded-full flex items-center justify-center
                 hover:bg-black/[0.04] transition"
      style={{ fontSize: 22, color: "#18181B", backgroundColor: "#F4F3F1" }}
    >
      {children}
    </button>
  );
}

/** «13.08» — короткая дата для списка событий. */
function formatShortDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}.${month}`;
}
