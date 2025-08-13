import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rateLimit";

function isStrongPassword(pw: string) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const rl = rateLimit({ key: `pwdchange:${session.user.id}`, windowMs: 10 * 60 * 1000, max: 5 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard" }, { status: 429 });
    }

    if (!isStrongPassword(newPassword)) {
      return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Impossible de changer le mot de passe pour ce compte" }, { status: 400 });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      await recordAudit({ userId: session.user.id, action: "password.change.failed", details: { reason: "bad_current" } });
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: session.user.id }, data: { password: hash } });
    await recordAudit({ userId: session.user.id, action: "password.change.success" });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


