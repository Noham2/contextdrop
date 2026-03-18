/**
 * lib/stripe.ts
 * Structure Stripe — à connecter quand les clés API seront renseignées.
 *
 * TODO:
 *  1. Ajouter STRIPE_SECRET_KEY dans .env.local
 *  2. Ajouter NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY dans .env.local
 *  3. Créer les produits/prix dans le dashboard Stripe
 *  4. Renseigner les price IDs ci-dessous
 *  5. Décommenter l'initialisation Stripe
 */

import type { PlanId } from "./plans";

// TODO: décommenter après avoir renseigné STRIPE_SECRET_KEY
// import Stripe from "stripe";
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20",
// });

/** Price IDs Stripe — à renseigner depuis le dashboard stripe.com */
export const STRIPE_PRICE_IDS: Record<Exclude<PlanId, "free">, { monthly: string; annual: string }> = {
  solo: {
    monthly: "price_TODO_solo_monthly",
    annual: "price_TODO_solo_annual",
  },
  agency: {
    monthly: "price_TODO_agency_monthly",
    annual: "price_TODO_agency_annual",
  },
};

/** URLs de redirection après paiement */
export const STRIPE_URLS = {
  success: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard?checkout=success`,
  cancel: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/pricing?checkout=cancel`,
};

/**
 * Crée une session Stripe Checkout.
 * TODO: implémenter quand Stripe est connecté.
 */
export async function createCheckoutSession(
  _plan: Exclude<PlanId, "free">,
  _billing: "monthly" | "annual",
  _customerEmail?: string
): Promise<{ url: string }> {
  // TODO: décommenter et implémenter
  // const priceId = STRIPE_PRICE_IDS[_plan][_billing];
  // const session = await stripe.checkout.sessions.create({
  //   mode: "subscription",
  //   payment_method_types: ["card"],
  //   line_items: [{ price: priceId, quantity: 1 }],
  //   customer_email: _customerEmail,
  //   success_url: STRIPE_URLS.success,
  //   cancel_url: STRIPE_URLS.cancel,
  // });
  // return { url: session.url! };

  throw new Error("Stripe non configuré — renseigner les clés API dans .env.local");
}
