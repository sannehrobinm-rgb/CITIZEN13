import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const agents = await (prisma as any).agents.findMany({ orderBy: { created_at: "desc" } });
    return NextResponse.json(agents);
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const agent = await (prisma as any).agents.create({ data: body });
    return NextResponse.json(agent, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}