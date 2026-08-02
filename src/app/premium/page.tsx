"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * ============================================================
 *  СТРАНИЦА ОПЛАТЫ PREMIUM
 * ============================================================
 *
 *  Путь: /premium  →  https://wdfrioa.github.io/WardrobeAIsite/premium/
 *
 *  Приложение открывает её со ссылкой:
 *    ?from=app&uid=<user id>&email=<email>&token=<access_token>
 *
 *  Сценарий:
 *   1. Если пришёл токен из приложения — сразу узнаём пользователя
 *   2. Если нет — предлагаем войти по email (magic link)
 *   3. Показываем тариф и кнопку оплаты
 *   4. После оплаты вызываем Edge Function grant-premium
 * ============================================================ */

/** Адрес вашей Edge Function. */
const GRANT_URL =
  "https://ВАШ-ПРОЕКТ.supabase.co/functions/v1/grant-premium";

function PremiumContent() {
  const params = useSearchParams();

  const uidFromApp = params.get("uid");
  const emailFromApp = params.get("email");
  const fromApp = params.get("from") === "app";

  const [email, setEmail] = useState(emailFromApp ?? "");
  const [userId, setUserId] = useState<string | null>(uidFromApp);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function init() {
    if (!isSupabaseConfigured) {
      setMessage("Supabase не настроен. Проверьте переменные окружения.");
      setLoading(false);
      return;
    }

    // Если пользователь уже вошёл на сайте — берём его сессию
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const id = user?.id ?? uidFromApp;

    if (id) {
      setUserId(id);
      if (user?.email) setEmail(user.email);
      await checkStatus(id);
    }

    setLoading(false);
  }

  async function checkStatus(id: string) {
    const { data } = await supabase
      .from("profiles")
      .select("is_premium, premium_expires_at")
      .eq("id", id)
      .single();

    if (data?.is_premium) {
      const notExpired =
        !data.premium_expires_at ||
        new Date(data.premium_expires_at).getTime() > Date.now();
      setIsPremium(notExpired);
    }
  }

  /** Вход по ссылке на почту — если пользователь пришёл не из приложения. */
  async function signIn() {
    if (!email.trim()) {
      setMessage("Введите email");
      return;
    }

    setSending(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.href,
      },
    });

    setSending(false);

    setMessage(
      error
        ? `Ошибка: ${error.message}`
        : "Мы отправили ссылку для входа на вашу почту."
    );
  }

  /**
   * Оплата.
   *
   * ⚠️ Сейчас это заглушка: она сразу вызывает выдачу Premium.
   * Когда подключите платёжку — сначала проводите оплату,
   * а grant-premium вызывайте из вебхука платёжной системы.
   */
  async function pay() {
    if (!userId) {
      setMessage("Сначала войдите в аккаунт");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      const response = await fetch(GRANT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userId, days: 30, source: "site" }),
      });

      const result = await response.json();

      if (result.success) {
        setIsPremium(true);
        setMessage("Premium активирован! Вернитесь в приложение.");
      } else {
        setMessage(`Не удалось активировать: ${result.error}`);
      }
    } catch {
      setMessage("Ошибка соединения. Попробуйте ещё раз.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <div className="text-white/60">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        {/* Заголовок */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-5">💎</div>
          <h1 className="text-3xl font-bold tracking-tight">
            Wardrobe AI Premium
          </h1>
          <p className="text-white/50 mt-3">
            Персональный AI-стилист без ограничений
          </p>
        </div>

        {/* Уже оформлено */}
        {isPremium ? (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="text-xl font-semibold">Premium активен</h2>
            <p className="text-white/60 mt-3 text-sm leading-relaxed">
              Вернитесь в приложение — все функции уже разблокированы.
            </p>
          </div>
        ) : (
          <>
            {/* Тариф */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 mb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">299</span>
                <span className="text-xl text-white/70">₽</span>
                <span className="text-white/40 text-sm ml-1">/ месяц</span>
              </div>

              <ul className="mt-7 space-y-3 text-sm">
                {[
                  "Образы на неделю",
                  "Сбор чемодана",
                  "Что купить",
                  "Более качественный AI-подбор",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Вход или оплата */}
            {userId ? (
              <>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 mb-4 text-sm">
                  <span className="text-white/40">Аккаунт: </span>
                  <span className="text-white/90">{email || userId}</span>
                </div>

                <button
                  onClick={pay}
                  disabled={sending}
                  className="w-full h-14 rounded-2xl bg-white text-black font-semibold
                             hover:bg-white/90 transition disabled:opacity-50"
                >
                  {sending ? "Обработка..." : "Оплатить 299 ₽"}
                </button>
              </>
            ) : (
              <>
                <p className="text-white/50 text-sm mb-3">
                  Войдите, чтобы привязать подписку к аккаунту
                </p>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ваш@email.com"
                  className="w-full h-14 rounded-2xl bg-white/5 border border-white/10
                             px-5 mb-3 outline-none focus:border-white/30 transition"
                />

                <button
                  onClick={signIn}
                  disabled={sending}
                  className="w-full h-14 rounded-2xl bg-white text-black font-semibold
                             hover:bg-white/90 transition disabled:opacity-50"
                >
                  {sending ? "Отправляем..." : "Войти по ссылке на почту"}
                </button>
              </>
            )}
          </>
        )}

        {message ? (
          <p className="text-center text-sm text-white/60 mt-5">{message}</p>
        ) : null}

        {fromApp ? (
          <p className="text-center text-xs text-white/30 mt-8">
            После оплаты просто вернитесь в приложение — статус обновится сам
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
          <div className="text-white/60">Загрузка...</div>
        </div>
      }
    >
      <PremiumContent />
    </Suspense>
  );
}
