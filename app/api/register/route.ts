import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendMail } from "@/lib/email";
import { NextResponse } from "next/server";
import { recordAudit } from "@/lib/audit";

function isStrongPassword(pw: string) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre." }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: "USER",
      },
    });

    // Crée et envoie le mail de vérification
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.emailVerificationToken.create({ data: { userId: user.id, token, expires } });
    await recordAudit({ userId: user.id, action: "email.verify.request" });

    const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify?token=${token}`;
    try {
      await sendMail(email, "Vérifiez votre email", `<p>Validez votre compte: <a href="${verifyUrl}">${verifyUrl}</a></p>`);
    } catch {}

    return NextResponse.json({ success: true, verifyEmailSent: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Impossible de créer l'utilisateur pour le moment.", details: error?.message ?? "" },
      { status: 500 }
    );
  }
}