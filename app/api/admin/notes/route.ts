import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const notes = await prisma.adminNote.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { userId, text } = await req.json();
  if (!userId || !text) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const note = await prisma.adminNote.create({ data: { userId, text, authorId: (session.user as any).id } as any });
  return NextResponse.json({ note });
}


