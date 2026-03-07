import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

    const agent = await (prisma as any).agents.findUnique({ where: { email } });
    if (!agent || !agent.password)
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });

    const valid = await bcrypt.compare(password, agent.password);
    if (!valid)
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });

    if (!agent.actif)
      return NextResponse.json({ error: "Compte désactivé" }, { status: 403 });

    const token = jwt.sign(
      { id: agent.id, email: agent.email, role: agent.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      role: agent.role,
      user: { id: agent.id, nom: agent.nom, prenom: agent.prenom, email: agent.email, role: agent.role, zone: agent.zone },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}