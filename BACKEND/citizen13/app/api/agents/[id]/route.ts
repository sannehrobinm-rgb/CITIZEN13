import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agent = await (prisma as any).agents.findUnique({ where: { id: parseInt(params.id) }, include: { visites: true, dons: true } });
    if (!agent) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
    return NextResponse.json(agent);
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const agent = await (prisma as any).agents.update({ where: { id: parseInt(params.id) }, data: body });
    return NextResponse.json(agent);
  } catch (err) {
    return NextResponse.json({ error: "Erreur modification" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await (prisma as any).agents.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}