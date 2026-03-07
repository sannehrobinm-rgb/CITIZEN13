import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/forms/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const form = await (prisma as any).quiz_forms.findUnique({
      where: { id: parseInt(params.id) },
    });
    if (!form) {
      return NextResponse.json(
        { success: false, message: "Formulaire introuvable" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: form });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

// PUT /api/forms/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await (prisma as any).quiz_forms.update({
      where: { id: parseInt(params.id) },
      data: body,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ success: false, message: "Formulaire introuvable" }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/forms/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await (prisma as any).quiz_forms.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true, message: "Formulaire supprimé" });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ success: false, message: "Formulaire introuvable" }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}