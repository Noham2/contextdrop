import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { sendBriefCompletedEmail } from "@/lib/emails";
import type { BriefData } from "@/lib/storage";

// GET /api/projects/[id] — public read (for brief client page, no auth required)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("projects")
      .select("id, name, status, brief_data, notes")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      status: data.status,
      briefData: data.brief_data ?? null,
      notes: data.notes ?? "",
    });
  } catch (err) {
    console.error("[GET /api/projects/[id]]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/projects/[id] — delete a project (auth required)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/projects/[id]]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/projects/[id] — save completed brief (no auth) or update notes (auth)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // notes update — requires auth
    if ("notes" in body) {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const { error } = await supabase
        .from("projects")
        .update({ notes: body.notes })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    const { briefData }: { briefData: BriefData } = body;

    if (!briefData || !briefData.objective) {
      return NextResponse.json({ error: "briefData invalide" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Update project status and brief data
    const { data: project, error } = await admin
      .from("projects")
      .update({ status: "completed", brief_data: briefData })
      .eq("id", id)
      .select("name, user_id")
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "Mise à jour échouée" }, { status: 500 });
    }

    // Send brief completed email to the freelance owner
    try {
      const { data: userData } = await admin.auth.admin.getUserById(project.user_id);
      const ownerEmail = userData?.user?.email;
      if (ownerEmail) {
        await sendBriefCompletedEmail(ownerEmail, project.name, briefData);
      }
    } catch (emailErr) {
      // Don't fail the request if email sending fails
      console.error("[PATCH /api/projects/[id]] Email error:", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/projects/[id]]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
