import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { recordAudit } from "@/lib/audit";

function generateCodes(count: number): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(6).toString("hex").slice(0, 10).toUpperCase();
    codes.push(raw);
  }
  return codes;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const codes = generateCodes(10);
  const hashes = await Promise.all(codes.map(async c => ({ codeHash: await bcrypt.hash(c, 10) })));
  await prisma.twoFactorBackupCode.deleteMany({ where: { userId: session.user.id } });
  await prisma.twoFactorBackupCode.createMany({ data: hashes.map(h => ({ userId: session.user.id, codeHash: h.codeHash })) });
  await recordAudit({ userId: session.user.id, action: "2fa.backup_codes.generated" });
  // Ne jamais stocker/retourner les hashes côté client, seulement les codes en clair pour téléchargement unique
  return NextResponse.json({ codes });
}

