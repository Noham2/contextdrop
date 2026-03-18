import { NextRequest, NextResponse } from "next/server";

// TODO: Implémenter le webhook Stripe
// 1. Ajouter STRIPE_WEBHOOK_SECRET dans .env.local
// 2. Vérifier la signature avec stripe.webhooks.constructEvent()
// 3. Gérer les événements : checkout.session.completed, customer.subscription.deleted, etc.
// 4. Mettre à jour le plan de l'utilisateur dans la base de données

export async function POST(req: NextRequest) {
  // const sig = req.headers.get("stripe-signature");
  // const body = await req.text();
  // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  console.log("[stripe/webhook] Webhook reçu");

  return NextResponse.json({ received: true });
}
