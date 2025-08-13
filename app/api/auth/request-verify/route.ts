import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendMail } from "@/lib/email";
import { recordAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ success: true });

  const r = rateLimit({ key: `verify:${email}`, windowMs: 15 * 60 * 1000, max: 5 });
  if (!r.allowed) return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard." }, { status: 429 });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.emailVerificationToken.create({ data: { userId: user.id, token, expires } });
  await recordAudit({ userId: user.id, action: "email.verify.request" });

  const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify?token=${token}`;
  await sendMail(email, "Vérifiez votre email", `<p>Validez votre compte: <a href="${verifyUrl}">${verifyUrl}</a></p>`);
  return NextResponse.json({ success: true });
}


