// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const MAILJET_API_KEY = process.env.MAILJET_API_KEY!;
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY!;
const SENDER_EMAIL = process.env.MAILJET_SENDER_EMAIL || "sanneh.robin.m@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

    // Vérifie si l'agent existe (on répond toujours OK pour ne pas divulguer les emails)
    const agent = await (prisma as any).agents.findUnique({ where: { email } });

    if (agent) {
      // Génère un token sécurisé valable 1h
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // +1h

      // Sauvegarde le token en base
      await (prisma as any).agents.update({
        where: { email },
        data: {
          reset_token: token,
          reset_token_expires: expires,
        },
      });

      const resetLink = `${APP_URL}/reset-password?token=${token}`;
      const agentName = agent.prenom ? `${agent.prenom} ${agent.nom}` : agent.nom;

      // Envoi du mail via Mailjet
      const credentials = Buffer.from(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`).toString("base64");

      await fetch("https://api.mailjet.com/v3.1/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${credentials}`,
        },
        body: JSON.stringify({
          Messages: [
            {
              From: { Email: SENDER_EMAIL, Name: "Citizen13" },
              To: [{ Email: email, Name: agentName }],
              Subject: "🔐 Réinitialisation de votre mot de passe Citizen13",
              HTMLPart: `
                <div style="max-width:560px;margin:0 auto;font-family:'Segoe UI',sans-serif;">
                  <div style="background:linear-gradient(135deg,#1a6b2e,#1a3a6b);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
                    <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">Citizen13</h1>
                    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">13ème arrondissement de Paris</p>
                  </div>
                  <div style="background:white;border-radius:0 0 16px 16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <h2 style="color:#111;font-size:18px;margin:0 0 12px;">Bonjour ${agentName} 👋</h2>
                    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">
                      Vous avez demandé la réinitialisation de votre mot de passe.<br/>
                      Ce lien est valable <strong>1 heure</strong>.
                    </p>
                    <div style="text-align:center;margin-bottom:24px;">
                      <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#1a6b2e,#1a3a6b);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
                        🔐 Réinitialiser mon mot de passe
                      </a>
                    </div>
                    <p style="color:#aaa;font-size:12px;text-align:center;">
                      Si vous n'avez pas fait cette demande, ignorez cet email.
                    </p>
                  </div>
                </div>
              `,
            },
          ],
        }),
      });
    }

    // Toujours répondre OK (sécurité : ne pas révéler si l'email existe)
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur forgot-password:", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
