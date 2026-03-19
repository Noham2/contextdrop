import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  if (typeof window === 'undefined') return null as any;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('[Debug] URL:', url);
  console.log('[Debug] Key prefix:', key?.substring(0, 15));

  if (!url || !url.startsWith('http')) {
    console.error('[Debug] URL invalide:', url);
    return null as any;
  }

  return createBrowserClient(url, key!);
}
