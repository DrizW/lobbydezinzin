import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const secret = speakeasy.generateSecret({ name: "LobbyDeZinzin" });
  await prisma.user.update({ where: { id: session.user.id }, data: { twoFactorSecret: secret.base32 } });
  await recordAudit({ userId: session.user.id, action: "2fa.request" });

  const otpauth = secret.otpauth_url || speakeasy.otpauthURL({ secret: secret.ascii, label: session.user.id, issuer: "LobbyDeZinzin" });
  const qr = await QRCode.toDataURL(otpauth);
  return NextResponse.json({ qr, secret: secret.base32 });
}


