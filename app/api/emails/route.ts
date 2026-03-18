import { NextRequest, NextResponse } from "next/server";
import {
  sendWelcomeEmail,
  sendBriefCompletedEmail,
  sendSubscriptionEmail,
} from "@/lib/emails";
import type { BriefData } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, email, ...rest } = body;

    if (!type || !email) {
      return NextResponse.json({ error: "type et email requis" }, { status: 400 });
    }

    switch (type) {
      case "welcome":
        await sendWelcomeEmail(email);
        break;

      case "brief_completed": {
        const { projectName, briefData } = rest as {
          projectName: string;
          briefData: BriefData;
        };
        if (!projectName || !briefData) {
          return NextResponse.json({ error: "projectName et briefData requis" }, { status: 400 });
        }
        await sendBriefCompletedEmail(email, projectName, briefData);
        break;
      }

      case "subscription": {
        const { plan } = rest as { plan: string };
        if (!plan) {
          return NextResponse.json({ error: "plan requis" }, { status: 400 });
        }
        await sendSubscriptionEmail(email, plan);
        break;
      }

      default:
        return NextResponse.json({ error: "Type d'email inconnu" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/emails] Error:", err);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }
}
