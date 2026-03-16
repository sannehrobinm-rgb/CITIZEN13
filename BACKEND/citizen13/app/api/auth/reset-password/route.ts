// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password)
      return NextResponse.json({ error: "Token et mot de passe requis" }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: "Le mot de passe doit faire au moins 6 caractères" }, { status: 400 });

    // Trouve l'agent avec ce token non expiré
    const agent = await (prisma as any).agents.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: { gt: new Date() }, // token encore valide
      },
    });

    if (!agent)
      return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 });

    // Hash du nouveau mot de passe
    const hashed = await bcrypt.hash(password, 10);

    // Met à jour le mot de passe et supprime le token
    await (prisma as any).agents.update({
      where: { id: agent.id },
      data: {
        password: hashed,
        reset_token: null,
        reset_token_expires: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur reset-password:", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
