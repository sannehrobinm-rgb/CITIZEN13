import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

export async function POST(req: NextRequest) {
  try {
    const { email, nom, prenom, password } = await req.json();

    if (!email || !nom) {
      return NextResponse.json({ error: "Email et nom requis" }, { status: 400 });
    }

    const loginUrl = `${APP_URL}/login`;
    const agentName = prenom ? `${prenom} ${nom}` : nom;

    const { data, error } = await resend.emails.send({
      from: "Citizen13 <onboarding@resend.dev>",
      to: email,
      subject: "🏙️ Bienvenue sur Citizen13 — Vos accès",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#f0f7f4;font-family:'Segoe UI',sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#1a6b2e 0%,#1a7a6b 50%,#1a3a6b 100%);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px">Citizen13</h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">13ème arrondissement de Paris</p>
            </div>

            <!-- Body -->
            <div style="background:white;border-radius:0 0 16px 16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <h2 style="color:#111;font-size:18px;margin:0 0 8px;">Bonjour ${agentName} 👋</h2>
              <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">
                Votre compte bénévole Citizen13 a été créé. Vous pouvez maintenant accéder à l'application pour enregistrer vos visites terrain.
              </p>

              <!-- Credentials -->
              <div style="background:#f0f7f4;border-radius:12px;padding:20px;margin-bottom:24px;border-left:4px solid #1a6b2e;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px;">Vos identifiants</p>
                <p style="margin:0 0 8px;font-size:14px;color:#111;"><strong>Email :</strong> ${email}</p>
                <p style="margin:0;font-size:14px;color:#111;"><strong>Mot de passe :</strong> ${password || "admin000"}</p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a6b2e,#1a3a6b);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
                  → Accéder à l'application
                </a>
              </div>

              <p style="color:#aaa;font-size:12px;text-align:center;margin:0;">
                Pensez à changer votre mot de passe après votre première connexion.<br>
                En cas de problème, contactez votre administrateur.
              </p>
            </div>

            <p style="text-align:center;color:#bbb;font-size:11px;margin-top:16px;">
              Citizen13 · Association citoyenne du 13ème arrondissement
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Erreur envoi mail" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
