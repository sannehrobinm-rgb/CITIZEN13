import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dons = await (prisma as any).dons.findMany({ orderBy: { created_at: "desc" }, include: { agent: true } });
    return NextResponse.json(dons);
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const don = await (prisma as any).dons.create({ data: body });
    return NextResponse.json(don, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}