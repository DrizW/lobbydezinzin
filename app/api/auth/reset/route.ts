import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { recordAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const entry = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!entry || entry.expires < new Date()) {
    await recordAudit({ userId: entry?.userId, action: "password.reset.invalid_or_expired" });
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 });
  }

  // Vérification de complexité identique à l'inscription
  const strong = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
  if (!strong) {
    await recordAudit({ userId: entry.userId, action: "password.reset.weak_password" });
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre." }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: entry.userId }, data: { password: hash } });
  await prisma.passwordResetToken.delete({ where: { token } });
  await recordAudit({ userId: entry.userId, action: "password.reset.success" });
  return NextResponse.json({ success: true });
}


