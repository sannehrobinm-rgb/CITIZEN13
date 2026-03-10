import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

export async function POST(req: NextRequest) {
  try {
    console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "présente" : "MANQUANTE");
    const { email, nom, prenom, password } = await req.json();
    console.log("Envoi à:", email);

    if (!email || !nom) {
      return NextResponse.json({ error: "Email et nom requis" }, { status: 400 });
    }

    const agentName = prenom ? `${prenom} ${nom}` : nom;

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "🏙️ Bienvenue sur Citizen13 — Vos accès",
      html: `
        <div style="max-width:560px;margin:0 auto;font-family:'Segoe UI',sans-serif;">
          <div style="background:linear-gradient(135deg,#1a6b2e,#1a3a6b);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">Citizen13</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">13ème arrondissement de Paris</p>
          </div>
          <div style="background:white;border-radius:0 0 16px 16px;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <h2 style="color:#111;font-size:18px;margin:0 0 8px;">Bonjour ${agentName} 👋</h2>
            <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Votre compte bénévole Citizen13 a été créé.
            </p>
            <div style="background:#f0f7f4;border-radius:12px;padding:20px;margin-bottom:24px;border-left:4px solid #1a6b2e;">
              <p style="margin:0 0 8px;font-size:14px;color:#111;"><strong>Email :</strong> ${email}</p>
              <p style="margin:0;font-size:14px;color:#111;"><strong>Mot de passe :</strong> ${password || "admin000"}</p>
            </div>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${APP_URL}/login" style="display:inline-block;background:linear-gradient(135deg,#1a6b2e,#1a3a6b);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
                → Accéder à l'application
              </a>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Resend data:", data);
    console.log("Resend error:", error);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error("Erreur invite:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}