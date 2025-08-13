import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const userId = session.user.id;
  // Supprime les données liées, Prisma onDelete gère une partie
  await prisma.verificationToken.deleteMany({ where: { identifier: session.user.email || '' } }).catch(()=>{});
  await prisma.passwordResetToken.deleteMany({ where: { userId } }).catch(()=>{});
  await prisma.emailVerificationToken.deleteMany({ where: { userId } }).catch(()=>{});
  await prisma.adminNote.deleteMany({ where: { userId } }).catch(()=>{});
  await prisma.dNSLog.deleteMany({ where: { userId } }).catch(()=>{});
  await prisma.subscription.deleteMany({ where: { userId } }).catch(()=>{});
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}


