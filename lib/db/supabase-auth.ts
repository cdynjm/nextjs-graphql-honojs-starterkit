// lib/supabase-auth.ts
import { supabase } from "./supabase";

export async function registerSupabaseUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    throw new Error(error?.message || "Supabase signup failed");
  }

  return data.user.id;
}

export async function loginSupabaseUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    throw new Error(error?.message || "Supabase login failed");
  }

  return data.session.access_token;
}