import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const responses = await (prisma as any).quiz_forms.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(responses);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}