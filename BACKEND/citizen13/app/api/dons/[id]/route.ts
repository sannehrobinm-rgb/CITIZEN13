import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const don = await (prisma as any).dons.update({ where: { id: parseInt(params.id) }, data: body });
    return NextResponse.json(don);
  } catch (err) {
    return NextResponse.json({ error: "Erreur modification" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await (prisma as any).dons.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}