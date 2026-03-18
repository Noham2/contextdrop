"use client";
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { downloadBriefPDF } from "@/lib/pdf";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { Logo } from "@/app/components/Logo";
import { OnboardingModal } from "@/app/components/OnboardingModal";
import { getUserPlan, getBriefCountThisMonth, canCreateBrief, getBriefLimit, PLANS, type PlanId } from "@/lib/plans";
import type { BriefProject, MeetingNote, BriefData } from "@/lib/storage";

// ── Supabase row → app type mappers ────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProject(row: any): BriefProject {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    status: row.status,
    briefData: row.brief_data ?? undefined,
    notes: row.notes ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNote(row: any): MeetingNote {
  return {
    id: row.id,
    title: row.title,
    content: row.content ?? "",
    createdAt: row.created_at,
    linkedProjectId: row.linked_project_id ?? undefined,
  };
}

// ── Skeleton ────────────────────────────────────────────────────

function ProjectCardSkeleton() {
  return (
    <div className="project-card skeleton-card">
      <div className="skeleton-line" style={{ width: "60%", height: 16, marginBottom: 8 }} />
      <div className="skeleton-line" style={{ width: "35%", height: 12, marginBottom: 16 }} />
      <div className="skeleton-line" style={{ width: "90%", height: 12, marginBottom: 6 }} />
      <div className="skeleton-line" style={{ width: "75%", height: 12, marginBottom: 20 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <div className="skeleton-line" style={{ width: 80, height: 30 }} />
        <div className="skeleton-line" style={{ width: 100, height: 30 }} />
      </div>
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────

export default function Dashboard() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [projects, setProjects] = useState<BriefProject[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([]);
  const [plan, setPlan] = useState<PlanId>("free");
  const [briefsUsed, setBriefsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"briefs" | "notes">("briefs");

  // Modal states
  const [showNewBriefModal, setShowNewBriefModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [newBriefName, setNewBriefName] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [notesTargetId, setNotesTargetId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [viewingNote, setViewingNote] = useState<MeetingNote | null>(null);
  const [linkingNote, setLinkingNote] = useState<MeetingNote | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // ── Load data ──────────────────────────────────────────────────

  // Fast session check — redirect to login before init if no session
  useEffect(() => {
    const sb = createClient();
    if (!sb) return;
    sb.auth.getSession().then((result: { data: { session: unknown } }) => {
      if (!result.data.session) {
        window.location.href = '/login';
      }
    });
  }, []);

  const loadProjects = useCallback(async (uid: string) => {
    const sb = supabaseRef.current;
    if (!sb) return;
    const { data } = await sb
      .from("projects")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setProjects((data ?? []).map(mapProject));
  }, []);

  const loadMeetingNotes = useCallback(async (uid: string) => {
    const sb = supabaseRef.current;
    if (!sb) return;
    const { data } = await sb
      .from("meeting_notes")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setMeetingNotes((data ?? []).map(mapNote));
  }, []);

  useEffect(() => {
    async function init() {
      supabaseRef.current = createClient();
      const sb = supabaseRef.current;
      if (!sb) { window.location.href = '/login'; return; }

      const { data: { user } } = await sb.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      setUserEmail(user.email ?? "");
      setUserId(user.id);
      setPlan(getUserPlan());
      setBriefsUsed(getBriefCountThisMonth());

      await Promise.all([loadProjects(user.id), loadMeetingNotes(user.id)]);
      setIsLoading(false);
    }
    init();
  }, [loadProjects, loadMeetingNotes]);

  // ── Brief CRUD ─────────────────────────────────────────────────

  function handleNewBriefClick() {
    if (!canCreateBrief()) { setShowLimitModal(true); return; }
    setShowNewBriefModal(true);
  }

  async function handleCreateBrief(e: React.FormEvent) {
    e.preventDefault();
    const name = newBriefName.trim();
    if (!name || !userId) return;
    const sb = supabaseRef.current;
    if (!sb) return;

    console.log("[CreateBrief] Step 1 — userId:", userId, "name:", name);

    // Step 2 — verify current session user
    const { data: { user }, error: userError } = await sb.auth.getUser();
    console.log("[CreateBrief] Step 2 — auth.getUser:", user?.id, "error:", userError);
    if (!user) { showToast("Session expirée — reconnectez-vous."); return; }

    // Step 3 — attempt insert
    const slug = `projet-${Math.random().toString(36).substring(2, 7)}`;
    console.log("[CreateBrief] Step 3 — inserting into projects:", { name, slug, user_id: user.id, status: "pending" });
    const { data, error } = await sb
      .from("projects")
      .insert({ name, slug, user_id: user.id, status: "pending" })
      .select()
      .single();

    console.log("[CreateBrief] Step 4 — insert result data:", data, "error:", error);

    if (error) {
      const msg = `Erreur création : ${error.message} (code: ${error.code})`;
      console.error("[CreateBrief] Insert failed:", error);
      showToast(msg);
      return;
    }

    console.log("[CreateBrief] Step 5 — created project:", data.id);
    setProjects((prev) => [mapProject(data), ...prev]);
    setBriefsUsed(getBriefCountThisMonth());
    setShowNewBriefModal(false);
    setNewBriefName("");
  }

  async function handleDeleteBrief(id: string) {
    const sb = supabaseRef.current;
    if (!sb) return;
    await sb.from("projects").delete().eq("id", id).eq("user_id", userId);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeleteTargetId(null);
    showToast("Brief supprimé.");
  }

  function copyLink(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/brief/${id}`).then(() => showToast("Lien copié !"));
  }

  // ── Project notes ──────────────────────────────────────────────

  function openNotesModal(project: BriefProject) {
    setNotesTargetId(project.id);
    setNotesValue(project.notes ?? "");
  }

  async function saveNotes() {
    if (!notesTargetId) return;
    const sb = supabaseRef.current;
    if (!sb) return;
    const { error } = await sb
      .from("projects")
      .update({ notes: notesValue })
      .eq("id", notesTargetId)
      .eq("user_id", userId);

    if (error) { showToast("Erreur lors de la sauvegarde."); return; }
    setProjects((prev) =>
      prev.map((p) => p.id === notesTargetId ? { ...p, notes: notesValue } : p)
    );
    setNotesTargetId(null);
    showToast("Notes sauvegardées.");
  }

  // ── Meeting notes CRUD ─────────────────────────────────────────

  async function saveNote() {
    const title = noteTitle.trim();
    if (!title || !userId) return;
    const sb = supabaseRef.current;
    if (!sb) return;

    const { data, error } = await sb
      .from("meeting_notes")
      .insert({ title, content: noteContent.trim(), user_id: userId })
      .select()
      .single();

    if (error) { showToast("Erreur lors de la sauvegarde."); return; }
    setMeetingNotes((prev) => [mapNote(data), ...prev]);
    setShowNoteModal(false);
    setNoteTitle("");
    setNoteContent("");
    showToast("Note sauvegardée.");
  }

  async function handleDeleteNote(id: string) {
    const sb = supabaseRef.current;
    if (!sb) return;
    await sb.from("meeting_notes").delete().eq("id", id).eq("user_id", userId);
    setMeetingNotes((prev) => prev.filter((n) => n.id !== id));
    showToast("Note supprimée.");
  }

  async function linkNoteToProject(noteId: string, projectId: string) {
    const sb = supabaseRef.current;
    if (!sb) return;
    const { error } = await sb
      .from("meeting_notes")
      .update({ linked_project_id: projectId })
      .eq("id", noteId)
      .eq("user_id", userId);

    if (error) { showToast("Erreur lors de la liaison."); return; }
    setMeetingNotes((prev) =>
      prev.map((n) => n.id === noteId ? { ...n, linkedProjectId: projectId } : n)
    );
    setLinkingNote(null);
    showToast("Note liée au projet.");
  }

  async function handleLogout() {
    await supabaseRef.current?.auth.signOut();
    window.location.href = '/login';
  }

  const limit = getBriefLimit();
  const isUnlimited = limit === -1;
  const usagePct = isUnlimited ? 0 : Math.min((briefsUsed / limit) * 100, 100);
  const planInfo = PLANS[plan];
  const deleteTarget = projects.find((p) => p.id === deleteTargetId);

  return (
    <div className="dash-wrap">
      <OnboardingModal onOpenNewBrief={() => setShowNewBriefModal(true)} />

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <div className="dark-nav">
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--theme-subtle-text)", fontWeight: 300 }}>{userEmail}</span>
          <button className="dark-btn-ghost" onClick={handleLogout}>Déconnexion</button>
          <ThemeToggle />
        </div>
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="dash-header">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="dash-title">Tableau de bord</h1>
            <p className="dash-sub">Gérez vos briefs et vos notes de réunion.</p>
          </div>
          <div className="dash-plan-badge">
            <span className="dash-plan-name">
              <span className="dash-plan-dot" />
              Plan {planInfo.name}
            </span>
            <Link href="/pricing" className="dash-upgrade-btn">
              {plan === "free" ? "Upgrader →" : "Gérer →"}
            </Link>
          </div>
        </div>

        {!isUnlimited && (
          <div className="dash-usage">
            <div className="dash-usage-label">
              <span>{briefsUsed}/{limit} briefs utilisés ce mois</span>
              <span style={{ color: briefsUsed >= limit ? "var(--accent)" : "var(--theme-muted-text)" }}>
                {briefsUsed >= limit ? "Limite atteinte" : `${limit - briefsUsed} restant${limit - briefsUsed !== 1 ? "s" : ""}`}
              </span>
            </div>
            <div className="dash-usage-track">
              <div className="dash-usage-fill" style={{ width: `${usagePct}%`, background: usagePct >= 100 ? "var(--accent)" : "var(--accent-light)" }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div className="dash-tabs">
        <button className={`dash-tab${activeTab === "briefs" ? " active" : ""}`} onClick={() => setActiveTab("briefs")}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Briefs clients
          {!isLoading && projects.length > 0 && <span className="dash-tab-count">{projects.length}</span>}
        </button>
        <button className={`dash-tab${activeTab === "notes" ? " active" : ""}`} onClick={() => setActiveTab("notes")}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Notes de réunion
          {meetingNotes.length > 0 && <span className="dash-tab-count">{meetingNotes.length}</span>}
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="dash-body">

        {/* BRIEFS TAB */}
        {activeTab === "briefs" && (
          <>
            <div className="dash-toolbar">
              <span className="dash-section-title">
                {isLoading ? "\u00a0" : `${projects.length} projet${projects.length !== 1 ? "s" : ""}`}
              </span>
              <button className="btn-new" onClick={handleNewBriefClick} disabled={isLoading}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16" />
                </svg>
                Nouveau brief
              </button>
            </div>

            {isLoading ? (
              <div className="projects-grid">
                <ProjectCardSkeleton /><ProjectCardSkeleton /><ProjectCardSkeleton />
              </div>
            ) : projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>Aucun projet pour l&apos;instant</h3>
                <p>Créez votre premier brief et partagez le lien à votre client.</p>
              </div>
            ) : (
              <div className="projects-grid">
                {projects.map((p) => (
                  <div key={p.id} className="project-card">
                    <div className="project-card-top">
                      <div>
                        <div className="project-name">{p.name}</div>
                        <div className="project-date">
                          {new Date(p.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <span className={`badge badge-${p.status}`}>
                        <span className="badge-dot" />
                        {p.status === "completed" ? "Complété" : "En attente"}
                      </span>
                    </div>

                    {p.notes && (
                      <div className="project-notes-preview">
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.5 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Notes de contexte ajoutées
                      </div>
                    )}

                    {p.briefData?.summary && (
                      <p className="project-summary">{p.briefData.summary}</p>
                    )}

                    <div className="project-actions">
                      <Link href={`/brief/${p.id}`} className="project-btn project-btn-primary">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Voir le brief
                      </Link>
                      <button className="project-btn project-btn-ghost" onClick={() => copyLink(p.id)}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copier le lien
                      </button>
                      {p.status === "pending" && (
                        <button className="project-btn project-btn-ghost" onClick={() => openNotesModal(p)}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {p.notes ? "Modifier les notes" : "Ajouter des notes"}
                        </button>
                      )}
                      {p.status === "completed" && (
                        <button className="project-btn project-btn-ghost" onClick={() => {
                          const briefDataForPdf: BriefData = p.briefData!;
                          downloadBriefPDF({ id: p.id, name: p.name, createdAt: p.createdAt, status: p.status, briefData: briefDataForPdf });
                        }}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          PDF
                        </button>
                      )}
                      <button className="project-btn project-btn-danger" onClick={() => setDeleteTargetId(p.id)}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* NOTES TAB */}
        {activeTab === "notes" && (
          <>
            <div className="dash-toolbar">
              <span className="dash-section-title">
                {meetingNotes.length} note{meetingNotes.length !== 1 ? "s" : ""}
              </span>
              <button className="btn-new" onClick={() => { setNoteTitle(""); setNoteContent(""); setShowNoteModal(true); }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16" />
                </svg>
                Nouvelle note
              </button>
            </div>

            {meetingNotes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✍️</div>
                <h3>Aucune note de réunion</h3>
                <p>Prenez des notes pendant ou après vos appels clients.</p>
              </div>
            ) : (
              <div className="notes-grid">
                {meetingNotes.map((note) => {
                  const linked = note.linkedProjectId ? projects.find((p) => p.id === note.linkedProjectId) : null;
                  return (
                    <div key={note.id} className="note-card">
                      <div className="note-card-top">
                        <div>
                          <div className="note-title">{note.title}</div>
                          <div className="note-date">
                            {new Date(note.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                        {linked && (
                          <span className="note-linked-badge">📎 {linked.name.slice(0, 14)}{linked.name.length > 14 ? "…" : ""}</span>
                        )}
                      </div>
                      {note.content && (
                        <p className="note-preview">{note.content.slice(0, 100)}{note.content.length > 100 ? "…" : ""}</p>
                      )}
                      <div className="project-actions">
                        <button className="project-btn project-btn-primary" onClick={() => setViewingNote(note)}>Voir</button>
                        <button className="project-btn project-btn-ghost" onClick={() => setLinkingNote(note)}>Lier à un projet</button>
                        <button className="project-btn project-btn-danger" onClick={() => handleDeleteNote(note.id)}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MODAL: Nouveau brief ─────────────────────────────────── */}
      {showNewBriefModal && (
        <div className="new-project-overlay" onClick={() => setShowNewBriefModal(false)}>
          <div className="new-project-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nouveau brief</h2>
            <p>Donnez un nom à ce projet — votre client ne le verra pas.</p>
            <form onSubmit={handleCreateBrief} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="dark-label">Nom du projet</label>
                <input className="dark-input" placeholder="ex: Site vitrine Cabinet Dupont" value={newBriefName} onChange={(e) => setNewBriefName(e.target.value)} autoFocus />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="dark-btn-ghost" onClick={() => setShowNewBriefModal(false)}>Annuler</button>
                <button type="submit" className="login-btn" style={{ width: "auto", padding: "10px 24px" }}>Créer le brief</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Limite atteinte ───────────────────────────────── */}
      {showLimitModal && (
        <div className="new-project-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="new-project-modal limit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="limit-modal-icon">🚀</div>
            <h2>Limite atteinte</h2>
            <p>Vous avez utilisé vos <strong>{limit} briefs</strong> du mois sur le plan Gratuit.</p>
            <div className="limit-modal-plans">
              <div className="limit-plan-item"><strong>Solo — 9€/mois</strong><span>15 briefs · PDF brandé · Support email</span></div>
              <div className="limit-plan-item featured"><strong>Agence — 49€/mois</strong><span>Illimité · Multi-utilisateurs · Notion & Slack</span></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <Link href="/pricing" className="login-btn" style={{ flex: 1, textAlign: "center", textDecoration: "none", display: "block", padding: "12px 0" }} onClick={() => setShowLimitModal(false)}>Voir les plans →</Link>
              <button className="dark-btn-ghost" style={{ flex: "0 0 auto" }} onClick={() => setShowLimitModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Supprimer un brief ────────────────────────────── */}
      {deleteTargetId && (
        <div className="new-project-overlay" onClick={() => setDeleteTargetId(null)}>
          <div className="new-project-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 32, marginBottom: 8, textAlign: "center" }}>🗑</div>
            <h2 style={{ textAlign: "center" }}>Supprimer ce brief ?</h2>
            <p style={{ textAlign: "center", color: "var(--theme-muted-text)", fontSize: 14 }}>
              <strong style={{ color: "var(--theme-fg)" }}>{deleteTarget?.name}</strong><br />
              Cette action est irréversible.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 8 }}>
              <button className="dark-btn-ghost" onClick={() => setDeleteTargetId(null)}>Annuler</button>
              <button className="login-btn" style={{ width: "auto", padding: "10px 24px", background: "#dc2626" }} onClick={() => handleDeleteBrief(deleteTargetId)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Notes de contexte ─────────────────────────────── */}
      {notesTargetId && (
        <div className="new-project-overlay" onClick={() => setNotesTargetId(null)}>
          <div className="new-project-modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <h2>Notes de contexte pour l&apos;IA</h2>
            <p style={{ fontSize: 13, color: "var(--theme-muted-text)", marginBottom: 16 }}>Ces notes seront transmises à l&apos;IA pour personnaliser la conversation sans reposer des questions déjà répondues.</p>
            <label className="dark-label">Vos notes</label>
            <textarea className="dark-input" value={notesValue} onChange={(e) => setNotesValue(e.target.value)} placeholder="Ex: Client rencontré en visio le 15 mars. Projet e-commerce mode. Budget ~3000€. Délai fin avril. Aime le style Sézane." rows={5} style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} autoFocus />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <button className="dark-btn-ghost" onClick={() => setNotesTargetId(null)}>Annuler</button>
              <button className="login-btn" style={{ width: "auto", padding: "10px 24px" }} onClick={saveNotes}>Sauvegarder les notes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Nouvelle note ─────────────────────────────────── */}
      {showNoteModal && (
        <div className="new-project-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="new-project-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <h2>Nouvelle note de réunion</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="dark-label">Titre</label>
                <input className="dark-input" placeholder="ex: Visio client — Boulangerie Lyon" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="dark-label">Contenu</label>
                <textarea className="dark-input" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Vos notes de réunion…" rows={6} style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="dark-btn-ghost" onClick={() => setShowNoteModal(false)}>Annuler</button>
                <button className="login-btn" style={{ width: "auto", padding: "10px 24px" }} onClick={saveNote}>Sauvegarder</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Voir une note ─────────────────────────────────── */}
      {viewingNote && (
        <div className="new-project-overlay" onClick={() => setViewingNote(null)}>
          <div className="new-project-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div>
                <h2 style={{ marginBottom: 4 }}>{viewingNote.title}</h2>
                <div style={{ fontSize: 12, color: "var(--theme-muted-text)" }}>
                  {new Date(viewingNote.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
              <button className="dark-btn-ghost" onClick={() => setViewingNote(null)}>✕</button>
            </div>
            <div style={{ fontSize: 14, color: "var(--theme-fg)", lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 360, overflowY: "auto" }}>
              {viewingNote.content || <em style={{ color: "var(--theme-muted-text)" }}>Aucun contenu</em>}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Lier une note ─────────────────────────────────── */}
      {linkingNote && (
        <div className="new-project-overlay" onClick={() => setLinkingNote(null)}>
          <div className="new-project-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Lier à un projet</h2>
            <p style={{ fontSize: 13, color: "var(--theme-muted-text)", marginBottom: 16 }}>Choisissez le brief auquel associer cette note.</p>
            {projects.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--theme-muted-text)" }}>Aucun brief disponible.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {projects.map((p) => (
                  <button key={p.id} className="dark-btn-ghost" style={{ textAlign: "left", padding: "10px 14px" }} onClick={() => linkNoteToProject(linkingNote.id, p.id)}>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: "var(--theme-muted-text)", marginLeft: 8 }}>{p.status === "completed" ? "✓ Complété" : "⏳ En attente"}</span>
                  </button>
                ))}
              </div>
            )}
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button className="dark-btn-ghost" onClick={() => setLinkingNote(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="copy-toast">{toast}</div>}
    </div>
  );
}
