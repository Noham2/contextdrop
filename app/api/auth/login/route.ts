import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { email, password, mode } = await req.json();
  const supabase = await createServerSupabaseClient();

  if (mode === "signup") {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${req.nextUrl.origin}/dashboard` },
    });
    if (error) return NextResponse.json({ error: error.message, status: error.status }, { status: 400 });
    return NextResponse.json({ session: !!data.session, user: data.user ? { email: data.user.email } : null });
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message, status: error.status }, { status: 401 });
  return NextResponse.json({ ok: true });
}
