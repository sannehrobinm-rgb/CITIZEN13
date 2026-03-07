import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agent = await (prisma as any).agents.findUnique({ where: { id: parseInt(id) }, include: { visites: true, dons: true } });
    if (!agent) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
    const { password, ...safe } = agent;
    return NextResponse.json(safe);
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { password, id: _id, created_at, ...body } = await req.json();
    const hashed = password ? await bcrypt.hash(password, 10) : undefined;
    const agent = await (prisma as any).agents.update({
      where: { id: parseInt(id) },
      data: { ...body, ...(hashed ? { password: hashed } : {}) },
    });
    const { password: __, ...safe } = agent;
    return NextResponse.json(safe);
  } catch (err) {
    return NextResponse.json({ error: "Erreur modification" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await (prisma as any).agents.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}