"use client";

import { useState } from "react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { Logo } from "@/app/components/Logo";

type Mode = "login" | "signup";

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Email ou mot de passe incorrect.",
  "Email not confirmed": "Confirmez votre email avant de vous connecter.",
  "User already registered": "Un compte existe déjà avec cet email.",
  "Password should be at least 6 characters": "Le mot de passe doit contenir au moins 6 caractères.",
  "Unable to validate email address: invalid format": "Format d'email invalide.",
  "Failed to fetch": "Erreur réseau. Vérifiez votre connexion et réessayez.",
};

function friendlyError(msg: string): string {
  for (const [key, friendly] of Object.entries(ERROR_MESSAGES)) {
    if (msg.includes(key)) return friendly;
  }
  return "Une erreur est survenue. Réessayez dans quelques instants.";
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, mode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(friendlyError(data.error ?? ""));
        return;
      }

      if (mode === "signup") {
        if (data.session) {
          fetch("/api/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "welcome", email: email.trim() }),
          }).catch(() => {});
          window.location.href = "/dashboard";
        } else {
          setInfo("Compte créé ! Vérifiez votre boîte email pour confirmer votre inscription.");
        }
      } else {
        window.location.replace("/dashboard");
      }
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError("");
    setInfo("");
  }

  return (
    <div className="login-wrap">
      <ThemeToggle style={{ position: "fixed", top: 20, right: 24 }} />
      <div className="login-box">
        <Logo href="/" style={{ fontSize: 22, marginBottom: 0 }} />

        <h1 className="login-title">
          {mode === "login" ? "Bienvenue" : "Créer un compte"}
        </h1>
        <p className="login-sub">
          {mode === "login"
            ? "Connectez-vous pour accéder à votre espace freelance."
            : "Rejoignez ContextDrop — commencez gratuitement."}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label className="dark-label">Adresse email</label>
            <input
              className="dark-input"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>
          <div>
            <label className="dark-label">Mot de passe</label>
            <input
              className="dark-input"
              type="password"
              placeholder={mode === "signup" ? "Minimum 6 caractères" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="auth-error">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          {info && (
            <div className="auth-info">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {info}
            </div>
          )}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="btn-spinner" />
            ) : mode === "login" ? (
              "Se connecter"
            ) : (
              "Créer mon compte"
            )}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 13, color: "var(--theme-subtle-text)", textAlign: "center", fontWeight: 300 }}>
          {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
          <button
            onClick={toggleMode}
            style={{ background: "none", border: "none", color: "var(--accent-light)", cursor: "pointer", fontSize: 13, fontFamily: "inherit", fontWeight: 400, padding: 0 }}
          >
            {mode === "login" ? "Créer un compte →" : "Se connecter →"}
          </button>
        </p>
      </div>
    </div>
  );
}
