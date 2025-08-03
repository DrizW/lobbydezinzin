import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        kdValue: 'asc'
      }
    });

    return NextResponse.json(countries);
  } catch (error) {
    console.error("Erreur lors de la récupération des pays:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des pays" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, flag, kdRange, kdValue, description, dnsPrimary, dnsSecondary, color } = body;

    const country = await prisma.country.create({
      data: {
        name,
        flag,
        kdRange,
        kdValue: parseFloat(kdValue),
        description,
        dnsPrimary,
        dnsSecondary,
        color
      }
    });

    return NextResponse.json(country);
  } catch (error) {
    console.error("Erreur lors de la création du pays:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du pays" },
      { status: 500 }
    );
  }
} 