import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window === 'undefined') {
    // Server/build side — return null, never called at runtime
    return null as any;
  }
  if (!client) {
    console.log('[Supabase] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[Supabase] KEY prefix:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20));
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
