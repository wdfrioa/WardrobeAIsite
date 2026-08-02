"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase, isSupabaseConfigured } from "./supabase";

export interface Profile {
  id: string;
  email: string | null;
  is_premium: boolean;
  premium_source: string | null;
  premium_expires_at: string | null;
  role: string;
}

/**
 * Авторизация и профиль пользователя на сайте.
 *
 *   const { user, profile, isAdmin, isPremium, loading, signOut } = useAuth();
 */
export function useAuth() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, is_premium, premium_source, premium_expires_at, role")
      .eq("id", userId)
      .single();

    setProfile((data as Profile) ?? null);
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

    // Реакция на вход/выход и на возврат по magic link
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

  return {
    user,
    profile,
    loading,
    isAdmin: profile?.role === "admin",
    isPremium,
    refresh,
    signOut,
  };
}
