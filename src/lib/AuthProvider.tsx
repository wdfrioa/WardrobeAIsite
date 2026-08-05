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
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isPremium: false,
  refresh: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile((data as unknown as Profile) ?? null);
  }, []);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const {
      data: { user: current },
    } = await supabase.auth.getUser();

    if (current) {
      setUser({ id: current.id, email: current.email });
      await loadProfile(current.id);
    } else {
      setUser(null);
      setProfile(null);
    }

    setLoading(false);
  }, [loadProfile]);

  useEffect(() => {
    refresh();

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
