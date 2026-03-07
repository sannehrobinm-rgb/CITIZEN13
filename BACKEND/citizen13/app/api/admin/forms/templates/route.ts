import { NextResponse } from "next/server";

// Templates statiques pour l'instant — à migrer en DB plus tard
const templates = [
  {
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
  },
];

export async function GET() {
  return NextResponse.json(templates);
}