import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await (prisma as any).form_templates.findMany({
      orderBy: { created_at: "desc" },
    });
    // Si aucun template en DB, retourne le template par défaut
    if (templates.length === 0) {
      return NextResponse.json([{
        id: 1,
        title: "Formulaire Citoyen",
        isActive: true,
        questions: [
          "Êtes-vous inscrit sur les listes électorales ?",
          "Quelle est votre intention de vote ?",
          "Quels sont vos thèmes importants ?",
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]);
    }
    return NextResponse.json(templates);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) return NextResponse.json({ error: "Titre obligatoire" }, { status: 400 });
    const template = await (prisma as any).form_templates.create({
      data: {
        title: body.title,
        questions: body.questions ?? [],
        isActive: body.isActive ?? true,
        rib: body.rib ?? null,
      },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}