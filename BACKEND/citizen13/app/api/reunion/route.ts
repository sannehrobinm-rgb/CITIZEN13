import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await (prisma as any).reunion.findMany({ orderBy: { created_at: "desc" } });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await (prisma as any).reunion.create({
      data: {
        titre: body.titre,
        date: body.date,
        lieu: body.lieu,
        ordre_du_jour: body.ordre_du_jour,
        participants: body.participants,
        transcription: body.transcription,
        rapport: body.rapport,
        agent_nom: body.agent_nom,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}