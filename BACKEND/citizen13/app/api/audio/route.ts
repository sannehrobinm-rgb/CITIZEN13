import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const audios = await (prisma as any).audio.findMany({ orderBy: { created_at: "desc" }, include: { form: true } });
    return NextResponse.json(audios);
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const audio = await (prisma as any).audio.create({ data: body });
    return NextResponse.json(audio, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}