"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/components/ThemeToggle";

// ─── Plan data (inline pour éviter tout problème d'import SSR) ──────────────

const PLANS = [
  {
    id: "free",
    name: "Gratuit",
    monthly: 0,
    annual: 0,
    annualTotal: 0,
    briefsLabel: "3 briefs / mois",
    featured: false,
    badge: null,
    cta: "Commencer gratuitement",
    href: "/login",
    features: [
      "3 briefs par mois",
      "Export PDF standard",
      "Lien de brief personnalisé",
      "Signature client",
    ],
  },
  {
    id: "solo",
    name: "Solo",
    monthly: 9,
    annual: 7,
    annualTotal: 84,
    briefsLabel: "15 briefs / mois",
    featured: true,
    badge: "Populaire",
    cta: "Essai gratuit 14 jours",
    href: "/api/stripe/checkout?plan=solo",
    features: [
      "15 briefs par mois",
      "PDF brandé avec logo",
      "Rappels automatiques client",
      "Support email",
    ],
  },
  {
    id: "agency",
    name: "Agence",
    monthly: 49,
    annual: 39,
    annualTotal: 468,
    briefsLabel: "Briefs illimités",
    featured: false,
    badge: null,
    cta: "Essai gratuit 14 jours",
    href: "/api/stripe/checkout?plan=agency",
    features: [
      "Briefs illimités",
      "Multi-utilisateurs (5 comptes)",
      "Intégration Notion et Slack",
      "Support prioritaire",
      "Statistiques avancées",
    ],
  },
];

const TABLE_ROWS = [
  { label: "Briefs par mois",    values: ["3", "15", "Illimité"] },
  { label: "Export PDF",         values: ["Standard", "Brandé", "Brandé"] },
  { label: "Lien personnalisé",  values: ["✓", "✓", "✓"] },
  { label: "Rappels client",     values: ["—", "✓", "✓"] },
  { label: "Multi-utilisateurs", values: ["—", "—", "5 comptes"] },
  { label: "Notion & Slack",     values: ["—", "—", "✓"] },
  { label: "Support",            values: ["—", "Email", "Prioritaire"] },
  { label: "Statistiques",       values: ["—", "—", "Avancées"] },
];

// ─── Composant ────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [soon, setSoon] = useState<string | null>(null);

  // Lire le param "soon" sans useSearchParams (pas de Suspense nécessaire)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("soon");
    if (p !== null) setSoon(p);
  }, []);

  async function handleCTA(plan: typeof PLANS[number]) {
    if (plan.id === "free") {
      window.location.href = "/login";
      return;
    }
    const billing = annual ? "annual" : "monthly";
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id, billing }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Bientôt disponible ! Stripe sera connecté au lancement.");
      }
    } catch {
      alert("Bientôt disponible ! Stripe sera connecté au lancement.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="site-nav">
        <Link href="/" className="logo">Context<span>Drop</span></Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">Accueil</Link>
          <Link href="/login" className="nav-link">Se connecter</Link>
          <ThemeToggle />
          <Link href="/login" className="btn-nav">Commencer</Link>
        </div>
        <div className="nav-toggle-mobile"><ThemeToggle /></div>
      </nav>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{ paddingTop: 120, paddingBottom: 56, textAlign: "center", maxWidth: 640, margin: "0 auto", padding: "120px 24px 56px" }}>
        <div className="section-label" style={{ justifyContent: "center" }}>Tarifs</div>
        <h1 style={{
          fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
          fontSize: "clamp(36px, 5vw, 58px)",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          marginBottom: 16,
          color: "var(--ink)",
        }}>
          Simple et <em style={{ fontStyle: "italic", color: "var(--accent)" }}>transparent</em>
        </h1>
        <p style={{ fontSize: 18, color: "var(--muted)", fontWeight: 300, marginBottom: 36, lineHeight: 1.7 }}>
          Commencez gratuitement. Upgradez quand vous en avez besoin.
        </p>

        {/* Toggle mensuel / annuel */}
        <div className="billing-toggle">
          <span className={`billing-toggle-label${!annual ? " active" : ""}`}>Mensuel</span>
          <button
            className={`billing-switch${annual ? " on" : ""}`}
            onClick={() => setAnnual(!annual)}
            aria-label="Basculer facturation annuelle"
          >
            <span className="billing-switch-thumb" />
          </button>
          <span className={`billing-toggle-label${annual ? " active" : ""}`}>
            Annuel&nbsp;
            <span className="billing-discount">−20%</span>
          </span>
        </div>

        {soon !== null && (
          <div style={{
            marginTop: 20,
            background: "rgba(212, 82, 42, 0.08)",
            border: "1px solid rgba(212, 82, 42, 0.2)",
            color: "var(--accent)",
            fontSize: 13,
            padding: "10px 20px",
            borderRadius: 6,
            display: "inline-block",
          }}>
            ⚡ Stripe arrive bientôt — les paiements seront actifs au lancement.
          </div>
        )}
      </div>

      {/* ── Plans ─────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
        maxWidth: 1020,
        margin: "0 auto 80px",
        padding: "0 48px",
      }} className="pricing-responsive-grid">
        {PLANS.map((plan) => {
          const price = annual ? plan.annual : plan.monthly;
          const isFeatured = plan.featured;

          return (
            <div
              key={plan.id}
              style={{
                background: isFeatured ? "#0f0e0d" : "var(--theme-card)",
                border: `1px solid ${isFeatured ? "#0f0e0d" : "var(--border)"}`,
                borderRadius: 8,
                padding: "36px 28px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "transform 0.2s, box-shadow 0.2s",
                transform: isFeatured ? "scale(1.04)" : "none",
                boxShadow: isFeatured ? "0 24px 60px rgba(15,14,13,0.2)" : "none",
                color: isFeatured ? "white" : "var(--ink)",
                zIndex: isFeatured ? 1 : 0,
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: "absolute",
                  top: -12, left: 28,
                  background: "var(--accent)",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Plan name */}
              <div style={{
                fontSize: 12,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: isFeatured ? "var(--accent-light)" : "var(--muted)",
                marginBottom: 20,
              }}>
                {plan.name}
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{
                  fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
                  fontSize: 52,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: isFeatured ? "white" : "var(--ink)",
                }}>
                  {price === 0 ? "Gratuit" : `${price}€`}
                </span>
                {price > 0 && (
                  <span style={{ fontSize: 14, color: isFeatured ? "rgba(255,255,255,0.5)" : "var(--muted)" }}>
                    /mois
                  </span>
                )}
              </div>

              {/* Annual note */}
              <div style={{
                fontSize: 12,
                color: isFeatured ? "rgba(255,255,255,0.4)" : "var(--muted)",
                marginBottom: 28,
                minHeight: 18,
              }}>
                {annual && plan.annualTotal > 0 ? `Facturé ${plan.annualTotal}€/an` : " "}
              </div>

              {/* Features */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                {plan.features.map((feat) => (
                  <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, fontWeight: 300, color: isFeatured ? "rgba(255,255,255,0.85)" : "var(--ink)" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="8" cy="8" r="7" stroke={isFeatured ? "var(--accent-light)" : "var(--accent)"} strokeWidth="1.5" />
                      <path d="M5 8l2 2 4-4" stroke={isFeatured ? "var(--accent-light)" : "var(--accent)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleCTA(plan)}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  border: isFeatured ? "1px solid var(--accent)" : "1px solid var(--border)",
                  borderRadius: 4,
                  background: isFeatured ? "var(--accent)" : "transparent",
                  color: isFeatured ? "white" : "var(--ink)",
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget;
                  if (isFeatured) { btn.style.background = "white"; btn.style.color = "#0f0e0d"; }
                  else { btn.style.background = "var(--ink)"; btn.style.color = "var(--paper)"; }
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget;
                  if (isFeatured) { btn.style.background = "var(--accent)"; btn.style.color = "white"; }
                  else { btn.style.background = "transparent"; btn.style.color = "var(--ink)"; }
                }}
              >
                {plan.cta}
                {isFeatured && (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {plan.id !== "free" && (
                <p style={{ fontSize: 11, color: isFeatured ? "rgba(255,255,255,0.3)" : "var(--muted)", textAlign: "center", marginTop: 10, fontWeight: 300 }}>
                  Sans engagement · Annulez à tout moment
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Tableau comparatif ─────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto 80px", padding: "0 48px" }}>
        <h2 style={{
          fontFamily: "var(--font-instrument-serif), serif",
          fontSize: 28,
          letterSpacing: "-0.02em",
          marginBottom: 28,
          color: "var(--ink)",
        }}>
          Toutes les fonctionnalités
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border)" }}></th>
              {PLANS.map((p) => (
                <th key={p.id} style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid var(--border)", color: p.featured ? "var(--accent)" : "var(--muted)" }}>
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map((row) => (
              <tr key={row.label}>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--muted)", borderBottom: "1px solid var(--cream)" }}>{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={i} style={{ padding: "14px 16px", textAlign: "center", fontSize: 14, borderBottom: "1px solid var(--cream)", color: v === "—" ? "var(--muted)" : (PLANS[i].featured ? "var(--accent-light)" : "var(--ink)"), fontWeight: v === "—" ? 300 : 400 }}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto 80px", padding: "0 48px" }}>
        <h2 style={{
          fontFamily: "var(--font-instrument-serif), serif",
          fontSize: 28,
          letterSpacing: "-0.02em",
          marginBottom: 28,
          color: "var(--ink)",
        }}>
          Questions fréquentes
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="pricing-faq-responsive">
          {[
            { q: "Puis-je changer de plan ?", a: "Oui, à tout moment. L'upgrade est instantané, le downgrade prend effet au prochain cycle." },
            { q: "Y a-t-il un engagement ?", a: "Aucun. Les plans mensuels se renouvellent chaque mois. Annulez en un clic depuis votre espace." },
            { q: "Comment fonctionne l'essai gratuit ?", a: "14 jours sans carte bancaire. À la fin, choisissez un plan ou revenez au Gratuit." },
            { q: "Les briefs sont-ils perdus si je downgrade ?", a: "Non. Vos briefs existants restent accessibles. Seule la création de nouveaux est limitée." },
          ].map((f) => (
            <div key={f.q} style={{ padding: 24, background: "var(--cream)", border: "1px solid var(--border)", borderRadius: 6 }}>
              <h4 style={{ fontFamily: "var(--font-instrument-serif), serif", fontSize: 16, color: "var(--ink)", marginBottom: 8 }}>{f.q}</h4>
              <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 300, lineHeight: 1.6 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA bottom ────────────────────────────────────────────── */}
      <section className="cta-section">
        <h2>Prêt à simplifier<br /><em>vos briefs clients ?</em></h2>
        <p>Rejoignez des centaines de freelances qui gagnent du temps chaque semaine.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" className="btn-primary">
            Commencer gratuitement
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href="/login" className="btn-primary" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)" }}>
            Se connecter
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px 48px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div className="logo" style={{ fontSize: 18 }}>Context<span>Drop</span></div>
        <p style={{ fontSize: 13, color: "var(--muted)", fontWeight: 300 }}>
          © 2026 ContextDrop · Fait avec ☕ pour les freelances
        </p>
      </footer>
    </div>
  );
}
