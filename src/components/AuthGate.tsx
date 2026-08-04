"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase";

/**
 * ============================================================
 *  ВХОД ПО ПОЧТЕ И ПАРОЛЮ
 * ============================================================
 *
 *  Почему пароль, а не код и не ссылка из письма:
 *
 *  1. Письма Supabase на бесплатном плане отправляются ТОЛЬКО
 *     на адреса участников проекта, лимит — 2 письма в час,
 *     а шаблон письма на новых бесплатных проектах менять нельзя.
 *     Значит ни ссылка, ни код обычному пользователю не дойдут.
 *
 *  2. На iPhone приложение с рабочего стола и Safari — это два
 *     РАЗНЫХ хранилища. Ссылка из письма открывается в Safari,
 *     сессия остаётся там, а в приложении «не вошёл».
 *
 *  Пароль решает обе проблемы сразу: писем не нужно вообще,
 *  вход происходит прямо в приложении, аккаунт тот же самый,
 *  что и в мобильном приложении Wardrobe AI.
 *
 *  ⚠️ ОБЯЗАТЕЛЬНО в Supabase:
 *     Authentication → Sign In / Providers → Email
 *     выключить «Confirm email»
 *     иначе после регистрации Supabase будет ждать письмо.
 * ============================================================
 */

type Mode = "login" | "register";

/** Переводит английские ошибки Supabase на человеческий русский. */
function ru(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("invalid login credentials")) {
    return "Неверная почта или пароль";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "Эта почта уже зарегистрирована — войдите с паролем";
  }
  if (m.includes("email not confirmed")) {
    return "Почта не подтверждена. Выключите «Confirm email» в Supabase";
  }
  if (m.includes("password should be at least")) {
    return "Пароль слишком короткий — минимум 6 символов";
  }
  if (m.includes("unable to validate email") || m.includes("invalid email")) {
    return "Проверьте адрес почты";
  }
  if (m.includes("email address not authorized")) {
    return "Supabase не может отправить письмо на этот адрес. Нужен вход по паролю";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Слишком много попыток. Подождите минуту";
  }
  if (m.includes("failed to fetch") || m.includes("network")) {
    return "Нет связи с сервером. Проверьте интернет";
  }

  return message;
}

export default function AuthGate({ title }: { title?: string }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const mail = email.trim().toLowerCase();

    if (!mail || !password) {
      setError("Заполните почту и пароль");
      return;
    }

    if (mode === "register" && password.length < 6) {
      setError("Пароль слишком короткий — минимум 6 символов");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: mail,
        password,
      });

      setBusy(false);

      if (err) {
        setError(ru(err.message));
        return;
      }
      // при успехе AuthProvider сам подхватит сессию
      return;
    }

    /* ---------- регистрация ---------- */

    const { data, error: err } = await supabase.auth.signUp({
      email: mail,
      password,
    });

    if (err) {
      setBusy(false);
      setError(ru(err.message));
      return;
    }

    // Если «Confirm email» выключен — Supabase сразу отдаёт сессию.
    if (data.session) {
      setBusy(false);
      return;
    }

    // Сессии нет: либо включено подтверждение почты, либо пользователь
    // уже существовал. Пробуем войти обычным способом.
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: mail,
      password,
    });

    setBusy(false);

    if (signInErr) {
      setNotice(
        "Аккаунт создан. Если вход не произошёл — подтвердите почту по ссылке из письма и войдите снова."
      );
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-heading text-3xl font-bold text-ink text-center">
        {title ?? (isLogin ? "Вход" : "Регистрация")}
      </h1>

      <p className="text-muted text-center mt-3">
        {isLogin
          ? "Тот же аккаунт, что и в приложении"
          : "Один аккаунт для сайта и приложения"}
      </p>

      <form
        onSubmit={submit}
        className="mt-8 rounded-3xl border border-line bg-white p-7"
      >
        {/* ---------- переключатель Вход / Регистрация ---------- */}
        <div className="flex p-1 rounded-xl bg-cream border border-line mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setNotice("");
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              isLogin ? "bg-white text-ink shadow-sm" : "text-muted"
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
              setNotice("");
            }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              !isLogin ? "bg-white text-ink shadow-sm" : "text-muted"
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* ---------- почта ---------- */}
        <label className="block text-xs font-semibold tracking-wider text-muted mb-2">
          ПОЧТА
        </label>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="вы@почта.ру"
          className="w-full py-3 rounded-xl border border-line bg-cream px-4
                     outline-none focus:border-clay transition"
        />

        {/* ---------- пароль ---------- */}
        <label className="block text-xs font-semibold tracking-wider text-muted mb-2 mt-5">
          ПАРОЛЬ
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isLogin ? "Ваш пароль" : "Минимум 6 символов"}
            className="w-full py-3 rounded-xl border border-line bg-cream px-4 pr-16
                       outline-none focus:border-clay transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-xs font-semibold text-muted hover:text-ink transition"
          >
            {showPassword ? "Скрыть" : "Показать"}
          </button>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full py-3.5 mt-6 rounded-xl bg-ink text-white font-semibold
                     hover:bg-ink/90 transition disabled:opacity-50"
        >
          {busy
            ? "Подождите…"
            : isLogin
              ? "Войти"
              : "Создать аккаунт"}
        </button>

        {error ? (
          <p className="text-sm text-red-600 text-center mt-4">{error}</p>
        ) : null}

        {notice ? (
          <p className="text-sm text-clay-dark text-center mt-4 leading-relaxed">
            {notice}
          </p>
        ) : null}

        <p className="text-xs text-muted/70 text-center mt-6 leading-relaxed">
          {isLogin
            ? "Нет аккаунта? Нажмите «Регистрация» — это займёт 10 секунд"
            : "Пароль нужен, чтобы входить и на сайте, и в приложении"}
        </p>
      </form>

      <p className="text-xs text-muted/70 text-center mt-5 leading-relaxed">
        Забыли пароль? Напишите нам — восстановим доступ вручную
      </p>
    </div>
  );
}
