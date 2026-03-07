import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { archived } = await req.json();
    const updated = await (prisma as any).quiz_forms.update({
      where: { id: parseInt(params.id) },
      data: { archived },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}