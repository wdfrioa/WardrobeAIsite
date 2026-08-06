"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * ============================================================
 *  ГЛОБАЛЬНАЯ АВТОРИЗАЦИЯ САЙТА
 * ============================================================
 *
 *  Оборачивает всё приложение в src/app/layout.tsx, поэтому
 *  и Header, и страницы видят одно и то же состояние входа.
 *
 *    const { user, isPremium, isAdmin, loading } = useAuth();
 * ============================================================
 */

export interface Profile {
  id: string;
  email: string | null;
  is_premium: boolean;
  premium_source: string | null;
  premium_expires_at: string | null;
  role: string;
  is_beta: boolean;

  /** Поля из supabase/profile-fields.sql */
  name: string | null;
  avatar_url: string | null;
  gender: string | null;
}

interface AuthValue {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  isBeta: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isPremium: false,
  isBeta: false,
  refresh: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile((data as unknown as Profile) ?? null);
    } catch {
      // Профиль не пришёл — не страшно, приложение работает
      // с настройками по умолчанию
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      /*
       * getSession() читает сессию из localStorage и НЕ ходит в сеть.
       * getUser() каждый раз спрашивал сервер — на медленном мобильном
       * интернете запрос мог висеть минутами, и экран застревал
       * на «Загрузка…». На Wi-Fi это было незаметно.
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const current = session?.user;

      if (current) {
        setUser({ id: current.id, email: current.email });
        // Профиль грузим в фоне: без него интерфейс уже можно показать
        loadProfile(current.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch {
      // Нет связи — покажем экран входа, а не вечную загрузку
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    /*
     * Страховка от вечной «Загрузки…».
     *
     * Если сеть очень медленная или запрос завис, через 8 секунд
     * снимаем блокировку и показываем интерфейс. Пользователь
     * увидит экран входа и сможет попробовать снова — это лучше,
     * чем бесконечный спиннер.
     */
    const failsafe = setTimeout(() => setLoading(false), 8000);

    refresh().finally(() => clearTimeout(failsafe));

    if (!isSupabaseConfigured) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refresh, loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const isPremium = Boolean(
    profile?.is_premium &&
      (!profile.premium_expires_at ||
        new Date(profile.premium_expires_at).getTime() > Date.now())
  );

  const value = useMemo<AuthValue>(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === "admin",
      isPremium,
      isBeta: Boolean(profile?.is_beta),
      refresh,
      signOut,
    }),
    [user, profile, loading, isPremium, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  return useContext(AuthContext);
}
