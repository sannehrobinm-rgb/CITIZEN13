import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await (prisma as any).tractage.findMany({
      orderBy: { created_at: "desc" },
      include: { agent: true },
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await (prisma as any).tractage.create({
      data: {
        nom_benevole: body.nom_benevole,
        date: body.date || new Date().toLocaleDateString("fr-FR"),
        quartier: body.quartier,
        adresse: body.adresse,
        nb_tracts: parseInt(body.nb_tracts) || 0,
        nb_portes: parseInt(body.nb_portes) || 0,
        commentaire: body.commentaire,
        agent_id: body.agent_id ? parseInt(body.agent_id) : null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}
