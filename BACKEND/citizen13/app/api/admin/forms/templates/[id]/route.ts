import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const template = await (prisma as any).form_templates.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        questions: body.questions,
        isActive: body.isActive,
        rib: body.rib,
      },
    });
    return NextResponse.json(template);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur modification" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await (prisma as any).form_templates.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}