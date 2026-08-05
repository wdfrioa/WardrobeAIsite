"use client";

import { useEffect, useRef, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthProvider";

/**
 * ============================================================
 *  АККАУНТ — РЕДАКТИРОВАНИЕ ПРОФИЛЯ
 * ============================================================
 *
 *  Положить в:  src/components/AccountEditor.tsx
 *
 *  Точная копия экрана «Аккаунт» из приложения:
 *   - аватар с кнопкой камеры, «Нажмите, чтобы сменить фото»
 *   - поле ИМЯ
 *   - поле EMAIL (заблокировано, с замочком)
 *   - выбор пола: две карточки, активная чёрная с галочкой
 *   - кнопка «Сохранить изменения»
 *   - блок БЕЗОПАСНОСТЬ: смена пароля, удаление аккаунта
 *
 *  Пол сохраняется в profiles.gender и передаётся в AI-стилист,
 *  чтобы он не предлагал мужчинам платья.
 *
 *  ⚠️ Требует SQL-скрипт supabase/profile-fields.sql —
 *     он добавляет колонки name, avatar_url, gender
 *     и бакет avatars.
 * ============================================================
 */

type Gender = "male" | "female";

export default function AccountEditor({ onBack }: { onBack: () => void }) {
  const { user, profile, refresh } = useAuth();

  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [avatar, setAvatar] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const email = user?.email ?? "";

  /* ---------- подставляем текущие значения ---------- */

  useEffect(() => {
    const p = profile as any;
    if (!p) return;

    setName(p.name ?? (email ? email.split("@")[0] : ""));
    setGender(p.gender === "female" ? "female" : "male");
    setAvatar(p.avatar_url ?? null);
  }, [profile, email]);

  /* ---------- загрузка фото ---------- */

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setMessage("");

    try {
      // Каждый файл в своей папке по id пользователя —
      // так политика доступа пускает только владельца.
      const path = `${user.id}/${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { contentType: file.type, upsert: true });

      if (error) {
        setMessage("Не удалось загрузить фото");
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatar(data.publicUrl);

      // Сохраняем сразу, чтобы фото не потерялось при уходе с экрана
      await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);

      await refresh();
    } finally {
      setUploading(false);
    }
  }

  /* ---------- сохранение ---------- */

  async function save() {
    if (!user) return;

    if (!name.trim()) {
      setMessage("Введите имя");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), gender })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      setMessage("Не удалось сохранить. Попробуйте ещё раз.");
      return;
    }

    await refresh();
    setMessage("Изменения сохранены");
    setTimeout(() => setMessage(""), 2500);
  }

  /* ---------- смена пароля ---------- */

  async function changePassword() {
    if (!email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setMessage(
      error
        ? "Не удалось отправить письмо"
        : "Письмо отправлено — проверьте почту"
    );
  }

  /* ---------- удаление аккаунта ---------- */

  function deleteAccount() {
    setMessage(
      "Напишите нам, и мы удалим аккаунт вместе со всеми данными в течение суток."
    );
  }

  const letter = (name || email || "?").charAt(0).toUpperCase();

  return (
    <div
      style={{ backgroundColor: "#F8F7F4" }}
      className="-mx-5 -mt-6 px-6 pt-6 pb-28"
    >
      {/* ---------- шапка ---------- */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center
                     text-3xl hover:opacity-60 transition"
          style={{ color: "#18181B" }}
          aria-label="Назад"
        >
          ‹
        </button>

        <h1
          className="font-heading font-extrabold flex-1 text-center pr-10"
          style={{ fontSize: 24, color: "#18181B" }}
        >
          Аккаунт
        </h1>
      </div>

      {/* ---------- аватар ---------- */}
      <div className="flex flex-col items-center mt-6">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          className="hidden"
        />

        <button
          onClick={() => fileRef.current?.click()}
          className="relative hover:opacity-90 transition"
          disabled={uploading}
        >
          <div
            className="rounded-full overflow-hidden flex items-center
                       justify-center font-bold"
            style={{
              width: 116,
              height: 116,
              backgroundColor: "#E7E5E4",
              color: "#5E5CE6",
              fontSize: 44,
            }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              letter
            )}
          </div>

          <span
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full
                       bg-white flex items-center justify-center text-base
                       shadow-md"
          >
            📷
          </span>
        </button>

        <p className="mt-3" style={{ fontSize: 15, color: "#71717A" }}>
          {uploading ? "Загружаем…" : "Нажмите, чтобы сменить фото"}
        </p>
      </div>

      {/* ---------- имя ---------- */}
      <FieldLabel>ИМЯ</FieldLabel>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ваше имя"
        className="w-full bg-white outline-none border border-transparent
                   focus:border-clay/40 transition"
        style={{
          borderRadius: 18,
          padding: "18px 20px",
          fontSize: 17,
          color: "#18181B",
        }}
      />

      {/* ---------- email ---------- */}
      <FieldLabel>EMAIL</FieldLabel>
      <div
        className="w-full flex items-center gap-3"
        style={{
          borderRadius: 18,
          padding: "18px 20px",
          backgroundColor: "#EFEEEB",
        }}
      >
        <span className="flex-1 truncate" style={{ fontSize: 17, color: "#71717A" }}>
          {email}
        </span>
        <span className="text-lg shrink-0">🔒</span>
      </div>

      {/* ---------- пол ---------- */}
      <FieldLabel>ПОЛ</FieldLabel>
      <div className="flex gap-3">
        <GenderCard
          symbol="♂"
          label="Мужской"
          active={gender === "male"}
          onClick={() => setGender("male")}
        />
        <GenderCard
          symbol="♀"
          label="Женский"
          active={gender === "female"}
          onClick={() => setGender("female")}
        />
      </div>

      {/* ---------- сохранить ---------- */}
      <button
        onClick={save}
        disabled={saving}
        className="w-full font-bold transition hover:opacity-90
                   disabled:opacity-50 mt-5"
        style={{
          borderRadius: 20,
          padding: "20px",
          backgroundColor: "#18181B",
          color: "#FFFFFF",
          fontSize: 17,
        }}
      >
        {saving ? "Сохраняем…" : "Сохранить изменения"}
      </button>

      {message ? (
        <p
          className="text-center mt-4"
          style={{ fontSize: 14, color: "#5E5CE6" }}
        >
          {message}
        </p>
      ) : null}

      {/* ---------- безопасность ---------- */}
      <FieldLabel>БЕЗОПАСНОСТЬ</FieldLabel>

      <button
        onClick={changePassword}
        className="w-full bg-white flex items-center text-left
                   hover:bg-black/[0.02] transition"
        style={{ borderRadius: 18, padding: "18px 20px" }}
      >
        <span className="flex-1">
          <span
            className="block font-bold"
            style={{ fontSize: 17, color: "#18181B" }}
          >
            Сменить пароль
          </span>
          <span
            className="block mt-0.5"
            style={{ fontSize: 14, color: "#A1A1AA" }}
          >
            Отправим ссылку на вашу почту
          </span>
        </span>
        <span style={{ fontSize: 22, color: "#A1A1AA" }}>›</span>
      </button>

      <button
        onClick={deleteAccount}
        className="w-full flex items-center text-left mt-3
                   hover:opacity-80 transition"
        style={{
          borderRadius: 18,
          padding: "18px 20px",
          backgroundColor: "#FDF2F2",
        }}
      >
        <span className="flex-1">
          <span
            className="block font-bold"
            style={{ fontSize: 17, color: "#DC2626" }}
          >
            Удалить аккаунт
          </span>
          <span
            className="block mt-0.5"
            style={{ fontSize: 14, color: "#DC2626", opacity: 0.6 }}
          >
            Необратимое действие
          </span>
        </span>
        <span style={{ fontSize: 22, color: "#DC2626", opacity: 0.5 }}>›</span>
      </button>
    </div>
  );
}

/* ============================================================
   ЭЛЕМЕНТЫ
   ============================================================ */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-bold tracking-wider mt-7 mb-2.5"
      style={{ fontSize: 13, color: "#A1A1AA" }}
    >
      {children}
    </p>
  );
}

function GenderCard({
  symbol,
  label,
  active,
  onClick,
}: {
  symbol: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 relative flex flex-col items-center transition
                 hover:opacity-90"
      style={{
        borderRadius: 22,
        paddingTop: 26,
        paddingBottom: 22,
        backgroundColor: active ? "#18181B" : "#FFFFFF",
      }}
    >
      {active ? (
        <span
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white
                     flex items-center justify-center"
          style={{ fontSize: 13, color: "#18181B" }}
        >
          ✓
        </span>
      ) : null}

      <span
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: active ? "#2A2A2E" : "#F1F0EE",
          fontSize: 26,
          color: active ? "#FFFFFF" : "#18181B",
        }}
      >
        {symbol}
      </span>

      <span
        className="font-bold mt-3"
        style={{ fontSize: 17, color: active ? "#FFFFFF" : "#18181B" }}
      >
        {label}
      </span>
    </button>
  );
}
