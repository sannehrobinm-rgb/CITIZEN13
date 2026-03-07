import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const forms = await (prisma as any).quiz_forms.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json({ success: true, data: forms });
  } catch (err) {
    console.error("❌ GET /api/forms:", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const form = await (prisma as any).quiz_forms.create({ data: body });
    return NextResponse.json({ success: true, id: form.id }, { status: 201 });
  } catch (err) {
    console.error("❌ POST /api/forms:", err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}