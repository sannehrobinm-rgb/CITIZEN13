import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const agents = await (prisma as any).agents.findMany({ orderBy: { created_at: "desc" } });
    // Ne jamais retourner le mot de passe
    return NextResponse.json(agents.map((a: any) => { const { password, ...rest } = a; return rest; }));
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { password, ...body } = await req.json();
    if (!body.nom) return NextResponse.json({ error: "Nom obligatoire" }, { status: 400 });
    const hashed = password ? await bcrypt.hash(password, 10) : undefined;
    const agent = await (prisma as any).agents.create({
      data: { ...body, ...(hashed ? { password: hashed } : {}) },
    });
    const { password: _, ...safe } = agent;
    return NextResponse.json(safe, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}