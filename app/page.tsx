"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { Logo } from "@/app/components/Logo";

const faqs = [
  {
    q: "Mon client a besoin d'un compte ?",
    a: "Non. Vous partagez simplement un lien. Votre client clique et répond directement — sans inscription, sans friction.",
  },
  {
    q: "Les briefs sont-ils sauvegardés ?",
    a: "Oui, dans votre navigateur via localStorage. Une version cloud avec partage d'équipe arrive bientôt.",
  },
  {
    q: "Puis-je personnaliser les questions posées à mon client ?",
    a: "La prochaine version permettra de configurer les questions selon votre secteur (dev, design, rédaction…).",
  },
  {
    q: "Comment fonctionne la génération IA ?",
    a: "L'IA guide votre client à travers une conversation naturelle et structure automatiquement les réponses en un brief professionnel.",
  },
];

const MONTHLY_PRICES = { gratuit: 0, solo: 9, agence: 49 };
const ANNUAL_PRICES = { gratuit: 0, solo: 7, agence: 39 };

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const prices = annual ? ANNUAL_PRICES : MONTHLY_PRICES;

  return (
    <>
      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="site-nav">
        <Logo />
        <div className="nav-links">
          <a href="#comment" className="nav-link">Comment ça marche</a>
          <a href="#tarifs" className="nav-link">Tarifs</a>
          <a href="#faq" className="nav-link">FAQ</a>
          <ThemeToggle />
          <Link href="/login" className="btn-nav">Se connecter</Link>
        </div>
        <div className="nav-toggle-mobile">
          <ThemeToggle />
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-label">Brief client IA</div>
          <h1>
            Ta visio a créé le lien.<br /><em>ContextDrop le formalise.</em>
          </h1>
          <p style={{ fontSize: 18, color: "var(--theme-muted-text)", fontWeight: 300, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
            Après ta visio, prends tes notes sur ContextDrop.
            Envoie un lien à ton client. Il valide ce que vous avez dit en 5 minutes — sans repartir de zéro.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/login" className="btn-primary">
              Commencer gratuitement
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/login" style={{ fontSize: 14, color: "var(--theme-muted-text)", textDecoration: "none" }}>
              Déjà un compte ? Se connecter →
            </Link>
          </div>
          <p className="hero-note" style={{ marginTop: 20 }}>Gratuit · Sans carte bancaire · Prêt en 30 secondes</p>
        </div>

        {/* Mock chat card */}
        <div className="hero-visual" style={{ position: "relative" }}>
          <div className="chat-card">
            <div className="chat-header">
              <div className="chat-dots">
                <span /><span /><span />
              </div>
              <span className="chat-title">ContextDrop — Brief assistant</span>
            </div>
            <div className="chat-body">
              <div className="msg msg-ai">
                <strong>ContextDrop IA</strong>
                Bonjour ! Votre freelance m&apos;a partagé que vous souhaitez créer une identité visuelle. Pouvez-vous me confirmer l&apos;activité principale de votre entreprise ?
              </div>
              <div className="msg msg-user">
                Oui, c&apos;est une boulangerie artisanale à Lyon, on vise une clientèle haut de gamme.
              </div>
              <div className="msg msg-ai">
                <strong>ContextDrop IA</strong>
                Parfait. Votre freelance a mentionné un budget autour de 1 500€ — c&apos;est toujours d&apos;actualité ?
              </div>
              <div className="msg msg-user">
                Oui, avec une petite marge si besoin.
              </div>
              <div className="msg msg-ai">
                <strong>ContextDrop IA</strong>
                Brief complété ✓ Je l&apos;ai transmis à votre freelance.
              </div>
            </div>
          </div>
          <div className="badge-float">
            Brief signé en <span>5 min</span> ⚡
          </div>
        </div>
      </section>

      {/* ── LOGOS ───────────────────────────────────────────────── */}
      <div className="logos-section">
        <div className="logos-inner">
          <span className="logos-label">Utilisé par des freelances en</span>
          {["Développement web", "Design UI/UX", "Rédaction", "Marketing", "Conseil"].map((l) => (
            <span key={l} className="logo-item">{l}</span>
          ))}
        </div>
      </div>

      {/* ── COMMENT ─────────────────────────────────────────────── */}
      <section id="comment" className="section reveal">
        <div className="section-label">Comment ça marche</div>
        <h2>Trois étapes,<br /><em>zéro friction</em></h2>
        <p className="section-sub">
          Juste après ta visio, envoie un lien. Ton client valide en 5 minutes. Tu reçois un brief béton.
        </p>
        <div className="steps">
          {[
            {
              n: "01",
              title: "Tu raccroches, tu envoies",
              desc: "Juste après ta visio, copie ton lien ContextDrop et envoie-le à ton client. Il se souvient encore de tout — c'est le moment idéal.",
            },
            {
              n: "02",
              title: "Il valide, tu ne perds rien",
              desc: "L'IA reformule ce que vous avez dit ensemble. Le client confirme, précise, signe. Tout ce qui a été dit en visio est maintenant écrit noir sur blanc.",
            },
            {
              n: "03",
              title: "Un brief béton, pas un mail flou",
              desc: "Tu reçois un PDF structuré et signé. Fini le scope creep, fini les malentendus. Le brief devient ta protection autant que ton outil de travail.",
            },
          ].map((s, i, arr) => (
            <div key={s.n} className="step">
              <div className="step-num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < arr.length - 1 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── DEUX FAÇONS ─────────────────────────────────────────── */}
      <section className="section reveal" style={{ paddingTop: 0 }}>
        <div className="section-label">Deux façons de l&apos;utiliser</div>
        <h2>Avant ou après <em>la visio</em></h2>
        <div className="usage-cards">
          <div className="usage-card usage-card-featured">
            <div className="usage-card-icon">🎥</div>
            <div className="usage-card-badge">Recommandé</div>
            <h3>Après la visio</h3>
            <p>
              Tu as déjà eu ton appel. Prends tes notes, envoie le lien dans la foulée pour formaliser
              ce que vous avez dit. Le client répond en 5 minutes pendant que c&apos;est frais.
            </p>
          </div>
          <div className="usage-card">
            <div className="usage-card-icon">📋</div>
            <h3>Avant la visio</h3>
            <p>
              Tu reçois beaucoup de demandes. Envoie le lien avant l&apos;appel pour qualifier
              les prospects sérieux et arriver préparé à la visio.
            </p>
          </div>
        </div>
      </section>

      {/* ── PROBLÈMES ───────────────────────────────────────────── */}
      <section className="section reveal" style={{ paddingTop: 0 }}>
        <div className="problems-grid">
          <div>
            <div className="section-label">Le problème</div>
            <h2>Quand rien n&apos;est écrit,<br /><em>tout peut déraper</em></h2>
            {[
              { icon: "🎙️", title: "La visio s'est bien passée... mais les notes sont floues" },
              { icon: "🤝", title: "Le client a validé verbalement, mais rien n'est écrit" },
              { icon: "🕰️", title: "3 semaines plus tard il ne se souvient plus de ce qu'il a dit" },
              { icon: "📈", title: "Sans brief signé, le scope explose à mi-projet" },
            ].map((p) => (
              <div key={p.title} className="problem-item">
                <div className="problem-icon">{p.icon}</div>
                <div className="problem-text">
                  <p style={{ margin: 0, fontWeight: 400 }}>{p.title}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="quote-block">
            <blockquote>
              &ldquo;Avant je prenais des notes en visio et j&apos;envoyais un mail de récap que personne
              ne lisait vraiment. Maintenant j&apos;envoie ContextDrop juste après l&apos;appel. Mon client
              valide en 5 minutes et on a tous les deux le même brief. Ça m&apos;a évité 2 litiges
              cette année.&rdquo;
            </blockquote>
            <div className="quote-author">— Thomas R., développeur freelance · 6 ans d&apos;expérience</div>
          </div>
        </div>
      </section>

      {/* ── TARIFS ──────────────────────────────────────────────── */}
      <section id="tarifs" className="section reveal">
        <div className="section-label">Tarifs</div>
        <h2>Simple et <em>transparent</em></h2>
        <p className="section-sub">Commencez gratuitement. Passez en pro quand vous en avez besoin.</p>

        <div className="billing-toggle">
          <span className={!annual ? "billing-active" : ""}>Mensuel</span>
          <button
            className={`billing-switch${annual ? " on" : ""}`}
            onClick={() => setAnnual(!annual)}
            aria-label="Basculer facturation annuelle"
          >
            <span className="billing-switch-thumb" />
          </button>
          <span className={annual ? "billing-active" : ""}>
            Annuel
            <span className="billing-save">-20%</span>
          </span>
        </div>

        <div className="pricing-grid pricing-grid-3">
          <div className="pricing-card">
            <div className="pricing-name">Gratuit</div>
            <div className="pricing-price">{prices.gratuit}€</div>
            <div className="pricing-period">par mois</div>
            <ul className="pricing-features">
              <li>3 briefs par mois</li>
              <li>Export PDF standard</li>
              <li>Lien de brief personnalisé</li>
              <li>Signature client</li>
            </ul>
            <Link href="/login" className="btn-pricing" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
              Commencer gratuitement
            </Link>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-badge">Populaire</div>
            <div className="pricing-name">Solo</div>
            <div className="pricing-price">{prices.solo}€</div>
            <div className="pricing-period">par mois{annual ? " · facturé annuellement" : ""}</div>
            <ul className="pricing-features">
              <li>15 briefs par mois</li>
              <li>PDF brandé avec logo</li>
              <li>Rappels automatiques client</li>
              <li>Support email</li>
            </ul>
            <Link href="/login" className="btn-pricing btn-pricing-featured" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
              Essai gratuit 14 jours
            </Link>
          </div>

          <div className="pricing-card">
            <div className="pricing-name">Agence</div>
            <div className="pricing-price">{prices.agence}€</div>
            <div className="pricing-period">par mois{annual ? " · facturé annuellement" : ""}</div>
            <ul className="pricing-features">
              <li>Briefs illimités</li>
              <li>Multi-utilisateurs 5 comptes</li>
              <li>Intégration Notion et Slack</li>
              <li>Support prioritaire</li>
              <li>Statistiques avancées</li>
            </ul>
            <Link href="/login" className="btn-pricing" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
              Essai gratuit 14 jours
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section id="faq" className="section reveal">
        <div className="section-label">FAQ</div>
        <h2>Questions <em>fréquentes</em></h2>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`}>
              <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                <span className="faq-icon">+</span>
              </button>
              {openFaq === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="cta-section">
        <h2>Prêt à <em>simplifier</em><br />vos briefs clients ?</h2>
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

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="footer-top">
          <Logo style={{ fontSize: 18 }} size={20} />
          <p style={{ fontSize: 13, color: "var(--theme-muted-text)", fontWeight: 300 }}>
            © 2026 ContextDrop · Fait avec ☕ pour les freelances
          </p>
        </div>
        <div className="footer-legal">
          <Link href="/legal/mentions-legales" className="footer-legal-link">Mentions légales</Link>
          <Link href="/legal/confidentialite" className="footer-legal-link">Confidentialité</Link>
          <Link href="/legal/cgu" className="footer-legal-link">CGU</Link>
        </div>
      </footer>
    </>
  );
}
