import { prisma } from "./prisma";
import type { NextRequest } from "next/server";

export type AuditDetails = Record<string, unknown> | null | undefined;

export async function recordAudit(params: {
  userId?: string | null;
  action: string;
  req?: NextRequest | Request | null;
  details?: AuditDetails;
}): Promise<void> {
  const { userId, action, req, details } = params;
  try {
    const headers = (req as any)?.headers;
    const ip = headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim()
      || headers?.get?.("x-real-ip")
      || undefined;
    const userAgent = headers?.get?.("user-agent") || undefined;
    await prisma.auditLog.create({
      data: {
        userId: userId ?? undefined,
        action,
        ip,
        userAgent,
        details: details ? (details as any) : undefined,
      },
    });
  } catch {
    // ne bloque jamais la requête si le log échoue
  }
}


