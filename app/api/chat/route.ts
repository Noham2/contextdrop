import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ── Helpers ────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function exchangeCount(messages: Message[]): number {
  return messages.filter((m) => m.role === "assistant").length;
}

function userAnswers(messages: Message[]): string[] {
  return messages.filter((m) => m.role === "user").slice(1).map((m) => m.content.trim());
}

function lastUserMsg(messages: Message[]): string {
  const user = messages.filter((m) => m.role === "user");
  return user[user.length - 1]?.content.trim() ?? "";
}

function cite(text: string, maxWords = 7): string {
  const clean = text.replace(/[.!?]+$/, "").trim().toLowerCase();
  const words = clean.split(/\s+/);
  return words.slice(0, maxWords).join(" ") + (words.length > maxWords ? "…" : "");
}

function extractBudget(text: string): string | null {
  const m = text.match(/(\d[\d\s.]*(?:k|000)?\s*(?:€|euros?|EUR)?)/i);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

function isVague(text: string): boolean {
  if (text.length < 10) return true;
  return /^\s*(oui|non|ok|bien|beau|joli|moderne|simple|clean|cool|sympa|basique)\s*\.?\s*$/i.test(text);
}

function hadPriorExchange(answer: string): boolean {
  return /oui|yes|appel|visio|rencontre|réunion|call|échange|parlé|discuté/i.test(answer);
}

// ── Responses ──────────────────────────────────────────────────

function buildResponse(messages: Message[], notes?: string): string {
  const step = exchangeCount(messages);
  const answers = userAnswers(messages);
  const last = lastUserMsg(messages);

  switch (step) {
    case 0: {
      if (notes && notes.trim().length > 10) {
        return `Bonjour ! Votre freelance m'a partagé quelques éléments de votre échange. Permettez-moi de confirmer et d'approfondir certains points.\n\nPremière question : quel est l'objectif principal de votre projet ? Qu'est-ce que vous cherchez à accomplir concrètement ?`;
      }
      return `Avez-vous déjà eu un échange avec votre freelance (appel, visio, rencontre) ?`;
    }

    case 1: {
      if (notes && notes.trim().length > 10) {
        // Notes mode — step 1 is the objective
        const snippet = cite(last, 8);
        return `Ok, "${snippet}" — c'est noté.\n\nÀ qui s'adresse ce projet ? Décrivez votre client idéal : âge, profil, ce qui le motive à vous contacter.`;
      }
      // No notes mode — step 1 is "did you have an exchange?"
      if (hadPriorExchange(last)) {
        return `Super. Suite à votre échange, pouvez-vous confirmer l'objectif principal du projet ? Qu'est-ce que vous cherchez à accomplir concrètement pour votre activité ?`;
      }
      return `Pas de problème, je vais vous guider depuis le début.\n\nQuel est l'objectif principal de ce projet ? Qu'est-ce que vous cherchez à accomplir concrètement ?`;
    }

    case 2: {
      const snippet = cite(last, 8);
      const isDesign = /logo|identité|brand|charte|visuel|design/i.test(answers[0] ?? "");
      const isDev = /site|application|app|web|plateforme|e-commerce/i.test(answers[0] ?? "");
      let ctx = "";
      if (isDesign) ctx = " — projet de création visuelle, c'est bien ça ?";
      else if (isDev) ctx = " — projet digital, c'est noté.";
      return `"${snippet}"${ctx}\n\nCôté budget — vous avez une enveloppe prévue ? Même une fourchette large m'aide à bien calibrer la proposition.`;
    }

    case 3: {
      const amount = extractBudget(last);
      if (!amount && isVague(last)) {
        return `Je comprends que ce n'est pas toujours simple à chiffrer. Pour avancer : est-ce qu'on est plutôt autour de 500–1 000€, de 2 000–5 000€, ou davantage ?`;
      }
      const budgetStr = amount ?? cite(last, 5);
      return `${budgetStr} — c'est noté.\n\nEst-ce que vous avez une deadline en tête ? Un événement, un lancement, une date à ne pas dépasser ?`;
    }

    case 4: {
      const isUrgent = /urgent|asap|vite|semaine prochaine|cette semaine|demain/i.test(last);
      const snippet = cite(last, 5);
      if (isUrgent) {
        return `"${snippet}" — c'est serré, je note l'urgence.\n\nQuels sont les livrables attendus exactement ? Soyez précis : formats, quantités, supports (print, web…).`;
      }
      return `"${snippet}" — ça laisse un délai raisonnable.\n\nQuels sont les livrables attendus à la fin du projet ? Plus c'est précis, mieux c'est.`;
    }

    case 5: {
      const snippet = cite(last, 6);
      return `Livrables notés : "${snippet}".\n\nAvez-vous des références visuelles ou des projets qui vous inspirent ? Des marques, des sites, des concurrents bien faits ?`;
    }

    case 6: {
      const snippet = cite(last, 5);
      const isVagueStyle = /moderne|clean|simple|minimaliste|épuré|élégant|sobre/i.test(last) && !/https?:\/\/|www\.|\.com|\.fr|apple|nike|notion/i.test(last);
      if (isVagueStyle) {
        const term = (last.match(/moderne|clean|simple|minimaliste|épuré|élégant|sobre/i) ?? ["moderne"])[0];
        return `"${term}" peut désigner des styles très différents ! Pouvez-vous citer 2 ou 3 marques ou sites dont vous aimez vraiment l'esthétique ?`;
      }
      return `"${snippet}" — bonne direction créative.\n\nY a-t-il des contraintes techniques à respecter ? Charte existante, stack imposée, intégrations, formats spécifiques…`;
    }

    case 7: {
      return `Bien noté pour les contraintes.\n\nDernière question — comment saurez-vous que ce projet est une réussite ? Quels critères concrets vous permettront de dire "c'est exactement ce que je voulais" ?`;
    }

    case 8: {
      return `Merci pour toutes ces informations — j'ai tout ce qu'il me faut. Je prépare votre brief structuré…`;
    }

    default:
      return buildFinalJSON(answers, notes);
  }
}

// ── Final JSON builder ─────────────────────────────────────────

function buildFinalJSON(answers: string[], notes?: string): string {
  const [
    ans0 = "", // objective (or "did you have exchange" answer if no notes)
    ans1 = "", // audience (or objective if no notes)
    ans2 = "", // budget
    ans3 = "", // deadline
    ans4 = "", // deliverables
    ans5 = "", // inspirations
    ans6 = "", // constraints
    ans7 = "", // success criteria
  ] = answers;

  // With notes: answers start at objective (ans0)
  // Without notes: ans0 = "did you have exchange", ans1 = objective, etc.
  const hasNotes = notes && notes.trim().length > 10;
  const objectiveRaw = hasNotes ? ans0 : ans1;
  const audienceRaw = hasNotes ? ans1 : ans2;
  const budgetRaw = hasNotes ? ans2 : ans3;
  const deadlineRaw = hasNotes ? ans3 : ans4;
  const deliverablesRaw = hasNotes ? ans4 : ans5;
  const inspirationsRaw = hasNotes ? ans5 : ans6;
  const constraintsRaw = hasNotes ? ans6 : ans7;

  const budgetAmount = extractBudget(budgetRaw);

  const summary = [
    `Suite à votre échange avec votre freelance, voici le brief validé de votre projet :`,
    objectiveRaw ? ` Projet visant à ${objectiveRaw.replace(/^(c'est |je veux |on veut )/i, "").replace(/[.!?]+$/, "").trim().toLowerCase()}.` : "",
    audienceRaw ? ` Destiné à ${audienceRaw.replace(/[.!?]+$/, "").trim().toLowerCase()}.` : "",
    budgetAmount ? ` Enveloppe budgétaire de ${budgetAmount}.` : "",
    deadlineRaw ? ` Livraison prévue ${deadlineRaw.replace(/[.!?]+$/, "").trim().toLowerCase()}.` : "",
  ].filter(Boolean).join("");

  return JSON.stringify({
    objective: objectiveRaw || "Objectif à préciser.",
    audience: audienceRaw || "Audience à définir.",
    budget: budgetAmount ? `Budget alloué : ${budgetRaw}.` : budgetRaw || "Budget non précisé.",
    deadline: deadlineRaw || "Délais à confirmer.",
    tech_constraints: constraintsRaw || "Aucune contrainte technique identifiée.",
    references: inspirationsRaw || "Aucune référence fournie.",
    deliverables: deliverablesRaw || "",
    success_criteria: "",
    summary,
  });
}

// ── Route handler ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, notes }: { messages: Message[]; notes?: string } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages invalides" }, { status: 400 });
    }

    // Realistic response delay
    await delay(600 + Math.random() * 500);

    const step = exchangeCount(messages);
    const answers = userAnswers(messages);

    // Generate final JSON once we have enough answers
    const threshold = (notes && notes.trim().length > 10) ? 9 : 10;
    if (step >= threshold || answers.length >= 8) {
      return NextResponse.json({ message: buildFinalJSON(answers, notes) });
    }

    return NextResponse.json({ message: buildResponse(messages, notes) });
  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return NextResponse.json(
      { error: "Service temporairement indisponible" },
      { status: 503 }
    );
  }
}
