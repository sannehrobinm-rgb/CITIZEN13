import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    // Pour l'instant retourne les données mises à jour
    // À connecter à une vraie DB plus tard
    return NextResponse.json({ success: true, data: { ...body, id: params.id } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}