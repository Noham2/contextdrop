// ─── Plan definitions ──────────────────────────────────────────────────────

export type PlanId = "free" | "solo" | "agency";

export interface Plan {
  id: PlanId;
  name: string;
  price: { monthly: number; annual: number; annualTotal: number };
  briefsPerMonth: number; // -1 = unlimited
  badge?: string;
  featured?: boolean;
  features: { text: string; highlight?: boolean }[];
  cta: string;
  stripePlan?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Gratuit",
    price: { monthly: 0, annual: 0, annualTotal: 0 },
    briefsPerMonth: 3,
    cta: "Commencer gratuitement",
    features: [
      { text: "3 briefs par mois" },
      { text: "Export PDF standard" },
      { text: "Lien de brief personnalisé" },
      { text: "Signature client" },
    ],
  },
  solo: {
    id: "solo",
    name: "Solo",
    price: { monthly: 9, annual: 7, annualTotal: 84 },
    briefsPerMonth: 15,
    badge: "Populaire",
    featured: true,
    cta: "Essai gratuit 14 jours",
    stripePlan: "solo",
    features: [
      { text: "15 briefs par mois", highlight: true },
      { text: "PDF brandé avec logo", highlight: true },
      { text: "Rappels automatiques client" },
      { text: "Support email" },
    ],
  },
  agency: {
    id: "agency",
    name: "Agence",
    price: { monthly: 49, annual: 39, annualTotal: 468 },
    briefsPerMonth: -1,
    cta: "Essai gratuit 14 jours",
    stripePlan: "agency",
    features: [
      { text: "Briefs illimités", highlight: true },
      { text: "Multi-utilisateurs (5 comptes)", highlight: true },
      { text: "Intégration Notion et Slack" },
      { text: "Support prioritaire" },
      { text: "Statistiques avancées" },
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "solo", "agency"];

// ─── localStorage helpers ──────────────────────────────────────────────────

const PLAN_KEY = "contextdrop_plan";

export function getUserPlan(): PlanId {
  if (typeof window === "undefined") return "free";
  const stored = localStorage.getItem(PLAN_KEY);
  if (stored === "solo" || stored === "agency") return stored;
  return "free";
}

export function setUserPlan(plan: PlanId): void {
  localStorage.setItem(PLAN_KEY, plan);
}

// ─── Usage helpers ─────────────────────────────────────────────────────────

/**
 * Compte les briefs créés ce mois-ci dans localStorage.
 * Import from storage to avoid circular deps — we read raw JSON here.
 */
export function getBriefCountThisMonth(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("contextdrop_projects");
    if (!raw) return 0;
    const projects: Array<{ createdAt: string }> = JSON.parse(raw);
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return projects.filter((p) => new Date(p.createdAt) >= firstOfMonth).length;
  } catch {
    return 0;
  }
}

export function canCreateBrief(): boolean {
  const plan = getUserPlan();
  const limit = PLANS[plan].briefsPerMonth;
  if (limit === -1) return true;
  return getBriefCountThisMonth() < limit;
}

export function getBriefLimit(): number {
  return PLANS[getUserPlan()].briefsPerMonth;
}
