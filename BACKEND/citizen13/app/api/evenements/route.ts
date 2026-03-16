import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await (prisma as any).evenements.findMany({ orderBy: { created_at: "desc" } });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await (prisma as any).evenements.create({
      data: {
        titre: body.titre,
        date: body.date,
        heure: body.heure,
        adresse: body.adresse,
        sujets: body.sujets,
        photo_url: body.photo_url,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}