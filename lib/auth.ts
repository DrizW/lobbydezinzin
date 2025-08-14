import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import speakeasy from "speakeasy";
import { rateLimit } from "@/lib/rateLimit";
import { recordAudit } from "@/lib/audit";
import { getDeviceInfoFromRequest } from "@/lib/device-info";
import { notificationService } from "@/lib/notifications";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "Code 2FA", type: "text" },
        captchaToken: { label: "Captcha", type: "text" },
      },
      async authorize(credentials, req) {
        console.log("🔐 Tentative de connexion pour:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Email ou mot de passe manquant");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("👤 Utilisateur trouvé:", user ? "OUI" : "NON");
        if (user) {
          console.log("🔑 Mot de passe en base:", user.password ? "PRÉSENT" : "ABSENT");
        }

        if (!user || !user.password) {
          console.log("❌ Utilisateur non trouvé ou pas de mot de passe");
          return null;
        }

        // Rate limit par email + IP (si disponible)
        try {
          const ipHeader = (req as any)?.headers?.get?.("x-forwarded-for") || (req as any)?.headers?.get?.("x-real-ip") || "";
          const ip = Array.isArray(ipHeader) ? ipHeader[0] : String(ipHeader || "").split(",")[0].trim();
          const rl = rateLimit({ key: `login:${credentials.email}:${ip}`, windowMs: 15 * 60 * 1000, max: 10 });
          if (!rl.allowed) {
            await recordAudit({ userId: user?.id, action: "auth.signin.rate_limited", details: { email: credentials.email } });
            throw new Error("RATE_LIMITED");
          }
        } catch {}

        // Captcha (Turnstile) optionnel si secret présent
        try {
          const secret = process.env.TURNSTILE_SECRET;
          const response = (credentials as any)?.captchaToken as string | undefined;
          if (secret && response) {
            const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ secret, response }),
            });
            const data = await verify.json();
            if (!data.success) {
              await recordAudit({ userId: user?.id, action: "auth.signin.captcha_failed" });
              throw new Error("CAPTCHA_FAILED");
            }
          }
        } catch (e) {
          if (e instanceof Error && (e.message === "CAPTCHA_FAILED" || e.message === "RATE_LIMITED")) {
            throw e;
          }
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        console.log("🔍 Comparaison mot de passe:", isValid ? "CORRECT" : "INCORRECT");

        if (!isValid) {
          console.log("❌ Mot de passe incorrect");
          try { await recordAudit({ userId: user.id, action: "auth.signin.failed", details: { reason: "bad_password" } }); } catch {}
          return null;
        }

        // 2FA enforcement si activée
        if (user.twoFactorEnabled) {
          const token = (credentials as any)?.totp as string | undefined;
          let ok = false;
          if (token && user.twoFactorSecret) {
            ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: "base32", token, window: 1 });
            if (!ok) {
              // tenter codes de secours
              try {
                const codes = await prisma.twoFactorBackupCode.findMany({ where: { userId: user.id, used: false } });
                for (const entry of codes) {
                  const match = await bcrypt.compare(token, entry.codeHash);
                  if (match) {
                    ok = true;
                    await prisma.twoFactorBackupCode.update({ where: { id: entry.id }, data: { used: true, usedAt: new Date() } });
                    await recordAudit({ userId: user.id, action: "auth.signin.2fa_backup_used" });
                    break;
                  }
                }
              } catch {}
            }
          }
          if (!ok) {
            console.log("❌ 2FA requise ou code invalide");
            try { await recordAudit({ userId: user.id, action: "auth.signin.2fa_failed" }); } catch {}
            throw new Error("TWO_FACTOR_REQUIRED");
          }
        }

        console.log("✅ Connexion réussie pour:", user.email);
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/dashboard";
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Enregistrer la session après une connexion réussie
      if (user && account?.type === 'credentials') {
        try {
          const deviceInfo = getDeviceInfoFromRequest(credentials?.req as any);
          
          // Marquer toutes les autres sessions comme non-actuelles
          await prisma.userSession.updateMany({
            where: { userId: user.id },
            data: { isCurrent: false }
          });

          // Créer la nouvelle session
          await prisma.userSession.create({
            data: {
              userId: user.id,
              sessionToken: account.providerAccountId || `session_${Date.now()}`,
              isCurrent: true,
              deviceName: deviceInfo.deviceName,
              deviceType: deviceInfo.deviceType,
              browser: deviceInfo.browser,
              os: deviceInfo.os,
              ip: deviceInfo.ip
            }
          });

          // Enregistrer l'audit de nouvelle connexion
          await recordAudit({
            userId: user.id,
            action: 'NEW_LOGIN',
            req: credentials?.req as any,
            details: {
              deviceName: deviceInfo.deviceName,
              deviceType: deviceInfo.deviceType,
              browser: deviceInfo.browser,
              os: deviceInfo.os
            }
          });

          // Créer une notification de nouvelle connexion
          try {
            notificationService.createNewLoginNotification({
              deviceName: deviceInfo.deviceName,
              deviceType: deviceInfo.deviceType,
              browser: deviceInfo.browser,
              os: deviceInfo.os,
              ip: deviceInfo.ip
            });
          } catch (error) {
            console.error('Erreur lors de la création de la notification:', error);
          }
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement de la session:', error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key",
};