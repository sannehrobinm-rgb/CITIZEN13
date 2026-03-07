import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const visites = await (prisma as any).visites.findMany({ orderBy: { created_at: "desc" }, include: { agent: true, form: true } });
    return NextResponse.json(visites);
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const visite = await (prisma as any).visites.create({ data: body });
    return NextResponse.json(visite, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}