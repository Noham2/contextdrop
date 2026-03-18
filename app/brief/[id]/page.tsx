"use client";
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { downloadBriefPDF } from "@/lib/pdf";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { Logo } from "@/app/components/Logo";
import type { BriefData } from "@/lib/storage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function tryParseBrief(text: string): BriefData | null {
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const parsed = JSON.parse(trimmed);
      if (parsed.objective && parsed.summary) return parsed as BriefData;
    }
  } catch { /* not valid JSON */ }
  return null;
}

export default function BriefPage() {
  const params = useParams();
  const id = params?.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [projectName, setProjectName] = useState<string>("");
  const [projectNotes, setProjectNotes] = useState<string>("");
  const [apiError, setApiError] = useState(false);
  const [lastFailedInput, setLastFailedInput] = useState<string>("");
  const [projectLoading, setProjectLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load project from API (works without auth — service role)
  useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setProjectName(data.name ?? "");
        setProjectNotes(data.notes ?? "");
        if (data.status === "completed" && data.briefData) {
          setBriefData(data.briefData);
        }
      })
      .catch(() => {/* project not found — continue */})
      .finally(() => setProjectLoading(false));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function callChat(msgs: Message[]) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs, notes: projectNotes || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erreur API");
    return data.message as string;
  }

  async function saveBriefToServer(brief: BriefData) {
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefData: brief }),
      });
    } catch (err) {
      console.error("[BriefPage] saveBriefToServer error:", err);
    }
  }

  async function startConversation() {
    setHasStarted(true);
    setIsLoading(true);
    setApiError(false);
    try {
      const initMsg: Message = { role: "user", content: "Bonjour, je veux créer un brief pour mon projet." };
      const reply = await callChat([initMsg]);
      setMessages([initMsg, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("[BriefPage] startConversation error:", err);
      setHasStarted(false);
      setApiError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage(overrideInput?: string) {
    const text = (overrideInput ?? input).trim();
    if (!text || isLoading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLastFailedInput("");
    setIsLoading(true);
    setApiError(false);
    try {
      const reply = await callChat(newMessages);
      const parsed = tryParseBrief(reply);
      if (parsed) {
        setBriefData(parsed);
        await saveBriefToServer(parsed); // save to Supabase + trigger email
      } else {
        setMessages([...newMessages, { role: "assistant", content: reply }]);
      }
    } catch (err) {
      console.error("[BriefPage] sendMessage error:", err);
      setApiError(true);
      setLastFailedInput(text);
      setMessages(newMessages.slice(0, -1));
      setInput(text);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  /* ── LOADING PROJECT ────────────────────────────────────────── */
  if (projectLoading) {
    return (
      <div className="brief-welcome">
        <div className="brief-welcome-inner" style={{ textAlign: "center" }}>
          <span className="btn-spinner" style={{ borderTopColor: "var(--accent)", borderColor: "var(--theme-border-col)", width: 28, height: 28, borderWidth: 3 }} />
        </div>
      </div>
    );
  }

  /* ── BRIEF COMPLÉTÉ ─────────────────────────────────────────── */
  if (briefData) {
    return (
      <div className="brief-complete">
        <ThemeToggle style={{ position: "fixed", top: 20, right: 24 }} />
        <div className="brief-complete-inner">
          <div className="brief-complete-header">
            <div className="brief-check">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1>Brief <em>complété</em></h1>
            {projectName && (
              <p style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 4 }}>{projectName}</p>
            )}
            <p style={{ fontSize: 15, color: "var(--muted)", fontWeight: 300 }}>Voici le résumé structuré de votre projet</p>
          </div>

          <div className="brief-card">
            <div className="brief-card-summary">{briefData.summary}</div>
            {[
              { label: "Objectif", value: briefData.objective, icon: "🎯" },
              { label: "Public cible", value: briefData.audience, icon: "👥" },
              { label: "Budget", value: briefData.budget, icon: "💰" },
              { label: "Délais", value: briefData.deadline, icon: "📅" },
              { label: "Contraintes techniques", value: briefData.tech_constraints, icon: "⚙️" },
              { label: "Références", value: briefData.references, icon: "🔗" },
            ].map(({ label, value, icon }) => value ? (
              <div key={label} className="brief-card-field">
                <span className="brief-field-icon">{icon}</span>
                <div>
                  <div className="brief-field-label">{label}</div>
                  <div className="brief-field-value">{value}</div>
                </div>
              </div>
            ) : null)}
          </div>

          <div className="brief-cta" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              style={{ fontSize: 14, padding: "10px 22px" }}
              onClick={() => downloadBriefPDF({ id, name: projectName, createdAt: new Date().toISOString(), status: "completed", briefData })}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger le PDF
            </button>
            <button className="brief-new-link" onClick={() => { setBriefData(null); setMessages([]); setHasStarted(false); }}>
              ← Recommencer
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── ÉCRAN D'ACCUEIL ────────────────────────────────────────── */
  if (!hasStarted) {
    return (
      <div className="brief-welcome">
        <ThemeToggle style={{ position: "fixed", top: 20, right: 24 }} />
        <div className="brief-welcome-inner">
          <div className="brief-welcome-badge">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
            ContextDrop
          </div>
          {projectName && (
            <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 300, marginBottom: 12 }}>
              Projet : <strong style={{ color: "var(--ink)" }}>{projectName}</strong>
            </p>
          )}
          <h1>Le brief client <em>enfin</em> simple</h1>
          <p>
            {projectNotes
              ? "Votre freelance a partagé des notes de contexte. L'assistant les utilisera pour personnaliser la conversation."
              : "Notre assistant vous guide à travers quelques questions pour générer un brief clair et structuré."
            }
          </p>
          {apiError && (
            <div className="api-error-box">
              <p>
                Notre assistant est momentanément indisponible.<br />
                Votre progression est sauvegardée.<br />
                Réessayez dans quelques minutes.
              </p>
            </div>
          )}
          <button className="btn-primary" onClick={startConversation} disabled={isLoading}>
            {isLoading ? <span className="btn-spinner" /> : (
              <>
                Démarrer le brief
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── CHAT UI ────────────────────────────────────────────────── */
  return (
    <div className="brief-page">
      <div className="brief-nav">
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="brief-status">
            <span className="brief-status-dot" />
            {projectName || "Brief en cours"}
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="brief-messages">
        <div className="brief-messages-inner">
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "assistant" && <div className="msg-sender" style={{ paddingLeft: 4 }}>ContextDrop IA</div>}
              <div className={`msg ${msg.role === "assistant" ? "msg-ai" : "msg-user"}`}>{msg.content}</div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div className="msg-sender" style={{ paddingLeft: 4 }}>ContextDrop IA</div>
              <div className="msg msg-ai">
                <div className="typing-dots">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          {apiError && !isLoading && (
            <div className="api-error-inline">
              <p>Notre assistant est momentanément indisponible. Votre progression est sauvegardée. Réessayez dans quelques minutes.</p>
              <button className="btn-primary" style={{ fontSize: 13, padding: "8px 18px", marginTop: 8 }} onClick={() => sendMessage(lastFailedInput || input)}>
                Réessayer
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="brief-input-bar">
        <div className="brief-input-inner">
          <textarea
            className="brief-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Votre réponse…"
            rows={1}
            style={{ maxHeight: 120 }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />
          <button className="btn-send" onClick={() => sendMessage()} disabled={!input.trim() || isLoading}>
            {isLoading
              ? <span className="btn-spinner" style={{ width: 16, height: 16 }} />
              : <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
            }
          </button>
        </div>
        <p className="brief-hint">Entrée pour envoyer · Shift+Entrée pour un saut de ligne</p>
      </div>
    </div>
  );
}
