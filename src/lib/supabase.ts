import { createClient } from "@supabase/supabase-js";

/**
 * ============================================================
 *  SUPABASE КЛИЕНТ ДЛЯ САЙТА
 * ============================================================
 *
 *  Здесь используется ТОЛЬКО публичный anon-ключ — его безопасно
 *  держать в коде фронтенда, он защищён политиками RLS.
 *
 *  ⚠️ service_role ключ сюда класть НЕЛЬЗЯ НИКОГДА:
 *  сайт статический, ключ утечёт в браузер и любой сможет
 *  выдать себе Premium.
 *
 *  Переменные задаются:
 *   - локально — в файле .env.local
 *   - на GitHub — в Settings → Secrets and variables → Actions
 * ============================================================
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Настроен ли Supabase. Позволяет собрать сайт даже без ключей. */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "Supabase не настроен: проверьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Плейсхолдеры нужны, чтобы `next build` не падал, если переменных нет.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
