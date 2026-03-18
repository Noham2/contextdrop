import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return createBrowserClient(
      'http://localhost:54321',
      'placeholder-anon-key'
    );
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
