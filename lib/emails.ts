import { Resend } from "resend";
import type { BriefData } from "./storage";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ── Base HTML template ─────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ContextDrop</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f0e0d;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">

    <div style="text-align:center;margin-bottom:32px;padding-top:8px;">
      <span style="font-size:22px;letter-spacing:-0.02em;color:#0f0e0d;">
        Context<span style="color:#d4522a;">Drop</span>
      </span>
    </div>

    <div style="background:#ffffff;border:1px solid #d8d0c0;border-radius:8px;padding:40px;">
      ${content}
    </div>

    <p style="text-align:center;font-size:12px;color:#8a8070;margin-top:24px;font-weight:300;">
      © 2026 ContextDrop · Fait avec ☕ pour les freelances
    </p>
  </div>
</body>
</html>`;
}

// ── Email 1 : Bienvenue ────────────────────────────────────────

export async function sendWelcomeEmail(email: string) {
  const content = `
    <h1 style="font-family:Georgia,serif;font-size:28px;font-style:italic;color:#0f0e0d;margin:0 0 16px;line-height:1.2;">
      Bienvenue sur ContextDrop 👋
    </h1>
    <p style="font-size:15px;color:#8a8070;line-height:1.7;margin:0 0 24px;font-weight:300;">
      Tu fais partie de la famille ContextDrop. Fini les briefs clients flous —
      envoie un lien juste après ta visio, ton client valide en 5&nbsp;minutes.
    </p>
    <div style="background:#f5f0e8;border-radius:6px;padding:24px;margin:0 0 28px;">
      <p style="font-size:14px;color:#0f0e0d;margin:0 0 10px;font-weight:500;">Pour commencer :</p>
      <ol style="font-size:14px;color:#8a8070;line-height:1.9;margin:0;padding-left:18px;font-weight:300;">
        <li>Créez votre premier brief dans le dashboard</li>
        <li>Ajoutez vos notes de contexte (optionnel)</li>
        <li>Copiez le lien et envoyez-le à votre client juste après votre appel</li>
        <li>Recevez le brief structuré et signé</li>
      </ol>
    </div>
    <a href="${APP_URL}/dashboard"
       style="display:inline-block;background:#d4522a;color:white;padding:14px 32px;border-radius:2px;text-decoration:none;font-size:15px;font-weight:500;letter-spacing:0.01em;">
      Accéder à mon dashboard →
    </a>
  `;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bienvenue sur ContextDrop 👋",
    html: baseTemplate(content),
  });
}

// ── Email 2 : Brief complété ───────────────────────────────────

export async function sendBriefCompletedEmail(
  email: string,
  projectName: string,
  briefData: BriefData
) {
  const fields: Array<{ label: string; value: string }> = [
    { label: "Objectif", value: briefData.objective },
    { label: "Public cible", value: briefData.audience },
    { label: "Budget", value: briefData.budget },
    { label: "Délais", value: briefData.deadline },
    { label: "Contraintes techniques", value: briefData.tech_constraints },
    { label: "Références", value: briefData.references },
  ].filter((f) => f.value && f.value.length > 4);

  const fieldsHtml = fields
    .map(
      (f) => `
    <div style="padding:12px 0;border-bottom:1px solid #ede8dc;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#8a8070;margin-bottom:4px;">${f.label}</div>
      <div style="font-size:14px;color:#0f0e0d;line-height:1.6;">${f.value}</div>
    </div>`
    )
    .join("");

  const content = `
    <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:28px;">
      <div style="width:44px;height:44px;background:#d4522a;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;color:white;line-height:1;">✓</div>
      <div>
        <h1 style="font-family:Georgia,serif;font-size:22px;font-style:italic;color:#0f0e0d;margin:0 0 4px;">Brief complété ✓</h1>
        <p style="font-size:13px;color:#d4522a;margin:0;font-weight:500;">${projectName}</p>
      </div>
    </div>
    <div style="background:#f5f0e8;border-radius:6px;padding:20px;margin:0 0 24px;font-size:14px;color:#8a8070;line-height:1.7;font-weight:300;">
      ${briefData.summary}
    </div>
    <div style="margin:0 0 28px;">${fieldsHtml}</div>
    <a href="${APP_URL}/dashboard"
       style="display:inline-block;background:#d4522a;color:white;padding:14px 32px;border-radius:2px;text-decoration:none;font-size:15px;font-weight:500;">
      Voir le brief dans le dashboard →
    </a>
  `;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Brief complété — ${projectName} ✓`,
    html: baseTemplate(content),
  });
}

// ── Email 3 : Confirmation abonnement ─────────────────────────

export async function sendSubscriptionEmail(email: string, plan: string) {
  const plans: Record<string, { name: string; price: string; features: string[] }> = {
    solo: {
      name: "Solo",
      price: "9€/mois",
      features: [
        "15 briefs par mois",
        "PDF brandé avec votre logo",
        "Rappels automatiques client",
        "Support email",
      ],
    },
    agence: {
      name: "Agence",
      price: "49€/mois",
      features: [
        "Briefs illimités",
        "Multi-utilisateurs (5 comptes)",
        "Intégration Notion et Slack",
        "Support prioritaire",
        "Statistiques avancées",
      ],
    },
  };

  const info = plans[plan] ?? plans.solo;
  const featuresHtml = info.features
    .map(
      (f) => `
    <li style="font-size:14px;color:#8a8070;line-height:1.8;font-weight:300;padding:2px 0;">
      <span style="color:#d4522a;margin-right:8px;">✓</span>${f}
    </li>`
    )
    .join("");

  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:40px;margin-bottom:12px;">🎉</div>
      <h1 style="font-family:Georgia,serif;font-size:24px;font-style:italic;color:#0f0e0d;margin:0 0 8px;">Abonnement confirmé !</h1>
      <p style="font-size:14px;color:#8a8070;margin:0;font-weight:300;">
        Vous êtes maintenant sur le plan <strong style="color:#0f0e0d;">${info.name}</strong>
      </p>
    </div>
    <div style="border:1px solid #d8d0c0;border-radius:8px;padding:24px;margin:0 0 28px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #ede8dc;">
        <div>
          <div style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#8a8070;margin-bottom:4px;">Plan actif</div>
          <div style="font-size:20px;color:#0f0e0d;font-weight:500;">${info.name}</div>
        </div>
        <div style="font-size:22px;color:#d4522a;font-weight:600;">${info.price}</div>
      </div>
      <ul style="list-style:none;margin:0;padding:0;">${featuresHtml}</ul>
    </div>
    <a href="${APP_URL}/dashboard"
       style="display:inline-block;background:#d4522a;color:white;padding:14px 32px;border-radius:2px;text-decoration:none;font-size:15px;font-weight:500;">
      Accéder à mon dashboard →
    </a>
  `;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Confirmation de ton abonnement ContextDrop",
    html: baseTemplate(content),
  });
}
