"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";

const PLAN_DETAILS: Record<string, { name: string; price: string; features: string[] }> = {
  solo: {
    name: "Solo",
    price: "9€/mois",
    features: ["15 briefs par mois", "PDF brandé avec votre logo", "Rappels automatiques client", "Support email"],
  },
  agence: {
    name: "Agence",
    price: "49€/mois",
    features: ["Briefs illimités", "Multi-utilisateurs (5 comptes)", "Intégration Notion et Slack", "Support prioritaire", "Statistiques avancées"],
  },
};

function MerciContent() {
  const params = useSearchParams();
  const planParam = params.get("plan") ?? "solo";
  const plan = PLAN_DETAILS[planParam] ?? PLAN_DETAILS.solo;
  const emailSent = useRef(false);

  // Send subscription confirmation email once
  useEffect(() => {
    if (emailSent.current) return;
    emailSent.current = true;

    async function sendEmail() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        await fetch("/api/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "subscription", email: user.email, plan: planParam }),
        });
      } catch { /* non-blocking */ }
    }

    sendEmail();
  }, [planParam]);

  return (
    <div className="merci-page">
      <div className="merci-inner">
        <div className="merci-check">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1>Bienvenue dans l&apos;aventure<br /><em>ContextDrop !</em> 🎉</h1>

        <p className="merci-sub">
          Votre abonnement est confirmé. Vous êtes maintenant sur le plan{" "}
          <strong>{plan.name}</strong>. Un email de confirmation vous a été envoyé.
        </p>

        <div className="merci-plan-card">
          <div className="merci-plan-header">
            <div>
              <div className="merci-plan-name">Plan {plan.name}</div>
              <div className="merci-plan-price">{plan.price}</div>
            </div>
            <div className="merci-plan-badge">Actif</div>
          </div>
          <ul className="merci-plan-features">
            {plan.features.map((f) => (
              <li key={f}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/dashboard" className="btn-primary" style={{ marginTop: 8 }}>
          Accéder à mon dashboard
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function MerciPage() {
  return (
    <Suspense>
      <MerciContent />
    </Suspense>
  );
}
