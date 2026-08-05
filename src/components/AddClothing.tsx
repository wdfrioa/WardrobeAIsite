"use client";

import { useRef, useState } from "react";

import { supabase } from "@/lib/supabase";

/**
 * ============================================================
 *  ДОБАВИТЬ ВЕЩЬ — ОТДЕЛЬНЫЙ ЭКРАН
 * ============================================================
 *
 *  Положить в:  src/components/AddClothing.tsx
 *
 *  Повторяет экран из приложения:
 *   - заголовок «Добавить вещь» + подпись про ИИ
 *   - большая карточка выбора фото
 *   - поля: Название, Категория, Тип одежды, Цвет, Сезон
 *   - подсказка под Категорией
 *   - кнопка «💾 Сохранить вещь»
 *
 *  Что добавлено сверх приложения:
 *
 *  1. Выбор нескольких фото сразу (multiple).
 *     ИИ обрабатывает их по очереди, пользователь видит прогресс.
 *
 *  2. Две кнопки источника: камера и галерея.
 *     На телефоне capture="environment" открывает камеру сразу,
 *     без него — галерею. Раньше был только один вариант.
 *
 *  Когда выбрано несколько фото, поля не показываются: вещи
 *  сохраняются автоматически с тем, что распознал ИИ. Заполнять
 *  пять полей двадцать раз подряд никто не станет.
 * ============================================================
 */

const API_URL = "https://ksdflortwbpimuknwpka.supabase.co/functions/v1";

interface Form {
  name: string;
  category: string;
  type: string;
  color: string;
  season: string;
}

const EMPTY: Form = { name: "", category: "", type: "", color: "", season: "" };

const FIELDS: { key: keyof Form; label: string; placeholder: string; hint?: string }[] = [
  { key: "name", label: "Название", placeholder: "Например: Белая рубашка" },
  {
    key: "category",
    label: "Категория",
    placeholder: "Например: Верх, Низ, Обувь, Аксессуары",
    hint: "ИИ заполнит поле сам — при желании исправьте вручную",
  },
  { key: "type", label: "Тип одежды", placeholder: "Например: Футболка, Рубашка" },
  { key: "color", label: "Цвет", placeholder: "Например: Белый" },
  { key: "season", label: "Сезон", placeholder: "Например: Демисезон" },
];

export default function AddClothing({
  userId,
  onDone,
}: {
  userId: string;
  onDone: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);

  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  /** Пакетная загрузка: сколько обработано из скольких. */
  const [batch, setBatch] = useState<{ done: number; total: number } | null>(
    null
  );

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  /* ============================================================
     РАСПОЗНАВАНИЕ
     ============================================================ */

  /** Отправить фото в ИИ и получить описание вещи. */
  async function analyze(base64: string): Promise<Partial<Form>> {
    try {
      const res = await fetch(`${API_URL}/analyze-clothing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();

      if (data?.success && data.result) {
        return {
          name: data.result.name ?? "",
          category: data.result.category ?? "",
          type: data.result.type ?? "",
          color: data.result.color ?? "",
          season: data.result.season ?? "",
        };
      }
    } catch {
      // Не страшно — пользователь заполнит поля руками
    }

    return {};
  }

  /** Прочитать файл в base64. */
  function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /** Загрузить картинку в Storage и вернуть публичную ссылку. */
  async function uploadImage(base64: string): Promise<string | null> {
    try {
      const blob = await (await fetch(base64)).blob();
      const fileName = `${userId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.jpg`;

      const { error } = await supabase.storage
        .from("clothes")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (error) return null;

      const { data } = supabase.storage.from("clothes").getPublicUrl(fileName);
      return data.publicUrl;
    } catch {
      return null;
    }
  }

  /* ============================================================
     ВЫБОР ФАЙЛОВ
     ============================================================ */

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Сбрасываем input, чтобы можно было выбрать те же файлы снова
    e.target.value = "";
    setMessage("");

    if (files.length === 1) {
      await handleSingle(files[0]);
      return;
    }

    await handleMany(files);
  }

  /** Одно фото — показываем форму для проверки перед сохранением. */
  async function handleSingle(file: File) {
    const base64 = await readFile(file);

    setPreview(base64);
    setAnalyzing(true);

    const result = await analyze(base64);
    setForm({ ...EMPTY, ...result });

    setAnalyzing(false);
  }

  /**
   * Несколько фото — обрабатываем по очереди и сохраняем сразу.
   *
   * Последовательно, а не параллельно: так виден честный прогресс
   * и не создаётся десяток одновременных запросов к ИИ.
   */
  async function handleMany(files: File[]) {
    setBatch({ done: 0, total: files.length });

    let saved = 0;

    for (let i = 0; i < files.length; i += 1) {
      const base64 = await readFile(files[i]);

      const [result, imageUrl] = await Promise.all([
        analyze(base64),
        uploadImage(base64),
      ]);

      const name = result.name?.trim() || `Вещь ${i + 1}`;

      const { error } = await supabase.from("clothes").insert({
        user_id: userId,
        name,
        category: result.category ?? "",
        type: result.type ?? "",
        color: result.color ?? "",
        season: result.season ?? "",
        image_url: imageUrl,
      });

      if (!error) saved += 1;

      setBatch({ done: i + 1, total: files.length });
    }

    setBatch(null);
    setMessage(`Добавлено вещей: ${saved} из ${files.length}`);

    setTimeout(() => {
      onDone();
    }, 1200);
  }

  /* ============================================================
     СОХРАНЕНИЕ ОДНОЙ ВЕЩИ
     ============================================================ */

  async function save() {
    if (!form.name.trim()) {
      setMessage("Введите название вещи");
      return;
    }

    setSaving(true);
    setMessage("");

    const imageUrl = preview ? await uploadImage(preview) : null;

    const { error } = await supabase.from("clothes").insert({
      user_id: userId,
      name: form.name.trim(),
      category: form.category.trim(),
      type: form.type.trim(),
      color: form.color.trim(),
      season: form.season.trim(),
      image_url: imageUrl,
    });

    setSaving(false);

    if (error) {
      setMessage("Не удалось сохранить. Попробуйте ещё раз.");
      return;
    }

    setForm(EMPTY);
    setPreview(null);
    onDone();
  }

  /* ============================================================
     РАЗМЕТКА
     ============================================================ */

  // Пакетная обработка — показываем только прогресс
  if (batch) {
    return (
      <div className="pb-28">
        <div
          className="mt-10 bg-white p-10 text-center"
          style={{ borderRadius: 28 }}
        >
          <p style={{ fontSize: 52, lineHeight: 1 }}>✨</p>

          <p
            className="font-extrabold mt-6"
            style={{ fontSize: 22, color: "#18181B" }}
          >
            ИИ распознаёт вещи
          </p>

          <p className="mt-2" style={{ fontSize: 16, color: "#71717A" }}>
            {batch.done} из {batch.total}
          </p>

          <div
            className="mt-6 h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: "#EFEEEB" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(batch.done / batch.total) * 100}%`,
                backgroundColor: "#18181B",
              }}
            />
          </div>

          <p className="mt-5" style={{ fontSize: 14, color: "#A1A1AA" }}>
            Не закрывайте страницу
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      {/* ---------- заголовок ---------- */}
      <h1
        className="font-heading font-extrabold"
        style={{ fontSize: 34, color: "#18181B", lineHeight: 1.1 }}
      >
        Добавить вещь
      </h1>

      <p className="mt-2.5" style={{ fontSize: 16, color: "#71717A" }}>
        ИИ автоматически заполнит информацию
      </p>

      {/* скрытые input: камера и галерея */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFiles}
        className="hidden"
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFiles}
        className="hidden"
      />

      {/* ---------- карточка фото ---------- */}
      <div className="mt-6 bg-white overflow-hidden" style={{ borderRadius: 28 }}>
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              className="w-full object-cover"
              style={{ maxHeight: 340 }}
            />

            <button
              onClick={() => {
                setPreview(null);
                setForm(EMPTY);
              }}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white
                         flex items-center justify-center shadow-md
                         hover:bg-black/[0.04] transition"
              aria-label="Убрать фото"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => galleryRef.current?.click()}
            className="w-full flex flex-col items-center justify-center
                       hover:bg-black/[0.02] transition"
            style={{ paddingTop: 64, paddingBottom: 64 }}
          >
            <span style={{ fontSize: 52, lineHeight: 1 }}>📷</span>

            <span
              className="font-extrabold mt-5"
              style={{ fontSize: 21, color: "#18181B" }}
            >
              Добавить фотографию
            </span>

            <span className="mt-1.5" style={{ fontSize: 15, color: "#A1A1AA" }}>
              Нажмите чтобы выбрать изображение
            </span>
          </button>
        )}
      </div>

      {/* ---------- источник фото ---------- */}
      {!preview ? (
        <div className="flex gap-3 mt-3">
          <SourceButton
            emoji="🖼"
            label="Галерея"
            hint="Можно выбрать сразу несколько"
            onClick={() => galleryRef.current?.click()}
          />
          <SourceButton
            emoji="📸"
            label="Камера"
            hint="Сфотографировать вещь"
            onClick={() => cameraRef.current?.click()}
          />
        </div>
      ) : null}

      {analyzing ? (
        <p
          className="text-center mt-5"
          style={{ fontSize: 15, color: "#5E5CE6" }}
        >
          ИИ распознаёт вещь…
        </p>
      ) : null}

      {/* ---------- поля ---------- */}
      {FIELDS.map((field) => (
        <div key={field.key}>
          <p
            className="font-extrabold mt-6 mb-2.5"
            style={{ fontSize: 19, color: "#18181B" }}
          >
            {field.label}
          </p>

          <input
            value={form[field.key]}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            className="w-full bg-white outline-none border border-transparent
                       focus:border-clay/40 transition"
            style={{
              borderRadius: 20,
              padding: "19px 22px",
              fontSize: 16,
              color: "#18181B",
            }}
          />

          {field.hint ? (
            <p
              className="mt-2"
              style={{ fontSize: 14, color: "#A1A1AA", lineHeight: 1.4 }}
            >
              {field.hint}
            </p>
          ) : null}
        </div>
      ))}

      {/* ---------- сохранить ---------- */}
      <button
        onClick={save}
        disabled={saving || analyzing}
        className="w-full font-bold transition hover:opacity-90
                   disabled:opacity-40 mt-8"
        style={{
          borderRadius: 22,
          padding: 21,
          backgroundColor: "#1B2333",
          color: "#FFFFFF",
          fontSize: 18,
        }}
      >
        {saving ? "Сохраняем…" : "💾 Сохранить вещь"}
      </button>

      {message ? (
        <p
          className="text-center mt-4"
          style={{ fontSize: 15, color: "#5E5CE6" }}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

/* ============================================================
   КНОПКА ИСТОЧНИКА ФОТО
   ============================================================ */

function SourceButton({
  emoji,
  label,
  hint,
  onClick,
}: {
  emoji: string;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 bg-white flex flex-col items-center text-center
                 hover:bg-black/[0.02] transition"
      style={{ borderRadius: 22, paddingTop: 18, paddingBottom: 18 }}
    >
      <span style={{ fontSize: 26, lineHeight: 1 }}>{emoji}</span>

      <span
        className="font-bold mt-2"
        style={{ fontSize: 15, color: "#18181B" }}
      >
        {label}
      </span>

      <span
        className="mt-0.5 px-2"
        style={{ fontSize: 12, color: "#A1A1AA", lineHeight: 1.3 }}
      >
        {hint}
      </span>
    </button>
  );
}
