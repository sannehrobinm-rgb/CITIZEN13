import { NextRequest, NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

export async function POST(req: NextRequest) {
  try {
    const { email, nom, prenom, password } = await req.json();
    console.log("Envoi à:", email);

    if (!email || !nom) {
      return NextResponse.json({ error: "Email et nom requis" }, { status: 400 });
    }

    const agentName = prenom ? `${prenom} ${nom}` : nom;

    const apiKey = process.env.MAILJET_API_KEY!;
    const secretKey = process.env.MAILJET_SECRET_KEY!;
    const senderEmail = process.env.MAILJET_SENDER_EMAIL || "sanneh.robin.m@gmail.com";

    const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${credentials}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: senderEmail, Name: "Citizen13" },
            To: [{ Email: email, Name: agentName }],
            Subject: "🏙️ Bienvenue sur Citizen13 — Vos accès",
            HTMLPart: `
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
                    <a href="${APP_URL}/login" style="display:inline-block;background:linear-gradient(135deg,#1a6b2e,#1a3a6b);color:#1a6b2e;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
                      → Accéder à l'application
                    </a>
                  </div>
                </div>
              </div>
            `,
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("Mailjet response:", JSON.stringify(data));

    const status = data?.Messages?.[0]?.Status;
    if (status !== "success") {
      const errMsg = data?.Messages?.[0]?.Errors?.[0]?.ErrorMessage || "Erreur Mailjet";
      console.error("Mailjet error:", errMsg);
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur invite:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
