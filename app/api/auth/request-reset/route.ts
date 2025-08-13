import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendMail } from "@/lib/email";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  const r = rateLimit({ key: `reset:${email}`, windowMs: 15 * 60 * 1000, max: 5 });
  if (!r.allowed) return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard." }, { status: 429 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ success: true }); // Ne pas révéler

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.passwordResetToken.create({ data: { userId: user.id, token, expires } });
  await recordAudit({ userId: user.id, action: "password.reset.request" });

  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset?token=${token}`;
  try {
    await sendMail(email, "Réinitialisation de mot de passe", `<p>Réinitialisez votre mot de passe: <a href="${resetUrl}">${resetUrl}</a></p>`);
  } catch {
    // Ne pas révéler d'info; considérer comme succès côté UX même si l'envoi email échoue
  }
  return NextResponse.json({ success: true });
}


