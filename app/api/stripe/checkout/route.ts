import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/stripe/checkout
 *
 * TODO: connecter Stripe quand les clés sont renseignées dans .env.local
 *
 * Body attendu: { plan: "solo" | "agency", billing: "monthly" | "annual", email?: string }
 *
 * Implémentation:
 *  1. Renseigner STRIPE_SECRET_KEY dans .env.local
 *  2. Décommenter l'import stripe dans lib/stripe.ts
 *  3. Remplacer les price IDs dans STRIPE_PRICE_IDS
 *  4. Remplacer le corps de ce handler par la vraie logique ci-dessous
 */
export async function POST(req: NextRequest) {
  // TODO: décommenter quand Stripe est configuré
  // const { plan, billing, email } = await req.json();
  // if (!plan || !billing) return NextResponse.json({ error: "plan et billing requis" }, { status: 400 });
  // try {
  //   const { createCheckoutSession } = await import("@/lib/stripe");
  //   const { url } = await createCheckoutSession(plan, billing, email);
  //   return NextResponse.json({ url });
  // } catch (err) {
  //   return NextResponse.json({ error: String(err) }, { status: 500 });
  // }

  return NextResponse.json(
    { message: "Bientôt disponible — Stripe sera connecté au lancement." },
    { status: 200 }
  );
}

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get("plan");
  // Redirige vers /pricing avec un message "bientôt dispo"
  return NextResponse.redirect(
    new URL(`/pricing?soon=${plan ?? ""}`, req.url)
  );
}
